'use client';

import { useCartStore } from '@/store/cartStore';
import { IProduct } from '@/types';

import toast from 'react-hot-toast';

import Image from 'next/image';

import { Package, Ruler, ShoppingCart, Star, Tag, X } from 'lucide-react';

interface Props {
  product: IProduct;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({
  product,
  isOpen,
  onClose,
}: Props) {
  const { addItem } = useCartStore();

  if (!isOpen) return null;

  const handleAddToCart = () => {
    if (!product.inStock) {
      toast.error('Товар недоступен для заказа');
      return;
    }

    addItem(product);
    toast.success(`${product.name} добавлен в корзину`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Заголовок модального окна */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Детали товара</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Изображения товара */}
            <div>
              {product.images && product.images.length > 0 ? (
                <div className="space-y-4">
                  <div className="relative h-80 w-full">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="rounded-lg border border-gray-200 object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).src =
                          '/images/placeholder-product.jpg';
                      }}
                    />
                  </div>

                  {/* Дополнительные изображения */}
                  {product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {product.images.slice(1, 5).map((image, index) => (
                        <div key={index} className="relative h-20 w-full">
                          <Image
                            src={image}
                            alt={`${product.name} ${index + 2}`}
                            fill
                            className="rounded-lg border border-gray-200 object-cover"
                            onError={e => {
                              (e.target as HTMLImageElement).src =
                                '/images/placeholder-product.jpg';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-80 w-full items-center justify-center rounded-lg bg-gray-200">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Основная информация */}
            <div className="space-y-6">
              {/* Название и цена */}
              <div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900">
                  {product.name}
                </h1>
                <div className="mb-4 flex items-center gap-4">
                  <span className="text-3xl font-bold text-primary-600">
                    {product.price.toLocaleString()} ₸
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      product.inStock
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.inStock ? 'В наличии' : 'Нет в наличии'}
                  </span>
                </div>
              </div>

              {/* Основные характеристики */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">SKU:</span>
                  <span className="font-medium">
                    {product.sku || 'Не указан'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Категория:</span>
                  <span className="font-medium">{product.category}</span>
                  {product.subcategory && product.subcategory.trim() && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="font-medium">{product.subcategory}</span>
                    </>
                  )}
                </div>

                {product.ageRange && product.ageRange.trim() && (
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Возраст:</span>
                    <span className="font-medium">{product.ageRange}</span>
                  </div>
                )}

                {product.difficulty && product.difficulty.trim() && (
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Сложность:</span>
                    <span className="font-medium">
                      {product.difficulty === 'Beginner'
                        ? 'Начинающий'
                        : product.difficulty === 'Intermediate'
                          ? 'Средний'
                          : 'Продвинутый'}
                    </span>
                  </div>
                )}

                {product.stockQuantity !== undefined &&
                  product.stockQuantity > 0 && (
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Количество на складе:
                      </span>
                      <span className="font-medium">
                        {product.stockQuantity} шт.
                      </span>
                    </div>
                  )}
              </div>

              {/* Кнопка добавления в корзину */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold transition-colors ${
                  product.inStock
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'cursor-not-allowed bg-gray-300 text-gray-500'
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                {product.inStock ? 'Добавить в корзину' : 'Товар недоступен'}
              </button>
            </div>
          </div>

          {/* Описание */}
          {product.description && (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Описание
              </h3>
              <p className="leading-relaxed text-gray-600">
                {product.description}
              </p>
            </div>
          )}

          {/* Особенности */}
          {product.features &&
            product.features.length > 0 &&
            product.features.some(feature => feature && feature.trim()) && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Ключевые особенности
                </h3>
                <ul className="space-y-2">
                  {product.features
                    .filter(feature => feature && feature.trim())
                    .map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500"></span>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

          {/* Технические характеристики */}
          {product.specifications &&
            Object.keys(product.specifications).length > 0 &&
            Object.entries(product.specifications).some(
              ([key, value]) =>
                key && key.trim() && value && String(value).trim()
            ) && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Технические характеристики
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Object.entries(product.specifications)
                    .filter(
                      ([key, value]) =>
                        key && key.trim() && value && String(value).trim()
                    )
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                      >
                        <span className="text-sm text-gray-600">{key}:</span>
                        <span className="font-medium text-gray-900">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {/* Габариты */}
          {product.dimensions &&
            (product.dimensions.length > 0 ||
              product.dimensions.width > 0 ||
              product.dimensions.height > 0 ||
              product.dimensions.weight > 0) && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Ruler className="h-5 w-5" />
                  Габариты и вес
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {product.dimensions.length > 0 && (
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <div className="text-sm text-gray-600">Длина</div>
                      <div className="font-semibold">
                        {product.dimensions.length} см
                      </div>
                    </div>
                  )}
                  {product.dimensions.width > 0 && (
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <div className="text-sm text-gray-600">Ширина</div>
                      <div className="font-semibold">
                        {product.dimensions.width} см
                      </div>
                    </div>
                  )}
                  {product.dimensions.height > 0 && (
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <div className="text-sm text-gray-600">Высота</div>
                      <div className="font-semibold">
                        {product.dimensions.height} см
                      </div>
                    </div>
                  )}
                  {product.dimensions.weight > 0 && (
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <div className="text-sm text-gray-600">Вес</div>
                      <div className="font-semibold">
                        {product.dimensions.weight} г
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Теги */}
          {product.tags &&
            product.tags.length > 0 &&
            product.tags.some(tag => tag && tag.trim()) && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Теги
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags
                    .filter(tag => tag && tag.trim())
                    .map((tag, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-800"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
