import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { signToken } from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import type { AuthRequest } from '../types.js';
import { writeAudit } from '../services/auditService.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  studentId: z.string().min(2).max(40),
  hostel: z.string().min(1).max(80),
  block: z.string().min(1).max(80),
  room: z.string().max(40).optional().default(''),
  contactNumber: z.string().max(40).optional().default(''),
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

function sanitizeUser(user: any) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    hostel: user.hostel,
    block: user.block,
    room: user.room,
  };
}

router.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: body.email.toLowerCase() });
    if (existing) throw new ApiError(409, 'Email is already registered');

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await User.create({ ...body, email: body.email.toLowerCase(), passwordHash, role: 'STUDENT' });
    const token = signToken({ sub: user._id.toString(), email: user.email, role: user.role });
    await writeAudit(req as AuthRequest, 'AUTH_REGISTER', 'User', user._id.toString(), { role: 'STUDENT' });
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await User.findOne({ email: body.email.toLowerCase(), isActive: true }).select('+passwordHash');
    if (!user) throw new ApiError(401, 'Invalid email or password');

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) throw new ApiError(401, 'Invalid email or password');

    const token = signToken({ sub: user._id.toString(), email: user.email, role: user.role });
    await writeAudit(req as AuthRequest, 'AUTH_LOGIN', 'User', user._id.toString());
    res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

export default router;
