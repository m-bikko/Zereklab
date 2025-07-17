import mongoose, { Document, Model, Schema } from 'mongoose';

import { IMultilingualText } from './Product';

export interface ICategory {
  name: IMultilingualText;
  description?: IMultilingualText;
  subcategories?: IMultilingualText[];
  parameters?: { [key: string]: string[] };
  createdAt?: Date;
  updatedAt?: Date;
}

// Mongoose Document interface
export interface ICategoryDocument extends ICategory, Document {}

// Schema for multilingual text
const MultilingualTextSchema = new Schema(
  {
    ru: { type: String, required: true, trim: true },
    kk: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true },
  },
  { _id: false }
);

// Mongoose Schema for Category
const CategorySchema: Schema<ICategoryDocument> = new Schema(
  {
    name: {
      type: MultilingualTextSchema,
      required: [true, 'Category name is required'],
    },
    description: {
      type: MultilingualTextSchema,
    },
    subcategories: {
      type: [MultilingualTextSchema],
      default: [],
    },
    parameters: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'categories',
  }
);

// Create indexes for better query performance
CategorySchema.index({
  'name.ru': 'text',
  'name.kk': 'text',
  'name.en': 'text',
});
CategorySchema.index({ createdAt: -1 });

// Prevent recompilation of the model if it already exists
const Category: Model<ICategoryDocument> =
  mongoose.models.Category ||
  mongoose.model<ICategoryDocument>('Category', CategorySchema);

export default Category;
