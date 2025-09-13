'use client';

import { useLocale } from '@/hooks/useLocale';
import { formatAgeForDisplay } from '@/lib/ageUtils';
import { t } from '@/lib/i18n';
import { openWhatsAppOrder } from '@/lib/whatsapp';
import { useCartStore } from '@/store/cartStore';
import { getLocalizedText } from '@/types';
import { IProduct } from '@/types';

import toast from 'react-hot-toast';

import Image from 'next/image';
import Link from 'next/link';

import { motion } from 'framer-motion';
import { Clock, Eye, Package, ShoppingCart, Star, Tag } from 'lucide-react';

interface ProductGridProps {
  products: IProduct[];
  viewMode: 'grid' | 'list';
}

export default function ProductGrid({ products, viewMode }: ProductGridProps) {
  const { addItem } = useCartStore();
  const locale = useLocale();

  const handleAddToCart = (product: IProduct) => {
    const cartItem = {
      id: product._id!,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.images?.[0] || '/images/placeholder-product.svg',
      sku: product.sku,
    };

    addItem(cartItem);
    const productName = getLocalizedText(product.name, locale);
    toast.success(`${productName} ${t('cart.added', locale)}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleQuickView = (product: IProduct) => {
    // This will be implemented later with a modal
    toast.success('Быстрый просмотр будет доступен в ближайшее время');
  };

  const handleWhatsAppOrder = (product: IProduct) => {
    // Create a cart item for single product order
    const singleProductItem = {
      id: product._id!,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.images?.[0] || '/images/placeholder-product.svg',
      quantity: 1,
      sku: product.sku,
    };

    try {
      openWhatsAppOrder([singleProductItem], locale);
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      // Fallback to simple message
      const productName = getLocalizedText(product.name, locale);
      const price = product.salePrice || product.price;
      const message = `Здравствуйте! Меня интересует товар: ${productName}\nЦена: ${price} ₸\nSKU: ${product.sku}`;
      const whatsappUrl = `https://wa.me/77753084648?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {t('products.noProducts', locale)}
          </h3>
          <p className="mt-2 text-gray-500">
            {t('products.noProductsDesc', locale)}
          </p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {products.map(product => (
          <motion.div
            key={product._id}
            variants={itemVariants}
            className="flex overflow-hidden rounded-lg bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl"
          >
            <div className="relative h-48 w-48 flex-shrink-0 sm:h-64 sm:w-64">
              <Image
                src={product.images?.[0] || '/images/placeholder-product.svg'}
                alt={getLocalizedText(product.name, locale)}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 192px, 256px"
                onError={e => {
                  (e.target as HTMLImageElement).src =
                    '/images/placeholder-product.svg';
                }}
              />
              {product.salePrice && (
                <div className="absolute left-3 top-3">
                  <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                    -
                    {Math.round(
                      ((product.price - product.salePrice) / product.price) *
                        100
                    )}
                    %
                  </span>
                </div>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <span className="rounded-lg bg-red-600 px-3 py-1 text-sm font-semibold text-white">
                    {t('products.outOfStock', locale)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    <Link
                      href={`/${locale}/products/${product._id}`}
                      className="hover:text-primary-600"
                    >
                      {getLocalizedText(product.name, locale)}
                    </Link>
                  </h3>
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => handleQuickView(product)}
                      className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                      title={t('products.quickView', locale)}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  {product.ageRange && (
                    <span className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {formatAgeForDisplay(product.ageRange)}
                    </span>
                  )}
                  {product.difficulty && (
                    <span className="flex items-center">
                      <Star className="mr-1 h-4 w-4" />
                      {product.difficulty}
                    </span>
                  )}
                  <span className="flex items-center">
                    <Tag className="mr-1 h-4 w-4" />
                    SKU: {product.sku}
                  </span>
                </div>

                <p className="mt-3 line-clamp-3 text-gray-600">
                  {getLocalizedText(product.description, locale)}
                </p>

                {product.features && product.features.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      {t('products.keyFeatures', locale)}:
                    </h4>
                    <ul className="mt-2 space-y-1">
                      {product.features.slice(0, 3).map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary-500"></div>
                          {getLocalizedText(feature, locale)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex flex-col">
                  {product.salePrice ? (
                    <>
                      <span className="text-lg font-bold text-red-600">
                        {product.salePrice.toLocaleString()} ₸
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {product.price.toLocaleString()} ₸
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">
                      {product.price.toLocaleString()} ₸
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className="flex items-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {t('products.addToCart', locale)}
                  </button>
                  <button
                    onClick={() => handleWhatsAppOrder(product)}
                    className="flex items-center rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                  >
                    {t('products.buyNow', locale)}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {products.map(product => (
        <motion.div
          key={product._id}
          variants={itemVariants}
          className="group relative overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.images?.[0] || '/images/placeholder-product.svg'}
              alt={getLocalizedText(product.name, locale)}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={e => {
                (e.target as HTMLImageElement).src =
                  '/images/placeholder-product.svg';
              }}
            />
            {product.salePrice && (
              <div className="absolute left-3 top-3">
                <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                  -
                  {Math.round(
                    ((product.price - product.salePrice) / product.price) * 100
                  )}
                  %
                </span>
              </div>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <span className="rounded-lg bg-red-600 px-3 py-1 text-sm font-semibold text-white">
                  {t('products.outOfStock', locale)}
                </span>
              </div>
            )}
            <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <button
                onClick={() => handleQuickView(product)}
                className="rounded-full bg-white bg-opacity-90 p-2 text-gray-600 hover:bg-opacity-100"
                title={t('products.quickView', locale)}
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-2 flex items-start justify-between">
              <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">
                <Link
                  href={`/${locale}/products/${product._id}`}
                  className="hover:text-primary-600"
                >
                  {getLocalizedText(product.name, locale)}
                </Link>
              </h3>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              {product.ageRange && (
                <span className="flex items-center rounded-full bg-gray-100 px-2 py-1">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatAgeForDisplay(product.ageRange)}
                </span>
              )}
              {product.difficulty && (
                <span className="flex items-center rounded-full bg-gray-100 px-2 py-1">
                  <Star className="mr-1 h-3 w-3" />
                  {product.difficulty}
                </span>
              )}
            </div>

            <p className="mb-4 line-clamp-2 text-sm text-gray-600">
              {getLocalizedText(product.description, locale)}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                {product.salePrice ? (
                  <>
                    <span className="text-lg font-bold text-red-600">
                      {product.salePrice.toLocaleString()} ₸
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {product.price.toLocaleString()} ₸
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-gray-900">
                    {product.price.toLocaleString()} ₸
                  </span>
                )}
              </div>

              <div className="flex space-x-1">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock}
                  className="rounded-lg bg-primary-500 p-2 text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                  title={t('products.addToCart', locale)}
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleWhatsAppOrder(product)}
                  className="rounded-lg bg-green-500 p-2 text-white hover:bg-green-600"
                  title={t('products.buyNow', locale)}
                >
                  <Package className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
