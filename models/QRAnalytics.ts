import mongoose, { Document, Schema } from 'mongoose';

export interface IQRAnalytics extends Document {
  qrCode: string;
  redirectUrl: string;
  userAgent: string;
  ipAddress?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QRAnalyticsSchema = new Schema<IQRAnalytics>(
  {
    qrCode: {
      type: String,
      required: true,
      index: true,
    },
    redirectUrl: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
QRAnalyticsSchema.index({ qrCode: 1, timestamp: -1 });

const QRAnalytics = mongoose.models.QRAnalytics || mongoose.model<IQRAnalytics>('QRAnalytics', QRAnalyticsSchema);

export default QRAnalytics;