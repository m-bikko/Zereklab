import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IContact {
  name: string;
  whatsapp: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt?: Date;
  updatedAt?: Date;
}

// Mongoose Document interface
export interface IContactDocument extends IContact, Document {}

// Mongoose Schema for Contact
const ContactSchema: Schema<IContactDocument> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    whatsapp: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      trim: true,
      match: [
        /^\+?[1-9]\d{1,14}$/,
        'Please provide a valid WhatsApp number (e.g., +77753084648)',
      ],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied'],
      default: 'new',
    },
  },
  {
    timestamps: true,
    collection: 'contacts',
  }
);

// Create indexes for better query performance
ContactSchema.index({ createdAt: -1 });
ContactSchema.index({ status: 1 });
ContactSchema.index({ whatsapp: 1 });

// Prevent recompilation of the model if it already exists
const Contact: Model<IContactDocument> =
  mongoose.models.Contact ||
  mongoose.model<IContactDocument>('Contact', ContactSchema);

export default Contact; 