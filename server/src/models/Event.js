import mongoose from 'mongoose';

const statusEnum = ['upcoming', 'attending', 'maybe', 'declined'];

const eventSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    startAt: { type: Date, required: true },
    endAt: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          return this.startAt instanceof Date && value > this.startAt;
        },
        message: 'endAt must be after startAt'
      }
    },
    location: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    status: { type: String, enum: statusEnum, default: 'upcoming' },
    tags: { type: [String], default: [] }
  },
  { timestamps: true }
);

eventSchema.index({ ownerId: 1, startAt: 1 });
eventSchema.index({ title: 'text', location: 'text', description: 'text' });

export const Event = mongoose.model('Event', eventSchema);
export { statusEnum };
