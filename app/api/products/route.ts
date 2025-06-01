import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import Product, { IProduct, validateProduct } from '@/models/Product'

export async function GET(request: NextRequest) {
  try {
    await getDatabase() // Ensure MongoDB connection
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const inStock = searchParams.get('inStock')
    const difficulty = searchParams.get('difficulty')
    const ageRange = searchParams.get('ageRange')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build filter object
    const filter: any = {}
    
    if (category) {
      filter.category = category
    }
    
    if (subcategory) {
      filter.subcategory = subcategory
    }
    
    if (difficulty) {
      filter.difficulty = difficulty
    }
    
    if (ageRange) {
      filter.ageRange = ageRange
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = parseFloat(minPrice)
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
    }
    
    if (inStock === 'true') {
      filter.inStock = true
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Execute query with pagination using Mongoose
    const products = await Product
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean() // Return plain objects instead of Mongoose documents for better performance

    // Get total count for pagination
    const total = await Product.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        hasNextPage,
        hasPrevPage,
        limit
      }
    })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await getDatabase() // Ensure MongoDB connection
    const body = await request.json()
    
    // Validate product data
    const errors = validateProduct(body)
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    // Create new product using Mongoose model
    const product = new Product(body)
    const savedProduct = await product.save()
    
    return NextResponse.json(
      { message: 'Product created successfully', product: savedProduct },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Failed to create product:', error)
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Product with this data already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
} 