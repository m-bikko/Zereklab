// Client-side type definitions (no Mongoose dependencies)

export interface IProduct {
  _id?: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images?: string[];
  category: string;
  subcategory?: string;
  inStock: boolean;
  features?: string[];
  specifications?: Record<string, string>;
  tags?: string[];
  sku: string;
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
  parameters?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICategory {
  _id?: string;
  name: string;
  description?: string;
  subcategories?: string[];
  parentCategory?: string;
  parameters?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Client-side validation function (no Mongoose dependencies)
export const validateProduct = (product: Partial<IProduct>): string[] => {
  const errors: string[] = [];

  if (!product.name?.trim() || product.name.trim().length < 2) {
    errors.push('Название товара должно содержать минимум 2 символа');
  }

  if (!product.description?.trim() || product.description.trim().length < 10) {
    errors.push('Описание товара должно содержать минимум 10 символов');
  }

  if (!product.price || product.price <= 0) {
    errors.push('Цена должна быть больше 0 ₸');
  }

  if (!product.category?.trim()) {
    errors.push('Категория обязательна');
  }

  if (!product.sku?.trim()) {
    errors.push('SKU обязателен');
  }

  return errors;
};

export const validateCategory = (category: Partial<ICategory>): string[] => {
  const errors: string[] = [];

  if (!category.name?.trim() || category.name.trim().length < 2) {
    errors.push('Название категории должно содержать минимум 2 символа');
  }

  return errors;
};
