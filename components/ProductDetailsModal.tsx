'use client';

import { useCartStore } from '@/store/cartStore';
import { IProduct } from '@/types';

import { useState } from 'react';
import toast from 'react-hot-toast';

import Image from 'next/image';
import { formatAgeRangeForDisplay } from '@/lib/ageUtils';
import { extractYouTubeVideoId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '@/lib/youtube';

import { ShoppingCart, X, Play, ZoomIn } from 'lucide-react';

import ImageModal from './ImageModal';

interface Props {
  product: IProduct;
  isOpen: boolean;
  onClose: () => void;
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

export default function ProductDetailsModal({
  product,
  isOpen,
  onClose,
}: Props) {
  const { addItem } = useCartStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    addItem(product);
    toast.success('Товар добавлен в корзину!');
    onClose();
  };

  const productImages =
    product.images && product.images.length > 0
      ? product.images.map(getImageSrc)
      : ['/images/placeholder-product.svg'];

  // YouTube video handling
  const videoId = product.videoUrl ? extractYouTubeVideoId(product.videoUrl) : null;
  const videoThumbnail = videoId ? getYouTubeThumbnailUrl(videoId, 'medium') : null;
  const videoEmbedUrl = videoId ? getYouTubeEmbedUrl(videoId) : null;

  // Combine images and video for gallery
  const galleryItems = [...productImages];
  if (videoThumbnail && !showVideo) {
    galleryItems.push(videoThumbnail);
  }

  const isVideoSelected = selectedImageIndex === productImages.length && videoThumbnail;

  const handlePreviousImage = () => {
    setSelectedImageIndex(prev => {
      const totalItems = videoThumbnail ? productImages.length + 1 : productImages.length;
      return prev === 0 ? totalItems - 1 : prev - 1;
    });
  };

  const handleNextImage = () => {
    setSelectedImageIndex(prev => {
      const totalItems = videoThumbnail ? productImages.length + 1 : productImages.length;
      return prev === totalItems - 1 ? 0 : prev + 1;
    });
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

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Media Gallery */}
              <div>
                <div className="space-y-4">
                  <div className="relative h-80 w-full group">
                    {showVideo && videoEmbedUrl ? (
                      <div className="h-full w-full">
                        <iframe
                          src={videoEmbedUrl}
                          title={`${product.name} - Видео инструкция`}
                          className="h-full w-full rounded-lg"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <>
                        <Image
                          src={isVideoSelected && videoThumbnail ? videoThumbnail : productImages[selectedImageIndex]}
                          alt={product.name}
                          fill
                          className="rounded-lg border border-gray-200 object-cover cursor-pointer transition-transform hover:scale-105"
                          onClick={handleImageClick}
                          onError={e => {
                            (e.target as HTMLImageElement).src =
                              '/images/placeholder-product.svg';
                          }}
                        />
                        
                        {/* Overlay for video */}
                        {isVideoSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg cursor-pointer group-hover:bg-opacity-30 transition-all"
                               onClick={handleImageClick}>
                            <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:bg-opacity-100 transition-all">
                              <Play className="h-8 w-8 text-red-600 ml-1" />
                            </div>
                          </div>
                        )}
                        
                        {/* Zoom overlay for images */}
                        {!isVideoSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg cursor-pointer transition-all"
                               onClick={handleImageClick}>
                            <div className="bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full p-3 transition-all">
                              <ZoomIn className="h-6 w-6 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {galleryItems.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {productImages.map((image, index) => (
                        <button
                          key={`image-${index}`}
                          onClick={() => handleThumbnailClick(index)}
                          className={`relative h-20 w-full rounded-lg border-2 transition-all ${
                            selectedImageIndex === index && !showVideo
                              ? 'border-primary-500 ring-2 ring-primary-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            fill
                            className="rounded-lg object-cover"
                            onError={e => {
                              (e.target as HTMLImageElement).src =
                                '/images/placeholder-product.svg';
                            }}
                          />
                        </button>
                      ))}
                      
                      {/* Video Thumbnail */}
                      {videoThumbnail && (
                        <button
                          onClick={() => handleThumbnailClick(productImages.length)}
                          className={`relative h-20 w-full rounded-lg border-2 transition-all ${
                            selectedImageIndex === productImages.length
                              ? 'border-primary-500 ring-2 ring-primary-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={videoThumbnail}
                            alt="Видео инструкция"
                            fill
                            className="rounded-lg object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Information */}
              <div className="space-y-6">
                <div>
                  <h1 className="mb-2 text-2xl font-bold text-gray-900">
                    {product.name}
                  </h1>
                  <p className="text-gray-600">{product.description}</p>
                </div>

                <div className="flex items-center space-x-4">
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

                {/* Product Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Категория:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {product.category}
                      </span>
                    </div>
                    {product.subcategory && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Подкатегория:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {product.subcategory}
                        </span>
                      </div>
                    )}
                    {product.ageRange && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Возраст:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {formatAgeRangeForDisplay(product.ageRange)}
                        </span>
                      </div>
                    )}
                    {product.difficulty && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Сложность:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {product.difficulty === 'Beginner'
                            ? 'Начинающий'
                            : product.difficulty === 'Intermediate'
                              ? 'Средний'
                              : 'Продвинутый'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  {product.features && product.features.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-medium text-gray-900">
                        Особенности:
                      </h3>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Specifications */}
                  {product.specifications && 
                    Object.keys(product.specifications).length > 0 && (
                    <div>
                      <h3 className="mb-2 font-medium text-gray-900">
                        Характеристики:
                      </h3>
                      <div className="text-sm">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-1">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-medium text-gray-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`flex flex-1 items-center justify-center space-x-2 rounded-lg px-6 py-3 font-medium transition-colors ${
                      product.inStock
                        ? 'bg-primary-500 text-white hover:bg-primary-600'
                        : 'cursor-not-allowed bg-gray-300 text-gray-500'
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>
                      {product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}
                    </span>
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
        alt={product.name}
      />
    </>
  );
}
