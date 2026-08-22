import mongoose, { Schema } from 'mongoose';

const advisorySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    severity: { type: String, enum: ['INFO', 'WATCH', 'SUSPICIOUS', 'HIGH_RISK'], default: 'INFO', index: true },
    targetRoles: [{ type: String, index: true }],
    targetHostel: { type: String, trim: true, index: true },
    targetBlock: { type: String, trim: true, index: true },
    sourceType: { type: String, enum: ['MESS', 'WATER', 'BLOCK', 'GENERAL'], default: 'GENERAL', index: true },
    sourceId: { type: String, trim: true, index: true },
    sourceName: { type: String, trim: true, index: true },
    status: { type: String, enum: ['ACTIVE', 'RESOLVED'], default: 'ACTIVE', index: true },
    duplicateKey: { type: String, trim: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

advisorySchema.index({ createdAt: -1 });

export const Advisory = mongoose.model('Advisory', advisorySchema);
