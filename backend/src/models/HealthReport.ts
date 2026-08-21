import mongoose, { Schema } from 'mongoose';

const exposureSchema = new Schema(
  {
    meal: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'None', 'Not sure'], default: 'Not sure' },
    mess: { type: String, trim: true },
    foodItems: [{ type: String, trim: true }],
    waterSource: { type: String, trim: true },
    events: [{ type: String, trim: true }],
    places: [{ type: String, trim: true }],
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false },
);

const healthReportSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symptoms: [{ type: String, required: true, index: true }],
    severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'], required: true, index: true },
    onsetAt: { type: Date, required: true, index: true },
    hostel: { type: String, trim: true, index: true },
    block: { type: String, trim: true, index: true },
    exposure: { type: exposureSchema, default: {} },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'ASSOCIATED_WITH_CLUSTER', 'RESOLVED'],
      default: 'SUBMITTED',
      index: true,
    },
    analyticsSummary: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

healthReportSchema.index({ createdAt: -1 });
healthReportSchema.index({ hostel: 1, block: 1, createdAt: -1 });

export const HealthReport = mongoose.model('HealthReport', healthReportSchema);
