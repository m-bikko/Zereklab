import mongoose, { Document, Schema } from 'mongoose';

export interface ISalesStaff extends Document {
  username: string;
  password: string;
  fullName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

const SalesStaffSchema = new Schema<ISalesStaff>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster queries (username already unique, so no need for additional index)
SalesStaffSchema.index({ isActive: 1 });

const SalesStaff =
  mongoose.models.SalesStaff ||
  mongoose.model<ISalesStaff>('SalesStaff', SalesStaffSchema);

export default SalesStaff;
