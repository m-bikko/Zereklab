import { isProductSuitableForAge } from '@/lib/ageUtils';
import { getDatabase } from '@/lib/mongodb';
import Product, { IProduct, validateProduct } from '@/models/Product';

import { NextRequest, NextResponse } from 'next/server';

import mongoose, { FilterQuery, SortOrder } from 'mongoose';

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Получение списка товаров
 *     description: Получение списка товаров с фильтрацией, поиском и пагинацией
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 9
 *         description: Количество товаров на странице
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Категория товара
 *       - in: query
 *         name: subcategory
 *         schema:
 *           type: string
 *         description: Подкатегория товара
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Поисковый запрос
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Минимальная цена
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Максимальная цена
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Только товары в наличии
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [Beginner, Intermediate, Advanced]
 *         description: Уровень сложности
 *       - in: query
 *         name: ageRange
 *         schema:
 *           type: string
 *         description: Возрастная группа (например, "6-8" или "10" для возраста ребенка)
 *       - in: query
 *         name: sku
 *         schema:
 *           type: string
 *         description: Поиск по артикулу
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Поле для сортировки
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Порядок сортировки
 *       - in: query
 *         name: simple
 *         schema:
 *           type: boolean
 *         description: Упрощенный режим для админ-панели (без пагинации)
 *     responses:
 *       200:
 *         description: Успешное получение списка товаров
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 - $ref: '#/components/schemas/PaginatedProducts'
 *       500:
 *         description: Ошибка получения товаров
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     tags: [Products]
 *     summary: Создание нового товара
 *     description: Добавление нового товара в каталог
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка валидации данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Товар с такими данными уже существует
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Ошибка создания товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    await getDatabase(); // Ensure MongoDB connection
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');
    const difficulty = searchParams.get('difficulty');
    const ageRange = searchParams.get('ageRange');
    const sku = searchParams.get('sku'); // SKU search parameter
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const simple = searchParams.get('simple'); // For admin panel

    // Build filter object
    const filter: FilterQuery<IProduct> = {};

    if (category) {
      filter.category = category;
    }

    if (subcategory) {
      filter.subcategory = subcategory;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // Store child age for later filtering
    let childAge: number | null = null;
    if (ageRange) {
      childAge = parseInt(ageRange);
      // If it's not a valid child age number, treat it as legacy format
      if (isNaN(childAge) || childAge < 1 || childAge > 20) {
        // Legacy format support - keep old filtering logic for backward compatibility
        if (ageRange === '6-8') {
          filter.ageRange = {
            $regex: '^6-8$|^[1-8]$|^[1-8]\\+$',
            $options: 'i',
          };
        } else if (ageRange === '9-12') {
          filter.ageRange = {
            $regex: '^9-12$|^(9|10|11|12)$|^1[0-2]$|^(9|10|11|12)\\+$',
            $options: 'i',
          };
        } else if (ageRange === '13+') {
          filter.ageRange = {
            $regex:
              '^13\\+$|^1[3-9]\\+$|^[2-9][0-9]\\+?$|^(1[3-9]|[2-9][0-9])$',
            $options: 'i',
          };
        } else {
          filter.ageRange = ageRange;
        }
        childAge = null; // Reset for legacy filtering
      }
    }

    // SKU exact search has priority over general search
    if (sku) {
      // Exact SKU match for barcode scanner functionality
      filter.sku = { $regex: `^${sku}$`, $options: 'i' };
    } else if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }, // Include SKU in general search
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      filter.inStock = true;
    }

    const sort: Record<string, SortOrder> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // For admin panel, return all products without pagination
    if (simple === 'true') {
      let products = await Product.find(filter).sort(sort).lean();

      // Apply client-side age filtering if child age is specified
      if (childAge !== null) {
        const ageFilter = childAge;
        products = products.filter(product =>
          isProductSuitableForAge(product.ageRange || '', ageFilter)
        );
      }

      return NextResponse.json(products);
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination using Mongoose
    let products: IProduct[] = [];
    let total = 0;

    try {
      // If we have a child age filter, we need to get all products first then filter client-side
      if (childAge !== null) {
        // Get all products that match other filters
        const allProducts = await Product.find(filter).sort(sort).lean();

        // Apply age filtering client-side
        const ageFilter = childAge;
        const filteredProducts = allProducts.filter(product =>
          isProductSuitableForAge(product.ageRange || '', ageFilter)
        );

        total = filteredProducts.length;

        // Apply pagination to filtered results
        products = filteredProducts.slice(skip, skip + limit);
      } else {
        // Normal database filtering and pagination
        products = await Product.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(); // Return plain objects instead of Mongoose documents for better performance

        // Get total count for pagination
        total = await Product.countDocuments(filter);
      }
    } catch (mongoError) {
      console.error('MongoDB query error:', mongoError);
      // Return empty results if query fails due to invalid regex or other issues
      products = [];
      total = 0;
    }

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNextPage,
        hasPrevPage,
        limit,
      },
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await getDatabase(); // Ensure MongoDB connection
    const body = await request.json();

    // Validate product data
    const errors = validateProduct(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Handle salePrice - remove if null or 0
    const productData = { ...body };
    if (productData.salePrice === null || productData.salePrice === 0) {
      delete productData.salePrice;
    }

    // Create new product using Mongoose model
    const product = new Product(productData);
    const savedProduct = await product.save();

    return NextResponse.json(savedProduct, { status: 201 });
  } catch (error: unknown) {
    console.error('Failed to create product:', error);

    // Handle Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(
        (err: Error) => err.message
      );
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { error: 'Product with this data already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
