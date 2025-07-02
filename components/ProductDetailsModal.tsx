'use client';

import { useCartStore } from '@/store/cartStore';
import { IProduct } from '@/types';

import { useState } from 'react';
import toast from 'react-hot-toast';

import Image from 'next/image';

import { ShoppingCart, X } from 'lucide-react';

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

  if (!isOpen) return null;

  const handleAddToCart = () => {
    addItem(product);
    toast.success('Товар добавлен в корзину!');
    onClose();
  };

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : ['/images/placeholder-product.svg'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white">
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
            {/* Изображения товара */}
            <div>
              <div className="space-y-4">
                <div className="relative h-80 w-full">
                  <Image
                    src={getImageSrc(productImages[selectedImageIndex])}
                    alt={product.name}
                    fill
                    className="rounded-lg border border-gray-200 object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        '/images/placeholder-product.svg';
                    }}
                  />
                </div>

                {/* Дополнительные изображения */}
                {productImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative h-20 w-full rounded-lg border-2 transition-all ${
                          selectedImageIndex === index
                            ? 'border-primary-500 ring-2 ring-primary-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Image
                          src={getImageSrc(image)}
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
                  </div>
                )}
              </div>
            </div>

            {/* Информация о товаре */}
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

              {/* Характеристики */}
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
                        {product.ageRange}
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

                {/* Особенности */}
                {product.features && product.features.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-medium text-gray-700">
                      Особенности:
                    </h3>
                    <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Теги */}
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <h3 className="mb-2 font-medium text-gray-700">Теги:</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Статус наличия */}
              <div className="flex items-center space-x-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    product.inStock ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    product.inStock ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {product.inStock ? 'В наличии' : 'Нет в наличии'}
                </span>
                {product.stockQuantity !== undefined && product.inStock && (
                  <span className="text-sm text-gray-500">
                    (осталось: {product.stockQuantity})
                  </span>
                )}
              </div>

              {/* Время доставки */}
              {product.estimatedDelivery && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Время доставки:</span>{' '}
                  {product.estimatedDelivery}
                </div>
              )}

              {/* Кнопка добавления в корзину */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-primary-500 px-6 py-3 text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-gray-300"
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
  );
}
