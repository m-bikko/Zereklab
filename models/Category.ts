import mongoose, { Document, Model, Schema } from 'mongoose';

// Re-defining ICategory here for clarity, but it could also be imported
// if we ensure it's consistently defined, perhaps in a shared types file.
export interface ICategory extends Document {
  name: string;
  description?: string;
  subcategories: string[];
  // Parameters can be complex, for now, let's keep the structure
  // but UI for this might be simplified initially.
  parameters: Record<string, string[]>; 
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Название категории обязательно.'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subcategories: {
      type: [String],
      default: [],
    },
    parameters: {
      type: Schema.Types.Mixed, // Allows for flexible key-value pairs
      default: {},
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Prevent recompilation of the model if it already exists
const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category; 