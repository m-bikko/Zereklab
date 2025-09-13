'use client';

import { useLocale } from '@/hooks/useLocale';
import { formatAgeForDisplay } from '@/lib/ageUtils';
import { t } from '@/lib/i18n';
import { openWhatsAppOrder } from '@/lib/whatsapp';
import { useCartStore } from '@/store/cartStore';
import { IProduct } from '@/types';
import { getLocalizedText } from '@/types';

import { useState } from 'react';
import toast from 'react-hot-toast';

import Image from 'next/image';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  Package,
  Play,
  ShoppingCart,
  Star,
  Tag,
  X,
} from 'lucide-react';

import ImageModal from './ImageModal';

interface Props {
  product: IProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({
  product,
  isOpen,
  onClose,
}: Props) {
  const locale = useLocale();
  const { addItem } = useCartStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    if (!product || !product._id) return;
    
    const cartItem = {
      id: product._id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.images?.[0] || '/images/placeholder-product.svg',
      sku: product.sku,
    };

    addItem(cartItem);
    const productName = getLocalizedText(product.name, locale);
    toast.success(`${productName} ${t('cart.added', locale)}`);
    onClose();
  };

  const handleWhatsAppOrder = () => {
    if (!product || !product._id) return;
    
    // Create a cart item for single product order
    const singleProductItem = {
      id: product._id,
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

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
  };

  const nextImage = () => {
    if (product.images && product.images.length > 0) {
      setSelectedImageIndex(prev =>
        prev === (product.images?.length || 1) - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 0) {
      setSelectedImageIndex(prev =>
        prev === 0 ? (product.images?.length || 1) - 1 : prev - 1
      );
    }
  };

  const currentImage = product.images?.[selectedImageIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-lg bg-white shadow-xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full bg-white bg-opacity-90 p-2 text-gray-600 hover:bg-opacity-100 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Image Section */}
              <div className="relative bg-gray-50 p-6">
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
                    {currentImage ? (
                      <Image
                        src={currentImage}
                        alt={getLocalizedText(product.name, locale)}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            '/images/placeholder-product.svg';
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}

                    {/* Navigation buttons */}
                    {product.images && product.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white bg-opacity-80 p-2 text-gray-800 hover:bg-opacity-100"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white bg-opacity-80 p-2 text-gray-800 hover:bg-opacity-100"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    {/* Full screen button */}
                    {currentImage && (
                      <button
                        onClick={() => setIsImageModalOpen(true)}
                        className="absolute bottom-2 right-2 rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-70"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}

                    {/* Sale badge */}
                    {product.salePrice && (
                      <div className="absolute left-3 top-3">
                        <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                          -
                          {Math.round(
                            ((product.price - product.salePrice) /
                              product.price) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail images */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                            index === selectedImageIndex
                              ? 'border-primary-500'
                              : 'border-gray-200'
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${getLocalizedText(product.name, locale)} ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="64px"
                            onError={e => {
                              (e.target as HTMLImageElement).src =
                                '/images/placeholder-product.svg';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Video Section */}
                  {product.videoUrl && (
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowVideo(!showVideo)}
                        className="flex w-full items-center justify-center rounded-lg bg-gray-100 py-3 text-gray-700 hover:bg-gray-200"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {showVideo ? 'Скрыть видео' : 'Показать видео'}
                      </button>

                      {showVideo && getYouTubeEmbedUrl(product.videoUrl) && (
                        <div className="aspect-video overflow-hidden rounded-lg">
                          <iframe
                            src={getYouTubeEmbedUrl(product.videoUrl) || ''}
                            title="Product Video"
                            className="h-full w-full"
                            allowFullScreen
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details Section */}
              <div className="flex flex-col p-6">
                <div className="flex-1 space-y-6 overflow-y-auto">
                  {/* Header */}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                      {getLocalizedText(product.name, locale)}
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Tag className="mr-1 h-4 w-4" />
                        SKU: {product.sku}
                      </span>
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
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-3">
                    {product.salePrice ? (
                      <>
                        <span className="text-3xl font-bold text-red-600">
                          {product.salePrice.toLocaleString()} ₸
                        </span>
                        <span className="text-xl text-gray-500 line-through">
                          {product.price.toLocaleString()} ₸
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-gray-900">
                        {product.price.toLocaleString()} ₸
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center space-x-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        product.inStock ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        product.inStock ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {product.inStock
                        ? t('products.inStock', locale)
                        : t('products.outOfStock', locale)}
                    </span>
                    {product.stockQuantity !== undefined && product.inStock && (
                      <span className="text-sm text-gray-500">
                        ({product.stockQuantity} шт.)
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900">
                      {t('products.description', locale)}
                    </h3>
                    <p className="leading-relaxed text-gray-600">
                      {getLocalizedText(product.description, locale)}
                    </p>
                  </div>

                  {/* Features */}
                  {product.features && product.features.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-semibold text-gray-900">
                        {t('products.features', locale)}
                      </h3>
                      <ul className="space-y-2">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <div className="mr-3 mt-2 h-1.5 w-1.5 rounded-full bg-primary-500" />
                            <span className="text-gray-600">
                              {getLocalizedText(feature, locale)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Specifications */}
                  {product.specifications &&
                    Object.keys(product.specifications).length > 0 && (
                      <div>
                        <h3 className="mb-3 font-semibold text-gray-900">
                          {t('products.specifications', locale)}
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(product.specifications).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between border-b border-gray-100 pb-2"
                              >
                                <span className="text-gray-600">{key}:</span>
                                <span className="font-medium text-gray-900">
                                  {value}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-semibold text-gray-900">
                        {t('products.tags', locale)}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3 border-t pt-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex w-full items-center justify-center rounded-lg bg-primary-500 px-6 py-3 text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {product.inStock
                      ? t('products.addToCart', locale)
                      : t('products.outOfStock', locale)}
                  </button>

                  <button
                    onClick={handleWhatsAppOrder}
                    className="flex w-full items-center justify-center rounded-lg bg-green-500 px-6 py-3 text-white hover:bg-green-600"
                  >
                    <Package className="mr-2 h-5 w-5" />
                    {t('products.buyNow', locale)}
                  </button>
                </div>
              </div>
            </div>

            {/* Image Modal */}
            {isImageModalOpen && currentImage && product.images && (
              <ImageModal
                images={product.images}
                selectedIndex={selectedImageIndex}
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onPrevious={prevImage}
                onNext={nextImage}
                alt={getLocalizedText(product.name, locale)}
              />
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
