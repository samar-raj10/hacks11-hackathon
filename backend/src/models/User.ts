import mongoose, { Schema, type Document, type Model } from 'mongoose';

export const USER_ROLES = [
  'STUDENT',
  'HEALTH_ADMIN',
  'FACILITY_MANAGER',
  'SYSTEM_ADMIN',
  'PUBLIC_HEALTH_VIEWER',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  hostel?: string;
  block?: string;
  mess?: string;
  waterSource?: string;
  meal?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, default: 'STUDENT' },
    phone: { type: String, trim: true },
    hostel: { type: String, trim: true },
    block: { type: String, trim: true },
    mess: { type: String, trim: true },
    waterSource: { type: String, trim: true },
    meal: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
