'use client';

import { useCartStore } from '@/store/cartStore';
import { IProduct } from '@/types';

import toast from 'react-hot-toast';

import Image from 'next/image';
import Link from 'next/link';

import { motion } from 'framer-motion';
import { AlertTriangle, Eye, ShoppingCart } from 'lucide-react';

interface ProductGridProps {
  products: IProduct[];
  viewMode: 'grid' | 'list';
}

// Helper function to get image from localStorage
const getStoredImage = (imageId: string): string | null => {
  try {
    const imageData = localStorage.getItem(`zereklab_image_${imageId}`);
    if (imageData) {
      const parsed = JSON.parse(imageData);
      return parsed.data;
    }
  } catch (error) {
    console.error('Error retrieving stored image:', error);
  }
  return null;
};

// Function to get image source (either stored locally or external URL)
const getImageSrc = (imageId: string): string => {
  // Check if it's a stored image ID
  if (imageId && imageId.startsWith('img_')) {
    const storedImage = getStoredImage(imageId);
    if (storedImage) {
      return storedImage;
    }
  }
  // Return as-is if it's a URL or fallback
  return imageId || '/images/placeholder-product.svg';
};

export default function ProductGrid({ products, viewMode }: ProductGridProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (product: IProduct) => {
    if (!product._id) {
      toast.error('Невозможно добавить товар: отсутствует ID товара.');
      return;
    }
    if (!product.inStock) {
      toast.error('Этого товара нет в наличии.');
      return;
    }
    addItem(product);
    toast.success(`${product.name} добавлен в корзину!`);
  };

  if (!products || products.length === 0) {
    return (
      <div className="rounded-lg bg-white py-16 text-center shadow-md">
        <AlertTriangle className="mx-auto mb-6 h-16 w-16 text-yellow-400" />
        <h3 className="mb-2 text-xl font-semibold text-gray-800">
          Товары не отображаются
        </h3>
        <p className="text-gray-500">
          Пожалуйста, проверьте подключение или попробуйте позже.
        </p>
      </div>
    );
  }

  const placeholderImage = '/images/placeholder-product.svg';

  return (
    <div
      className={`grid gap-6 ${
        viewMode === 'grid'
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-1'
      }`}
    >
      {products.map((product, index) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={`group overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-lg ${
            viewMode === 'list' ? 'flex' : 'flex flex-col'
          }`}
        >
          <div
            className={`relative overflow-hidden bg-gray-100 ${
              viewMode === 'list' ? 'h-32 w-32 flex-shrink-0' : 'aspect-square'
            }`}
          >
            <Image
              src={getImageSrc(product.images?.[0] || placeholderImage)}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={
                viewMode === 'list'
                  ? '128px'
                  : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
              }
              onError={e => {
                (e.target as HTMLImageElement).src = placeholderImage;
              }}
            />

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-20">
              <div className="flex h-full items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Link
                  href={`/products/${product._id}`}
                  className="rounded-full bg-white p-2 shadow-md transition-transform hover:scale-110"
                >
                  <Eye className="h-5 w-5 text-gray-700" />
                </Link>
              </div>
            </div>

            {/* Sale badge */}
            {product.salePrice && (
              <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
                Скидка
              </div>
            )}

            {/* Stock status */}
            {!product.inStock && (
              <div className="absolute right-2 top-2 rounded-full bg-gray-500 px-2 py-1 text-xs font-medium text-white">
                Нет в наличии
              </div>
            )}
          </div>

          <div className="flex flex-grow flex-col p-4">
            <Link href={`/products/${product._id}`} className="mb-1.5 block">
              <h3 className="line-clamp-2 h-12 font-semibold text-gray-800 transition-colors hover:text-primary-600">
                {product.name}
              </h3>
            </Link>
            {product.category && (
              <span className="mb-2 inline-block self-start rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-600">
                {product.category}
              </span>
            )}

            <div className="mt-auto">
              <div className="mb-3">
                {product.salePrice ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-red-600">
                      ₸{product.salePrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ₸{product.price.toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-xl font-bold text-primary-600">
                    ₸{product.price.toLocaleString()}
                  </span>
                )}
              </div>

              <button
                onClick={() => handleAddToCart(product)}
                disabled={!product.inStock}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-primary-600 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>{product.inStock ? 'В корзину' : 'Нет в наличии'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
