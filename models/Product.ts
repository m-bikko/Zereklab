import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProduct {
  _id?: string
  name: string
  description: string
  price: number // Price in KZT (Kazakhstani Tenge)
  images: string[]
  category: string
  subcategory?: string
  inStock: boolean
  features?: string[]
  specifications?: { [key: string]: any }
  tags?: string[]
  sku?: string
  ageRange?: string
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
  relatedProducts?: string[]
  stockQuantity?: number
  dimensions?: {
    length: number
    width: number
    height: number
    weight: number
  }
  parameters?: { [key: string]: any }
  createdAt?: Date
  updatedAt?: Date
}

// Mongoose Document interface
export interface IProductDocument extends IProduct, Document {}

export interface ICategory {
  _id?: string
  name: string
  description?: string
  subcategories?: string[]
  parameters?: { [key: string]: string[] }
  createdAt?: Date
  updatedAt?: Date
}

export interface IProductFilter {
  category?: string
  subcategory?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  search?: string
  tags?: string[]
  ageRange?: string
  difficulty?: string
  specifications?: { [key: string]: any }
}

// Mongoose Schema for Product
const ProductSchema: Schema<IProductDocument> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters long'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minlength: [10, 'Product description must be at least 10 characters long'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Product price must be greater than 0'],
    },
    images: {
      type: [String],
      required: [true, 'At least one product image is required'],
      validate: {
        validator: function(images: string[]) {
          return images.length > 0;
        },
        message: 'At least one product image is required'
      }
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    features: {
      type: [String],
      default: [],
    },
    specifications: {
      type: Schema.Types.Mixed,
      default: {},
    },
    tags: {
      type: [String],
      default: [],
    },
    sku: {
      type: String,
      trim: true,
    },
    ageRange: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    relatedProducts: {
      type: [String],
      default: [],
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Stock quantity cannot be negative'],
    },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      weight: { type: Number, default: 0 },
    },
    parameters: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { 
    timestamps: true,
    collection: 'products' 
  }
);

// Create indexes for better query performance
ProductSchema.index({ name: 'text', description: 'text', category: 'text', tags: 'text' });
ProductSchema.index({ category: 1, subcategory: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ inStock: 1 });
ProductSchema.index({ createdAt: -1 });

// Prevent recompilation of the model if it already exists
const Product: Model<IProductDocument> = mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);

// Default categories - will be moved to database
export const defaultCategories = [
  {
    name: 'Electronics',
    subcategories: ['Sensors', 'Microcontrollers', 'Components', 'Kits'],
    parameters: {
      'Sensor Type': ['Temperature', 'Humidity', 'Motion', 'Light'],
      'Voltage': ['3.3V', '5V', '12V'],
      'Interface': ['I2C', 'SPI', 'UART', 'Digital', 'Analog']
    }
  },
  {
    name: 'Robotics',
    subcategories: ['Mobile Robots', 'Humanoid', 'Drones', 'Arms'],
    parameters: {
      'Control Method': ['Remote', 'Autonomous', 'Programmable'],
      'Power Source': ['Battery', 'Solar', 'USB'],
      'Material': ['Plastic', 'Metal', 'Wood', 'Carbon Fiber']
    }
  },
  {
    name: 'Programming',
    subcategories: ['Beginner Kits', 'Advanced', 'Game Development', 'Web Development'],
    parameters: {
      'Language': ['Python', 'JavaScript', 'Scratch', 'C++', 'Arduino IDE'],
      'Platform': ['Windows', 'Mac', 'Linux', 'Web', 'Mobile'],
      'Project Type': ['Games', 'Apps', 'Websites', 'IoT', 'AI']
    }
  },
  {
    name: 'Science',
    subcategories: ['Chemistry', 'Physics', 'Biology', 'Earth Science'],
    parameters: {
      'Experiment Type': ['Lab', 'Field', 'Demonstration', 'Research'],
      'Safety Level': ['Safe', 'Adult Supervision', 'Lab Required'],
      'Equipment Needed': ['Basic', 'Intermediate', 'Advanced']
    }
  },
  {
    name: 'Engineering',
    subcategories: ['Mechanical', 'Civil', 'Electrical', 'Software'],
    parameters: {
      'Build Complexity': ['Simple', 'Medium', 'Complex'],
      'Tools Required': ['None', 'Basic', 'Advanced'],
      'Materials': ['Cardboard', 'Wood', 'Metal', 'Plastic', '3D Printed']
    }
  },
  {
    name: 'Mathematics',
    subcategories: ['Geometry', 'Algebra', 'Statistics', 'Calculus'],
    parameters: {
      'Grade Level': ['Elementary', 'Middle School', 'High School', 'College'],
      'Learning Style': ['Visual', 'Hands-on', 'Digital', 'Traditional'],
      'Skill Focus': ['Problem Solving', 'Logic', 'Calculation', 'Modeling']
    }
  },
  {
    name: 'Art & Craft',
    subcategories: ['Digital Art', 'Traditional Art', 'Crafts', '3D Design'],
    parameters: {
      'Medium': ['Digital', 'Paint', 'Clay', 'Paper', 'Fabric', '3D Printing'],
      'Skill Level': ['Beginner', 'Intermediate', 'Advanced'],
      'Age Group': ['5-8', '9-12', '13-16', '17+']
    }
  }
] as const

export type ProductCategory = typeof defaultCategories[number]['name']

export const validateProduct = (product: Partial<IProduct>): string[] => {
  const errors: string[] = []
  
  if (!product.name || product.name.trim().length < 2) {
    errors.push('Product name must be at least 2 characters long')
  }
  
  if (!product.description || product.description.trim().length < 10) {
    errors.push('Product description must be at least 10 characters long')
  }
  
  if (!product.price || product.price <= 0) {
    errors.push('Product price must be greater than 0 KZT')
  }
  
  if (!product.category || product.category.trim().length === 0) {
    errors.push('Product category is required')
  }
  
  if (!product.images || product.images.length === 0) {
    errors.push('At least one product image is required')
  }
  
  return errors
}

export default Product; 