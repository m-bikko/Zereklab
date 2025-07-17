'use client';

import ImageModal from '@/components/ImageModal';
import { useLocale } from '@/hooks/useLocale';
import { formatAgeForDisplay } from '@/lib/ageUtils';
import { t } from '@/lib/i18n';
import {
  extractYouTubeVideoId,
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
} from '@/lib/youtube';
import { useCartStore } from '@/store/cartStore';
import { IProduct, getLocalizedText } from '@/types';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  Info,
  Layers,
  MessageCircle,
  Play,
  ShoppingCart,
  Star,
  Tag,
  UsersIcon,
  Zap,
  ZoomIn,
} from 'lucide-react';

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

export default function ProductPage() {
  const params = useParams();
  const locale = useLocale();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const { addItem } = useCartStore();
  const placeholderImage = '/images/placeholder-product.svg';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            toast.error(t('products.notFound', locale));
          } else {
            toast.error(t('products.loadError', locale));
          }
          setProduct(null);
          return;
        }

        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Ошибка при загрузке товара:', error);
        toast.error(t('products.loadErrorNetwork', locale));
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, locale]);

  const handleAddToCart = () => {
    if (product && product._id) {
      if (!product.inStock) {
        toast.error(t('products.unavailableStock', locale));
        return;
      }

      // Создаем объект для корзины с нужными полями
      const cartItem = {
        id: product._id,
        name: product.name,
        price: product.salePrice || product.price,
        image:
          product.images && product.images.length > 0 ? product.images[0] : '',
        sku: product.sku,
      };

      addItem(cartItem);
      const productName = getLocalizedText(product.name, locale);
      toast.success(
        `${productName} ${t('products.addedToCart', locale)}`
      );
    } else {
      toast.error(t('products.failedToAddToCart', locale));
    }
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;

    let message = `Здравствуйте! Меня интересует заказ товара "${getLocalizedText(product.name, locale)}" из ZerekLab.\n\n`;
    message += `Информация о товаре:\n`;
    message += `- Название: ${getLocalizedText(product.name, locale)}\n`;
    message += `- Цена: ₸${product.price.toLocaleString()}\n`;
    if (product.category) message += `- Категория: ${product.category}\n`;
    if (product.sku) message += `- Артикул: ${product.sku}\n`;
    message += `\nПожалуйста, предоставьте информацию о наличии и способах оплаты. Спасибо!`;

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-lg text-gray-600">
            {t('products.loading', locale)}
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <AlertTriangle className="mb-6 h-16 w-16 text-red-400" />
        <h1 className="mb-3 text-2xl font-bold text-gray-800">
          {t('products.notFound', locale)}
        </h1>
        <p className="mb-8 max-w-md text-gray-600">
          {t('products.productNotFoundDesc', locale)}
        </p>
        <Link
          href={`/${locale}/products`}
          className="rounded-lg bg-primary-500 px-8 py-3 text-lg font-medium text-white shadow-md transition-colors hover:bg-primary-600 hover:shadow-lg"
        >
          {t('products.toProductCatalog', locale)}
        </Link>
      </div>
    );
  }

  const productImages =
    product?.images && product.images.length > 0
      ? product.images.map(getImageSrc)
      : [placeholderImage];

  // YouTube video handling
  const videoId = product.videoUrl
    ? extractYouTubeVideoId(product.videoUrl)
    : null;
  const videoThumbnail = videoId
    ? getYouTubeThumbnailUrl(videoId, 'medium')
    : null;
  const videoEmbedUrl = videoId ? getYouTubeEmbedUrl(videoId) : null;

  // Combine images and video for gallery
  const galleryItems = [...productImages];
  if (videoThumbnail && !showVideo) {
    galleryItems.push(videoThumbnail);
  }

  const isVideoSelected =
    selectedImageIndex === productImages.length && videoThumbnail;

  const nextImage = () => {
    const totalItems = videoThumbnail
      ? productImages.length + 1
      : productImages.length;
    setSelectedImageIndex(prev => (prev === totalItems - 1 ? 0 : prev + 1));
    setShowVideo(false);
  };

  const prevImage = () => {
    const totalItems = videoThumbnail
      ? productImages.length + 1
      : productImages.length;
    setSelectedImageIndex(prev => (prev === 0 ? totalItems - 1 : prev - 1));
    setShowVideo(false);
  };

  const handleImageClick = () => {
    if (isVideoSelected) {
      setShowVideo(true);
    } else {
      setIsImageModalOpen(true);
    }
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowVideo(false);
  };

  const handlePreviousImage = () => {
    setSelectedImageIndex(prev => {
      const totalItems = videoThumbnail
        ? productImages.length + 1
        : productImages.length;
      return prev === 0 ? totalItems - 1 : prev - 1;
    });
  };

  const handleNextImage = () => {
    setSelectedImageIndex(prev => {
      const totalItems = videoThumbnail
        ? productImages.length + 1
        : productImages.length;
      return prev === totalItems - 1 ? 0 : prev + 1;
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-500 sm:mb-8">
            <Link href={`/${locale}`} className="hover:text-primary-600 hover:underline">
              {t('nav.home', locale)}
            </Link>
            <ChevronLeft className="h-4 w-4 rotate-180 text-gray-400" />
            <Link
              href={`/${locale}/products`}
              className="hover:text-primary-600 hover:underline"
            >
              {t('nav.products', locale)}
            </Link>
            <ChevronLeft className="h-4 w-4 rotate-180 text-gray-400" />
            <span className="max-w-xs truncate font-medium text-gray-700 sm:max-w-sm">
              {getLocalizedText(product.name, locale)}
            </span>
          </nav>

          <div className="rounded-xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              {/* Media Gallery */}
              <div className="space-y-4">
                <div className="group relative aspect-square overflow-hidden rounded-2xl bg-white shadow-lg">
                  {showVideo && videoEmbedUrl ? (
                    <div className="h-full w-full">
                      <iframe
                        src={videoEmbedUrl}
                        title={`${getLocalizedText(product.name, locale)} - ${t('products.videoInstruction', locale)}`}
                        className="h-full w-full rounded-2xl"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <>
                      <Image
                        src={
                          isVideoSelected && videoThumbnail
                            ? videoThumbnail
                            : productImages[selectedImageIndex]
                        }
                        alt={
                          getLocalizedText(product?.name, locale) ||
                          'Product image'
                        }
                        fill
                        className="cursor-pointer object-cover transition-transform duration-300 hover:scale-105"
                        priority
                        onClick={handleImageClick}
                        onError={e => {
                          (e.target as HTMLImageElement).src = placeholderImage;
                        }}
                      />

                      {/* Overlay for video */}
                      {isVideoSelected && (
                        <div
                          className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl bg-black bg-opacity-40 transition-all group-hover:bg-opacity-30"
                          onClick={handleImageClick}
                        >
                          <div className="rounded-full bg-white bg-opacity-90 p-6 transition-all group-hover:bg-opacity-100">
                            <Play className="ml-1 h-12 w-12 text-red-600" />
                          </div>
                        </div>
                      )}

                      {/* Zoom overlay for images */}
                      {!isVideoSelected && (
                        <div
                          className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-2xl bg-black bg-opacity-0 transition-all group-hover:bg-opacity-20"
                          onClick={handleImageClick}
                        >
                          <div className="rounded-full bg-white bg-opacity-0 p-4 transition-all group-hover:bg-opacity-90">
                            <ZoomIn className="h-8 w-8 text-gray-700 opacity-0 transition-opacity group-hover:opacity-100" />
                          </div>
                        </div>
                      )}

                      {/* Navigation arrows */}
                      {galleryItems.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                            aria-label={t('products.previousImage', locale)}
                          >
                            <ArrowLeft className="h-5 w-5 text-gray-700" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                            aria-label={t('products.nextImage', locale)}
                          >
                            <ArrowRight className="h-5 w-5 text-gray-700" />
                          </button>
                        </>
                      )}

                      {!product.inStock && (
                        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transform">
                          <span className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md sm:text-sm">
                            {t('products.outOfStock', locale)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {galleryItems.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2 pt-1 sm:space-x-3">
                    {productImages.map((image, index) => (
                      <button
                        key={`image-${index}`}
                        onClick={() => handleThumbnailClick(index)}
                        aria-label={`${t('products.showImage', locale)} ${index + 1}`}
                        className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 bg-gray-100 shadow-sm transition-all duration-200 hover:opacity-80 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:h-20 sm:w-20 sm:rounded-lg ${
                          selectedImageIndex === index && !showVideo
                            ? 'border-primary-500 ring-2 ring-primary-500 ring-offset-1'
                            : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${getLocalizedText(product?.name, locale)} ${t('products.thumbnail', locale)} ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                          onError={e => {
                            (e.target as HTMLImageElement).src =
                              placeholderImage;
                          }}
                        />
                      </button>
                    ))}

                    {/* Video Thumbnail */}
                    {videoThumbnail && (
                      <button
                        onClick={() =>
                          handleThumbnailClick(productImages.length)
                        }
                        aria-label={t('products.showVideoInstruction', locale)}
                        className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 bg-gray-100 shadow-sm transition-all duration-200 hover:opacity-80 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:h-20 sm:w-20 sm:rounded-lg ${
                          selectedImageIndex === productImages.length
                            ? 'border-primary-500 ring-2 ring-primary-500 ring-offset-1'
                            : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={videoThumbnail}
                          alt={t('products.videoInstruction', locale)}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black bg-opacity-40 sm:rounded-lg">
                          <Play className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Product Information */}
              <div className="space-y-6 lg:pt-2">
                <div>
                  <h1 className="mb-2 text-2xl font-bold leading-tight text-gray-800 sm:text-3xl lg:text-4xl">
                    {getLocalizedText(product.name, locale)}
                  </h1>
                  <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="text-3xl font-bold text-primary-600 lg:text-4xl">
                      ₸{product.price.toLocaleString()}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm sm:text-sm ${
                        product.inStock
                          ? 'border border-green-200 bg-green-100 text-green-700'
                          : 'border border-red-200 bg-red-100 text-red-700'
                      }`}
                    >
                      {product.inStock ? t('products.inStock', locale) : t('products.outOfStock', locale)}
                    </span>
                    {product.sku && (
                      <span className="text-xs text-gray-500">
                        Арт: {product.sku}
                      </span>
                    )}
                  </div>
                </div>

                <ProductDetailSection icon={Info} title={t('products.description', locale)}>
                  <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                    {getLocalizedText(product.description, locale) ||
                      t('products.noDescription', locale)}
                  </p>
                </ProductDetailSection>

                {product.features && product.features.length > 0 && (
                  <ProductDetailSection
                    icon={Star}
                    title={t('products.keyFeatures', locale)}
                  >
                    <ul className="list-inside space-y-2">
                      {product.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2.5"
                        >
                          <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                          <span className="text-gray-700">
                            {typeof feature === 'string'
                              ? feature
                              : getLocalizedText(feature, locale)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </ProductDetailSection>
                )}

                {product.specifications &&
                  Object.keys(product.specifications).length > 0 && (
                    <ProductDetailSection icon={Zap} title={t('products.specifications', locale)}>
                      <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                        {Object.entries(product.specifications).map(
                          ([key, value]) => (
                            <div key={key} className="flex">
                              <span className="w-2/5 font-medium capitalize text-gray-600">
                                {key.replace(/_/g, ' ')}:
                              </span>
                              <span className="w-3/5 text-gray-800">
                                {String(value)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </ProductDetailSection>
                  )}

                <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2 text-sm">
                  {product.category && (
                    <InfoPill
                      icon={Layers}
                      label={t('products.category', locale)}
                      value={product.category}
                    />
                  )}
                  {product.subcategory && (
                    <InfoPill
                      icon={Layers}
                      label={t('products.subcategory', locale)}
                      value={product.subcategory}
                    />
                  )}
                  {product.difficulty && (
                    <InfoPill
                      icon={Star}
                      label={t('products.difficulty', locale)}
                      value={product.difficulty}
                    />
                  )}
                  {product.ageRange && (
                    <InfoPill
                      icon={UsersIcon}
                      label={t('products.age', locale)}
                      value={formatAgeForDisplay(product.ageRange)}
                    />
                  )}
                  {product.tags && product.tags.length > 0 && (
                    <div className="col-span-full">
                      <InfoPill
                        icon={Tag}
                        label={t('products.tags', locale)}
                        value={product.tags.join(', ')}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3 border-t border-gray-200 pt-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex w-full items-center justify-center space-x-2.5 rounded-lg bg-primary-500 px-6 py-3.5 text-lg font-semibold text-white shadow-md transition-all duration-200 hover:bg-primary-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>
                      {product.inStock ? t('products.addToCart', locale) : t('products.outOfStock', locale)}
                    </span>
                  </button>
                  <button
                    onClick={handleWhatsAppOrder}
                    className="flex w-full items-center justify-center space-x-2.5 rounded-lg bg-green-500 px-6 py-3 text-lg font-semibold text-white shadow-md transition-all duration-200 hover:bg-green-600 hover:shadow-lg"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>{t('products.buyNow', locale)}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal for zoom */}
      <ImageModal
        images={productImages}
        selectedIndex={selectedImageIndex}
        isOpen={isImageModalOpen && !isVideoSelected}
        onClose={() => setIsImageModalOpen(false)}
        onPrevious={handlePreviousImage}
        onNext={handleNextImage}
        alt={getLocalizedText(product.name, locale)}
      />
    </>
  );
}

const ProductDetailSection = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-800">
        <Icon className="mr-2.5 h-5 w-5 text-primary-500" />
        {title}
      </h3>
      {children}
    </div>
  );
};

const InfoPill = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex items-center space-x-2 rounded-lg bg-gray-100 p-2">
    <Icon className="h-4 w-4 flex-shrink-0 text-gray-500" />
    <p className="text-xs text-gray-700">
      <span className="font-medium text-gray-600">{label}:</span> {value}
    </p>
  </div>
);