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
  },
  { timestamps: true },
);

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
