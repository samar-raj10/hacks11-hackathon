<<<<<<< HEAD
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
=======
import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import bcrypt from 'bcrypt';
import { roles } from '../types.js';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: roles, default: 'STUDENT', index: true },
    studentId: { type: String, trim: true },
    hostel: { type: String, trim: true, index: true },
    block: { type: String, trim: true, index: true },
    room: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
>>>>>>> 1e5f83279ff54e951d1ab9e6405460b3e20949de
  },
  { timestamps: true },
);

<<<<<<< HEAD
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
=======
userSchema.methods.comparePassword = function comparePassword(password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
};

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
  comparePassword(password: string): Promise<boolean>;
};

export const User = mongoose.model<any>('User', userSchema);
>>>>>>> 1e5f83279ff54e951d1ab9e6405460b3e20949de
