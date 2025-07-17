import mongoose, { Document, Model, Schema } from 'mongoose';

// Multilingual text interface
export interface IMultilingualText {
  ru: string;
  kk: string;
  en: string;
}

export interface IProduct {
  name: IMultilingualText;
  description: IMultilingualText;
  price: number; // Price in KZT (Kazakhstani Tenge)
  salePrice?: number; // Sale price in KZT
  images: string[];
  videoUrl?: string; // YouTube video URL for product demonstration
  category: string;
  subcategory?: string;
  inStock: boolean;
  features?: IMultilingualText[];
  specifications?: { [key: string]: any };
  tags?: string[];
  sku?: string;
  ageRange?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  relatedProducts?: string[];
  stockQuantity?: number;
  estimatedDelivery?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  parameters?: { [key: string]: any };
  createdAt?: Date;
  updatedAt?: Date;
}

// Mongoose Document interface
export interface IProductDocument extends IProduct, Document {}

export interface ICategory {
  _id?: string;
  name: IMultilingualText;
  description?: IMultilingualText;
  subcategories?: IMultilingualText[];
  parameters?: { [key: string]: string[] };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductFilter {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  tags?: string[];
  ageRange?: string;
  difficulty?: string;
  specifications?: { [key: string]: any };
  locale?: string; // Add locale for filtering
}

// Helper function to create multilingual text
export function createMultilingualText(
  ru: string,
  kk: string = ru,
  en: string = ru
): IMultilingualText {
  return { ru, kk, en };
}

// Helper function to get text by locale
export function getLocalizedText(
  text: IMultilingualText | string,
  locale: string = 'ru'
): string {
  if (typeof text === 'string') return text;
  if (!text) return '';

  const supportedLocales = ['ru', 'kk', 'en'];
  const targetLocale = supportedLocales.includes(locale) ? locale : 'ru';

  return text[targetLocale as keyof IMultilingualText] || text.ru || '';
}

// Schema for multilingual text
const MultilingualTextSchema = new Schema(
  {
    ru: { type: String, required: true, trim: true },
    kk: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true },
  },
  { _id: false }
);

// Mongoose Schema for Product
const ProductSchema: Schema<IProductDocument> = new Schema(
  {
    name: {
      type: MultilingualTextSchema,
      required: [true, 'Product name is required'],
    },
    description: {
      type: MultilingualTextSchema,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Product price must be greater than 0'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price must be greater than 0'],
    },
    images: {
      type: [String],
      default: [],
    },
    videoUrl: {
      type: String,
      trim: true,
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
      type: [MultilingualTextSchema],
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
      required: [true, 'SKU is required'],
      trim: true,
      unique: true,
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
    estimatedDelivery: {
      type: String,
      trim: true,
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
    collection: 'products',
  }
);

// Create indexes for better query performance
ProductSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  tags: 'text',
});
ProductSchema.index({ category: 1, subcategory: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ inStock: 1 });
ProductSchema.index({ createdAt: -1 });

// Prevent recompilation of the model if it already exists
const Product: Model<IProductDocument> =
  mongoose.models.Product ||
  mongoose.model<IProductDocument>('Product', ProductSchema);

