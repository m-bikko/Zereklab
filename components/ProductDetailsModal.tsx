'use client';

import { useLocale } from '@/hooks/useLocale';
import { formatAgeForDisplay } from '@/lib/ageUtils';
import { t } from '@/lib/i18n';
import { openWhatsAppOrder } from '@/lib/whatsapp';
import { useCartStore } from '@/store/cartStore';
import { IProduct } from '@/types';
import { getLocalizedText } from '@/types';

import { useEffect, useState } from 'react';
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative mx-2 w-full max-w-4xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Content */}
          <div className="relative flex h-[90vh] max-h-[600px] overflow-hidden rounded-xl bg-white shadow-2xl">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-2 top-2 z-20 rounded-full bg-white/80 p-1.5 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
            >
              <X className="h-4 w-4 text-gray-700" />
            </button>

            {/* Image Section */}
            <div className="relative w-full bg-gray-50 md:w-1/2">
              <div className="flex h-full flex-col p-3">
                {/* Main Image */}
                <div className="relative flex-1 overflow-hidden rounded-lg bg-white">
                  {currentImage ? (
                    <Image
                      src={currentImage}
                      alt={getLocalizedText(product.name, locale)}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          '/images/placeholder-product.svg';
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  {/* Image Navigation */}
                  {product.images && product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                      >
                        <ArrowLeft className="h-3 w-3 text-gray-700" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
                      >
                        <ArrowRight className="h-3 w-3 text-gray-700" />
                      </button>
                    </>
                  )}

                  {/* Fullscreen Button */}
                  {currentImage && (
                    <button
                      onClick={() => setIsImageModalOpen(true)}
                      className="absolute bottom-2 right-2 rounded-full bg-black/50 p-1.5 text-white transition-all hover:bg-black/70 hover:scale-110"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}

                  {/* Sale Badge */}
                  {product.salePrice && (
                    <div className="absolute left-2 top-2">
                      <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-md">
                        -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="mt-2 flex gap-1.5 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative h-10 w-10 flex-shrink-0 overflow-hidden rounded border-2 transition-all ${
                          index === selectedImageIndex
                            ? 'border-primary-500 scale-110'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="40px"
                          onError={e => {
                            (e.target as HTMLImageElement).src = '/images/placeholder-product.svg';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Video Button */}
                {product.videoUrl && (
                  <button
                    onClick={() => setShowVideo(!showVideo)}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    <Play className="h-3 w-3" />
                    {showVideo ? 'Скрыть видео' : 'Показать видео'}
                  </button>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="flex w-full flex-col md:w-1/2">
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 md:text-xl">
                      {getLocalizedText(product.name, locale)}
                    </h2>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        SKU: {product.sku}
                      </span>
                      {product.ageRange && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatAgeForDisplay(product.ageRange)}
                        </span>
                      )}
                      {product.difficulty && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {product.difficulty}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3">
                    {product.salePrice ? (
                      <>
                        <span className="text-xl font-bold text-red-600">
                          {product.salePrice.toLocaleString()} ₸
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {product.price.toLocaleString()} ₸
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-bold text-gray-900">
                        {product.price.toLocaleString()} ₸
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-2">
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
                    <h3 className="mb-2 text-sm font-semibold text-gray-900">
                      {t('products.description', locale)}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600">
                      {getLocalizedText(product.description, locale)}
                    </p>
                  </div>

                  {/* Features */}
                  {product.features && product.features.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-gray-900">
                        {t('products.features', locale)}
                      </h3>
                      <ul className="space-y-1">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="mt-1.5 h-1 w-1 rounded-full bg-primary-500" />
                            <span className="text-sm text-gray-600">
                              {getLocalizedText(feature, locale)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Specifications */}
                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-gray-900">
                        {t('products.specifications', locale)}
                      </h3>
                      <div className="space-y-1">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-sm text-gray-600">{key}:</span>
                            <span className="text-sm font-medium text-gray-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-gray-900">
                        {t('products.tags', locale)}
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Embed */}
                  {showVideo && product.videoUrl && getYouTubeEmbedUrl(product.videoUrl) && (
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
              </div>

              {/* Action Buttons */}
              <div className="border-t bg-gray-50 p-3">
                <div className="space-y-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {product.inStock
                      ? t('products.addToCart', locale)
                      : t('products.outOfStock', locale)}
                  </button>

                  <button
                    onClick={handleWhatsAppOrder}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-green-600"
                  >
                    <Package className="h-4 w-4" />
                    {t('products.buyNow', locale)}
                  </button>
                </div>
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
    </AnimatePresence>
  );
}
