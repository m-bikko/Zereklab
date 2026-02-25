import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IQuote {
  text: string;
  author: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuoteDocument extends IQuote, Document {}

const QuoteSchema: Schema<IQuoteDocument> = new Schema(
  {
    text: {
      type: String,
      required: [true, 'Quote text is required'],
      trim: true,
      minlength: [10, 'Quote text must be at least 10 characters long'],
      maxlength: [1000, 'Quote text must be less than 1000 characters'],
    },
    author: {
      type: String,
      required: [true, 'Quote author is required'],
      trim: true,
      maxlength: [200, 'Author name must be less than 200 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'quotes',
  }
);

// Create indexes for better query performance
QuoteSchema.index({ isActive: 1 });
QuoteSchema.index({ createdAt: -1 });

// Prevent recompilation of the model if it already exists
const Quote: Model<IQuoteDocument> =
  mongoose.models.Quote || mongoose.model<IQuoteDocument>('Quote', QuoteSchema);

export default Quote;
