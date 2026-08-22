import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['STUDENT_ADVISORY', 'HEALTH_ADMIN_ALERT', 'FACILITY_ALERT', 'SYSTEM_NOTIFICATION'], required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    readAt: { type: Date, default: null, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<any>('Notification', notificationSchema);
