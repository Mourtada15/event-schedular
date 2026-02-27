import mongoose from 'mongoose';

const aiUsageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    feature: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

aiUsageSchema.index({ userId: 1, createdAt: -1 });

export const AIUsage = mongoose.model('AIUsage', aiUsageSchema);
