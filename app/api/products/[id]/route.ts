import { getDatabase } from '@/lib/mongodb';
import Product, { validateProduct } from '@/models/Product';

import { NextRequest, NextResponse } from 'next/server';

import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await getDatabase(); // Ensure MongoDB connection

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await Product.findById(params.id).lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await getDatabase(); // Ensure MongoDB connection
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Validate product data
    const errors = validateProduct(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const updateData = body;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    
    // Handle salePrice removal - if salePrice is null, explicitly unset it
    if (updateData.salePrice === null) {
      updateData.$unset = { salePrice: 1 };
      delete updateData.salePrice;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      updateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
      }
    ).lean();

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error: unknown) {
    console.error('Failed to update product:', error);

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

    // Handle cast errors (invalid ObjectId, etc.)
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await getDatabase(); // Ensure MongoDB connection

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(params.id);

    if (!deletedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Product deleted successfully',
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to delete product:', error);

    // Handle cast errors (invalid ObjectId, etc.)
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete product: ' + errorMessage },
      { status: 500 }
    );
  }
}
