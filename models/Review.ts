import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  _id: string;
  name: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    name: {
      type: String,
      required: [true, 'Имя обязательно'],
      trim: true,
      minlength: [2, 'Имя должно содержать минимум 2 символа'],
      maxlength: [50, 'Имя не должно превышать 50 символов'],
    },
    content: {
      type: String,
      required: [true, 'Текст отзыва обязателен'],
      trim: true,
      minlength: [10, 'Отзыв должен содержать минимум 10 символов'],
      maxlength: [1000, 'Отзыв не должен превышать 1000 символов'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ status: 1, createdAt: -1 });
ReviewSchema.index({ createdAt: -1 });

export default mongoose.models.Review ||
  mongoose.model<IReview>('Review', ReviewSchema);
