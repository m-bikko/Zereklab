import mongoose, { Document, Schema } from 'mongoose';

export interface IPendingBonus extends Document {
  phoneNumber: string;
  fullName?: string;
  saleId: string;
  bonusAmount: number;
  availableDate: Date;
  isProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PendingBonusSchema = new Schema<IPendingBonus>(
  {
    phoneNumber: {
      type: String,
      required: true,
      index: true,
      match: /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/,
    },
    fullName: {
      type: String,
      trim: true,
      index: true,
    },
    saleId: {
      type: String,
      required: true,
      ref: 'Sale',
      index: true,
    },
    bonusAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    availableDate: {
      type: Date,
      required: true,
      index: true,
    },
    isProcessed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
PendingBonusSchema.index({ phoneNumber: 1, availableDate: 1 });
PendingBonusSchema.index({ availableDate: 1, isProcessed: 1 });

const PendingBonus = mongoose.models.PendingBonus || mongoose.model<IPendingBonus>('PendingBonus', PendingBonusSchema);

export default PendingBonus;