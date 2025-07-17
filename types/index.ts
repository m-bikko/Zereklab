// Client-side type definitions (no Mongoose dependencies)

export interface IProduct {
  _id?: string;
  name: string | { ru: string; kk: string; en: string };
  description: string | { ru: string; kk: string; en: string };
  price: number;
  salePrice?: number;
  images?: string[];
  videoUrl?: string; // YouTube video URL for product demonstration
  category: string;
  subcategory?: string;
  inStock: boolean;
  features?: string[] | { ru: string; kk: string; en: string }[];
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

  const productName =
    typeof product.name === 'string' ? product.name : product.name?.ru || '';
  if (!productName.trim() || productName.trim().length < 2) {
    errors.push('Название товара должно содержать минимум 2 символа');
  }

  const productDescription =
    typeof product.description === 'string'
      ? product.description
      : product.description?.ru || '';
  if (!productDescription.trim() || productDescription.trim().length < 10) {
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

// Validation function for multilingual products
export const validateMultilingualProduct = (product: {
  name: { ru: string; kk: string; en: string };
  description: { ru: string; kk: string; en: string };
  price: number;
  category: string;
  sku: string;
}): string[] => {
  const errors: string[] = [];

  // Validate name in all languages
  if (!product.name.ru?.trim() || product.name.ru.trim().length < 2) {
    errors.push(
      'Название товара на русском должно содержать минимум 2 символа'
    );
  }
  if (!product.name.kk?.trim() || product.name.kk.trim().length < 2) {
    errors.push(
      'Название товара на казахском должно содержать минимум 2 символа'
    );
  }
  if (!product.name.en?.trim() || product.name.en.trim().length < 2) {
    errors.push(
      'Название товара на английском должно содержать минимум 2 символа'
    );
  }

  // Validate description in all languages
  if (
    !product.description.ru?.trim() ||
    product.description.ru.trim().length < 10
  ) {
    errors.push(
      'Описание товара на русском должно содержать минимум 10 символов'
    );
  }
  if (
    !product.description.kk?.trim() ||
    product.description.kk.trim().length < 10
  ) {
    errors.push(
      'Описание товара на казахском должно содержать минимум 10 символов'
    );
  }
  if (
    !product.description.en?.trim() ||
    product.description.en.trim().length < 10
  ) {
    errors.push(
      'Описание товара на английском должно содержать минимум 10 символов'
    );
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

// Helper function to get localized text from multilingual or simple string
export const getLocalizedText = (
  text: string | { ru: string; kk: string; en: string },
  locale: 'ru' | 'kk' | 'en' = 'ru'
): string => {
  if (typeof text === 'string') {
    return text;
  }
  if (typeof text === 'object' && text !== null) {
    return text[locale] || text.ru || '';
  }
  return '';
};
