import bcrypt from 'bcrypt';
import { Router } from 'express';
import { z } from 'zod';

import { requireAuth, signToken, type AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';

const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  phone: z.string().optional(),
  hostel: z.string().optional(),
  block: z.string().optional(),
  mess: z.string().optional(),
  waterSource: z.string().optional(),
  meal: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password is required.'),
});

const sanitizeUser = (user: any) => ({
  id: user._id?.toString?.() ?? user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  hostel: user.hostel,
  block: user.block,
  mess: user.mess,
  waterSource: user.waterSource,
  meal: user.meal,
  phone: user.phone,
  isActive: user.isActive,
});

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid registration data.' });
  }

  const { name, email, password, ...profile } = parsed.data;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'STUDENT',
    ...profile,
    isActive: true,
  });

  const token = signToken(user._id.toString(), user.role, user.email, user.name);

  return res.status(201).json({
    message: 'Registration successful.',
    token,
    user: sanitizeUser(user),
  });
});

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message ?? 'Invalid login data.' });
  }

  const { email, password } = parsed.data;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = signToken(user._id.toString(), user.role, user.email, user.name);

  return res.json({
    message: 'Login successful.',
    token,
    user: sanitizeUser(user),
  });
});

authRouter.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user?.id).select('-passwordHash');

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({ user: sanitizeUser(user) });
});

export default authRouter;
