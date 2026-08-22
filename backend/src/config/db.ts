import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { User } from '../models/User.js';

export const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/campusshield';

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
    await seedDemoUsers();
  } catch (error) {
    console.error('MongoDB connection failed:', error);
  }
};

const seedDemoUsers = async () => {
  const defaults = [
    { name: 'System Admin', email: 'admin@campusshield.local', password: 'Admin@123', role: 'SYSTEM_ADMIN' },
    { name: 'Health Admin', email: 'health@campusshield.local', password: 'Health@123', role: 'HEALTH_ADMIN' },
    { name: 'Facility Manager', email: 'facility@campusshield.local', password: 'Facility@123', role: 'FACILITY_MANAGER' },
    { name: 'Public Health Viewer', email: 'public@campusshield.local', password: 'Public@123', role: 'PUBLIC_HEALTH_VIEWER' },
    { name: 'Student Demo', email: 'student@campusshield.local', password: 'Student@123', role: 'STUDENT' },
  ] as const;

  for (const user of defaults) {
    const exists = await User.findOne({ email: user.email.toLowerCase() });
    if (!exists) {
      await User.create({
        name: user.name,
        email: user.email.toLowerCase(),
        passwordHash: await bcrypt.hash(user.password, 10),
        role: user.role,
        isActive: true,
      });
    }
  }
};
