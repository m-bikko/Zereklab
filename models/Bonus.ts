import mongoose, { Document, Schema } from 'mongoose';

export interface IBonus extends Document {
  phoneNumber: string;
  totalBonuses: number;
  usedBonuses: number;
  availableBonuses: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BonusSchema = new Schema<IBonus>(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/,
    },
    totalBonuses: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedBonuses: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableBonuses: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update availableBonuses before saving
BonusSchema.pre('save', function(next) {
  this.availableBonuses = this.totalBonuses - this.usedBonuses;
  this.lastUpdated = new Date();
  next();
});

const Bonus = mongoose.models.Bonus || mongoose.model<IBonus>('Bonus', BonusSchema);

export default Bonus;