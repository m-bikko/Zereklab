'use client';

import { formatAgeForDisplay } from '@/lib/ageUtils';
import { useCartStore } from '@/store/cartStore';
import { IProduct } from '@/types';

import toast from 'react-hot-toast';

import Image from 'next/image';
import Link from 'next/link';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Clock,
  Eye,
  Info,
  Package,
  ShoppingCart,
  Star,
  Tag,
} from 'lucide-react';

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

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl"
          >
            <div className="flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="relative h-48 w-full flex-shrink-0 overflow-hidden bg-gray-100 md:h-auto md:w-48 lg:w-56 xl:w-64">
                <Image
                  src={getImageSrc(product.images?.[0] || placeholderImage)}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 192px, (max-width: 1280px) 224px, 256px"
                  onError={e => {
                    (e.target as HTMLImageElement).src = placeholderImage;
                  }}
                />

                {/* Badges */}
                <div className="absolute left-3 top-3 flex flex-col gap-2">
                  {product.salePrice && (
                    <div className="rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white shadow-md">
                      Скидка
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="rounded-full bg-gray-500 px-2 py-1 text-xs font-medium text-white shadow-md">
                      Нет в наличии
                    </div>
                  )}
                </div>

                {/* Quick View Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-20">
                  <div className="flex h-full items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Link
                      href={`/products/${product._id}`}
                      className="rounded-full bg-white p-3 shadow-lg transition-transform hover:scale-110"
                    >
                      <Eye className="h-5 w-5 text-gray-700" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex min-h-[200px] flex-1 flex-col justify-between p-4 md:p-6">
                <div className="flex-1">
                  {/* Header */}
                  <div className="mb-3">
                    <Link href={`/products/${product._id}`}>
                      <h3 className="text-lg font-bold text-gray-900 transition-colors hover:text-primary-600 md:text-xl">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Category and SKU */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {product.category && (
                        <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                          <Tag className="mr-1 h-3 w-3" />
                          {product.category}
                        </span>
                      )}
                      {product.sku && (
                        <span className="text-xs text-gray-500">
                          Арт: {product.sku}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mb-4 line-clamp-2 text-sm text-gray-600 md:text-base">
                    {product.description}
                  </p>

                  {/* Product Details */}
                  <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:gap-3">
                    {product.difficulty && (
                      <div className="flex items-center text-xs text-gray-600">
                        <Star className="mr-2 h-4 w-4 text-yellow-500" />
                        <span className="font-medium">Сложность:</span>
                        <span className="ml-1 truncate">
                          {product.difficulty === 'Beginner'
                            ? 'Начинающий'
                            : product.difficulty === 'Intermediate'
                              ? 'Средний'
                              : 'Продвинутый'}
                        </span>
                      </div>
                    )}

                    {product.ageRange && (
                      <div className="flex items-center text-xs text-gray-600">
                        <Package className="mr-2 h-4 w-4 text-blue-500" />
                        <span className="font-medium">Возраст:</span>
                        <span className="ml-1">
                          {formatAgeForDisplay(product.ageRange)}
                        </span>
                      </div>
                    )}

                    {product.estimatedDelivery && (
                      <div className="flex items-center text-xs text-gray-600">
                        <Clock className="mr-2 h-4 w-4 text-green-500" />
                        <span className="font-medium">Доставка:</span>
                        <span className="ml-1 truncate">
                          {product.estimatedDelivery}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  {product.features && product.features.length > 0 && (
                    <div className="mb-4">
                      <div className="mb-2 flex items-center text-sm font-medium text-gray-700">
                        <Info className="mr-2 h-4 w-4" />
                        Особенности:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {product.features.slice(0, 3).map((feature, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700"
                          >
                            {feature}
                          </span>
                        ))}
                        {product.features.length > 3 && (
                          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500">
                            +{product.features.length - 3} ещё
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-auto space-y-4">
                  {/* Price and Stock */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      {product.salePrice ? (
                        <>
                          <span className="text-xl font-bold text-red-600 md:text-2xl">
                            ₸{product.salePrice.toLocaleString()}
                          </span>
                          <span className="text-base text-gray-500 line-through md:text-lg">
                            ₸{product.price.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-primary-600 md:text-2xl">
                          ₸{product.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}
                      ></div>
                      <span
                        className={`text-sm font-medium ${product.inStock ? 'text-green-700' : 'text-red-700'}`}
                      >
                        {product.inStock ? 'В наличии' : 'Нет в наличии'}
                      </span>
                      {product.stockQuantity !== undefined &&
                        product.inStock && (
                          <span className="text-sm text-gray-500">
                            ({product.stockQuantity} шт.)
                          </span>
                        )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <Link
                      href={`/products/${product._id}`}
                      className="flex flex-1 items-center justify-center rounded-lg border border-primary-300 px-4 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-50"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Подробнее
                    </Link>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      className="flex flex-1 items-center justify-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-primary-600 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-400 sm:flex-initial sm:px-6"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span className="truncate">
                        {product.inStock ? 'В корзину' : 'Нет в наличии'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Grid View (unchanged)
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-lg"
        >
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <Image
              src={getImageSrc(product.images?.[0] || placeholderImage)}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
