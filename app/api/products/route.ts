import { getDatabase } from '@/lib/mongodb';
import Product, { IProduct, validateProduct } from '@/models/Product';

import { NextRequest, NextResponse } from 'next/server';

import mongoose, { FilterQuery, SortOrder } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await getDatabase(); // Ensure MongoDB connection
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
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

    if (ageRange) {
      // Handle age range filtering with numeric logic
      if (ageRange === '6-8') {
        // Products for ages 6-8: exact match or overlapping ranges
        filter.ageRange = {
          $regex: '^6-8$|^[1-8]$',
          $options: 'i'
        };
      } else if (ageRange === '9-12') {
        // Products for ages 9-12: exact match or overlapping ranges  
        filter.ageRange = {
          $regex: '^9-12$|^(9|10|11|12)$|^1[0-2]$',
          $options: 'i'
        };
      } else if (ageRange === '13+') {
        // Products for ages 13+: exact match, numbers ≥13, or ranges starting from 13+
        filter.ageRange = {
          $regex: '^13\\+$|^1[3-9]\\+$|^[2-9][0-9]\\+?$|^(1[3-9]|[2-9][0-9])$',
          $options: 'i'
        };
      } else {
        // Fallback to exact match for other formats
        filter.ageRange = ageRange;
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
      const products = await Product.find(filter).sort(sort).lean();
      return NextResponse.json(products);
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination using Mongoose
    let products: IProduct[] = [];
    let total: number = 0;
    
    try {
      products = await Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(); // Return plain objects instead of Mongoose documents for better performance

      // Get total count for pagination
      total = await Product.countDocuments(filter);
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

    // Create new product using Mongoose model
    const product = new Product(body);
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