// Default categories - will be moved to database
export const defaultCategories = [
  {
    name: createMultilingualText('Electronics', 'Электроника', 'Electronics'),
    subcategories: [
      createMultilingualText('Sensors', 'Датчики', 'Sensors'),
      createMultilingualText(
        'Microcontrollers',
        'Микроконтроллеры',
        'Microcontrollers'
      ),
      createMultilingualText('Components', 'Компоненты', 'Components'),
      createMultilingualText('Kits', 'Наборы', 'Kits'),
    ],
    parameters: {
      'Sensor Type': ['Temperature', 'Humidity', 'Motion', 'Light'],
      Voltage: ['3.3V', '5V', '12V'],
      Interface: ['I2C', 'SPI', 'UART', 'Digital', 'Analog'],
    },
  },
  {
    name: createMultilingualText('Robotics', 'Робототехника', 'Robotics'),
    subcategories: [
      createMultilingualText(
        'Mobile Robots',
        'Мобильные роботы',
        'Mobile Robots'
      ),
      createMultilingualText('Humanoid', 'Человекоподобные роботы', 'Humanoid'),
      createMultilingualText('Drones', 'Дроны', 'Drones'),
      createMultilingualText('Arms', 'Руки', 'Arms'),
    ],
    parameters: {
      'Control Method': ['Remote', 'Autonomous', 'Programmable'],
      'Power Source': ['Battery', 'Solar', 'USB'],
      Material: ['Plastic', 'Metal', 'Wood', 'Carbon Fiber'],
    },
  },
  {
    name: createMultilingualText(
      'Programming',
      'Программирование',
      'Programming'
    ),
    subcategories: [
      createMultilingualText(
        'Beginner Kits',
        'Наборы для начинающих',
        'Beginner Kits'
      ),
      createMultilingualText('Advanced', 'Продвинутый', 'Advanced'),
      createMultilingualText(
        'Game Development',
        'Разработка игр',
        'Game Development'
      ),
      createMultilingualText(
        'Web Development',
        'Веб-разработка',
        'Web Development'
      ),
    ],
    parameters: {
      Language: [
        createMultilingualText('Python', 'Python', 'Python'),
        createMultilingualText('JavaScript', 'JavaScript', 'JavaScript'),
        createMultilingualText('Scratch', 'Scratch', 'Scratch'),
        createMultilingualText('C++', 'C++', 'C++'),
        createMultilingualText('Arduino IDE', 'Arduino IDE', 'Arduino IDE'),
      ],
      Platform: ['Windows', 'Mac', 'Linux', 'Web', 'Mobile'],
      'Project Type': ['Games', 'Apps', 'Websites', 'IoT', 'AI'],
    },
  },
  {
    name: createMultilingualText('Science', 'Наука', 'Science'),
    subcategories: [
      createMultilingualText('Chemistry', 'Химия', 'Chemistry'),
      createMultilingualText('Physics', 'Физика', 'Physics'),
      createMultilingualText('Biology', 'Биология', 'Biology'),
      createMultilingualText('Earth Science', 'Наука о Земле', 'Earth Science'),
    ],
    parameters: {
      'Experiment Type': ['Lab', 'Field', 'Demonstration', 'Research'],
      'Safety Level': ['Safe', 'Adult Supervision', 'Lab Required'],
      'Equipment Needed': ['Basic', 'Intermediate', 'Advanced'],
    },
  },
  {
    name: createMultilingualText(
      'Engineering',
      'Инженерное дело',
      'Engineering'
    ),
    subcategories: [
      createMultilingualText('Mechanical', 'Механическое', 'Mechanical'),
      createMultilingualText('Civil', 'Гражданское', 'Civil'),
      createMultilingualText('Electrical', 'Электрическое', 'Electrical'),
      createMultilingualText('Software', 'Программное обеспечение', 'Software'),
    ],
    parameters: {
      'Build Complexity': ['Simple', 'Medium', 'Complex'],
      'Tools Required': ['None', 'Basic', 'Advanced'],
      Materials: ['Cardboard', 'Wood', 'Metal', 'Plastic', '3D Printed'],
    },
  },
  {
    name: createMultilingualText('Mathematics', 'Математика', 'Mathematics'),
    subcategories: [
      createMultilingualText('Geometry', 'Геометрия', 'Geometry'),
      createMultilingualText('Algebra', 'Алгебра', 'Algebra'),
      createMultilingualText('Statistics', 'Статистика', 'Statistics'),
      createMultilingualText('Calculus', 'Математический анализ', 'Calculus'),
    ],
    parameters: {
      'Grade Level': ['Elementary', 'Middle School', 'High School', 'College'],
      'Learning Style': ['Visual', 'Hands-on', 'Digital', 'Traditional'],
      'Skill Focus': ['Problem Solving', 'Logic', 'Calculation', 'Modeling'],
    },
  },
  {
    name: createMultilingualText(
      'Art & Craft',
      'Искусство и ремесло',
      'Art & Craft'
    ),
    subcategories: [
      createMultilingualText(
        'Digital Art',
        'Цифровое искусство',
        'Digital Art'
      ),
      createMultilingualText(
        'Traditional Art',
        'Традиционное искусство',
        'Traditional Art'
      ),
      createMultilingualText('Crafts', 'Хобби', 'Crafts'),
      createMultilingualText('3D Design', '3D дизайн', '3D Design'),
    ],
    parameters: {
      Medium: [
        createMultilingualText('Digital', 'Цифровой', 'Digital'),
        createMultilingualText('Paint', 'Краски', 'Paint'),
        createMultilingualText('Clay', 'Глина', 'Clay'),
        createMultilingualText('Paper', 'Бумага', 'Paper'),
        createMultilingualText('Fabric', 'Ткань', 'Fabric'),
        createMultilingualText('3D Printing', '3D печать', '3D Printing'),
      ],
      'Skill Level': ['Beginner', 'Intermediate', 'Advanced'],
      'Age Group': ['5-8', '9-12', '13-16', '17+'],
    },
  },
] as const;

export type ProductCategory = (typeof defaultCategories)[number]['name'];

export const validateProduct = (product: Partial<IProduct>): string[] => {
  const errors: string[] = [];

  // Validate multilingual name
  if (!product.name) {
    errors.push('Product name is required');
  } else {
    if (!product.name.ru || product.name.ru.trim().length < 2) {
      errors.push('Product name (Russian) must be at least 2 characters long');
    }
    if (!product.name.kk || product.name.kk.trim().length < 2) {
      errors.push('Product name (Kazakh) must be at least 2 characters long');
    }
    if (!product.name.en || product.name.en.trim().length < 2) {
      errors.push('Product name (English) must be at least 2 characters long');
    }
  }

  // Validate multilingual description
  if (!product.description) {
    errors.push('Product description is required');
  } else {
    if (!product.description.ru || product.description.ru.trim().length < 10) {
      errors.push(
        'Product description (Russian) must be at least 10 characters long'
      );
    }
    if (!product.description.kk || product.description.kk.trim().length < 10) {
      errors.push(
        'Product description (Kazakh) must be at least 10 characters long'
      );
    }
    if (!product.description.en || product.description.en.trim().length < 10) {
      errors.push(
        'Product description (English) must be at least 10 characters long'
      );
    }
  }

  if (!product.price || product.price <= 0) {
    errors.push('Product price must be greater than 0 KZT');
  }

  if (!product.category || product.category.trim().length === 0) {
    errors.push('Product category is required');
  }

  if (!product.sku || product.sku.trim().length === 0) {
    errors.push('Product SKU is required');
  }

  // Images are optional for now, but if provided should be valid
  if (product.images && product.images.length === 0) {
    // Allow empty images array, but warn
    console.warn('Product created without images');
  }

  return errors;
};

export default Product;
