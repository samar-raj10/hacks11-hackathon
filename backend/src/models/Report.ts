import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IReport extends Document {
  studentId: mongoose.Types.ObjectId;
  symptoms: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  onsetDateTime: Date;
  hostel?: string;
  block?: string;
  meal?: string;
  mess?: string;
  waterSource?: string;
  otherExposureInfo?: string;
  status: 'PENDING' | 'REVIEWED' | 'FLAGGED';
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    symptoms: { type: String, required: true, trim: true },
    severity: { type: String, enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'], default: 'MODERATE' },
    onsetDateTime: { type: Date, required: true },
    hostel: { type: String, trim: true },
    block: { type: String, trim: true },
    meal: { type: String, trim: true },
    mess: { type: String, trim: true },
    waterSource: { type: String, trim: true },
    otherExposureInfo: { type: String, trim: true },
    status: { type: String, enum: ['PENDING', 'REVIEWED', 'FLAGGED'], default: 'PENDING' },
  },
  { timestamps: true },
);

export const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>('Report', reportSchema);
