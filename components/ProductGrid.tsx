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
      <div className="space-y-4 sm:space-y-6">
        {products.map((product, index) => (
          <motion.div
            key={product._id || `product-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Product Image */}
              <Link
                href={`/products/${product._id}`}
                className="group relative block h-48 flex-shrink-0 overflow-hidden bg-gray-100 sm:h-auto sm:w-48 md:w-56 lg:w-64"
              >
                <Image
                  src={product.images?.[0] || placeholderImage}
                  alt={product.name || 'Изображение товара'}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 192px, 256px"
                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                    <span className="rounded-md bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                      Нет в наличии
                    </span>
                  </div>
                )}
              </Link>

              {/* Product Info */}
              <div className="flex flex-1 flex-col justify-between p-4 sm:p-6">
                <div>
                  <Link
                    href={`/products/${product._id}`}
                    className="mb-1.5 block"
                  >
                    <h3 className="line-clamp-2 text-lg font-semibold text-gray-800 transition-colors hover:text-primary-600 lg:text-xl">
                      {product.name}
                    </h3>
                  </Link>
                  {product.category && (
                    <span className="mb-2 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-600">
                      {product.category}
                    </span>
                  )}
                  <p className="mb-3 line-clamp-3 text-sm text-gray-600 sm:line-clamp-2">
                    {product.description}
                  </p>
                </div>

                <div className="mt-auto flex flex-col pt-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="mb-3 sm:mb-0">
                    <span className="text-2xl font-bold text-primary-600 lg:text-3xl">
                      ₸{product.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="xs:flex-row xs:w-auto flex w-full flex-col gap-2 sm:gap-3">
                    <Link
                      href={`/products/${product._id}`}
                      className="xs:flex-none flex flex-1 items-center justify-center rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-200"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Смотреть
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      className="xs:flex-none flex flex-1 items-center justify-center rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-primary-600 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {product.inStock ? 'В корзину' : 'Нет в наличии'}
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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <motion.div
          key={product._id || `product-grid-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:shadow-xl"
        >
          <Link
            href={`/products/${product._id}`}
            className="aspect-w-1 aspect-h-1 group relative block w-full overflow-hidden bg-gray-100"
          >
            <Image
              src={product.images?.[0] || placeholderImage}
              alt={product.name || 'Изображение товара'}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
            {!product.inStock && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-60">
                <span className="rounded-md bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                  Нет в наличии
                </span>
              </div>
            )}
            <div className="absolute right-3 top-3 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="rounded-full bg-white p-2 shadow-md transition-colors hover:bg-gray-100">
                <Eye className="h-5 w-5 text-gray-700" />
              </div>
            </div>
          </Link>

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
                <span className="text-xl font-bold text-primary-600">
                  ₸{product.price.toLocaleString()}
                </span>
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
