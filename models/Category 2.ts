import mongoose, { Schema, Document, models, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  subcategories?: string[];
  parameters?: { [key: string]: string[] };
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema: Schema<ICategory> = new Schema({
  name: {
    type: String,
    required: [true, 'Название категории обязательно.'],
    unique: true,
    trim: true,
    minlength: [2, 'Название категории должно содержать не менее 2 символов.']
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
    type: Schema.Types.Mixed, // Allows for a flexible object structure
    default: {},
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Prevent model recompilation in Next.js hot-reloading environments
const Category: Model<ICategory> = models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;

// Helper function to validate category data (similar to validateProduct)
export const validateCategory = (category: Partial<ICategory>): string[] => {
  const errors: string[] = [];
  if (!category.name || category.name.trim().length < 2) {
    errors.push('Название категории должно содержать не менее 2 символов.');
  }
  // Add more validation rules as needed (e.g., for description, subcategories format)
  return errors;
}; 