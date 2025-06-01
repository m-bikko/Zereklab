'use client';

import { parsedEnv } from '@/lib/parsedEnv';
import { useCartStore } from '@/store/cartStore';
import { IProduct } from '@/types';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  Info,
  Layers,
  MessageCircle,
  ShoppingCart,
  Star,
  Tag,
  UsersIcon,
  Zap,
} from 'lucide-react';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addItem } = useCartStore();
  const placeholderImage = '/images/placeholder-product.svg';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Товар не найден.');
          } else {
            toast.error('Не удалось загрузить товар.');
          }
          setProduct(null);
          return;
        }

        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Ошибка при загрузке товара:', error);
        toast.error('Ошибка при загрузке товара.');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleAddToCart = () => {
    if (product && product._id) {
      if (!product.inStock) {
        toast.error('Этого товара нет в наличии.');
        return;
      }
      addItem(product);
      toast.success(`${product.name} добавлен в корзину!`);
    } else {
      toast.error('Не удалось добавить товар в корзину.');
    }
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;

    let message = `Здравствуйте! Меня интересует заказ товара "${product.name}" из ZerekLab.\n\n`;
    message += `Информация о товаре:\n`;
    message += `- Название: ${product.name}\n`;
    message += `- Цена: ₸${product.price.toLocaleString()}\n`;
    if (product.category) message += `- Категория: ${product.category}\n`;
    if (product.sku) message += `- Артикул: ${product.sku}\n`;
    message += `\nПожалуйста, предоставьте информацию о наличии и способах оплаты. Спасибо!`;

    const whatsappNumber = parsedEnv.NEXT_PUBLIC_WHATSAPP_NUMBER;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');
  };

  const nextImage = () => {
    if (product && product.images && product.images.length > 1) {
      setSelectedImageIndex(prev =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.images && product.images.length > 1) {
      setSelectedImageIndex(prev =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-gray-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-8 h-6 w-48 rounded-md bg-gray-200"></div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-5">
                <div className="aspect-square rounded-xl bg-gray-200 shadow-md"></div>
                <div className="flex space-x-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 w-20 rounded-lg bg-gray-200 shadow-sm sm:h-24 sm:w-24"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6 pt-2">
                <div className="h-10 w-3/4 rounded-md bg-gray-300"></div>
                <div className="h-8 w-1/2 rounded-md bg-gray-300"></div>
                <div className="space-y-3 pt-4">
                  <div className="h-5 w-1/3 rounded-md bg-gray-200"></div>
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-full rounded-md bg-gray-200"
                    ></div>
                  ))}
                </div>
                <div className="space-y-3 pt-4">
                  <div className="h-5 w-1/3 rounded-md bg-gray-200"></div>
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-4/5 rounded-md bg-gray-200"
                    ></div>
                  ))}
                </div>
                <div className="mt-6 h-12 rounded-lg bg-gray-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <AlertTriangle className="mb-6 h-16 w-16 text-red-400" />
        <h1 className="mb-3 text-2xl font-bold text-gray-800">
          Товар не найден
        </h1>
        <p className="mb-8 max-w-md text-gray-600">
          К сожалению, мы не смогли найти товар, который вы ищете. Возможно, он
          был удален или ссылка устарела.
        </p>
        <Link
          href="/products"
          className="rounded-lg bg-primary-500 px-8 py-3 text-lg font-medium text-white shadow-md transition-colors hover:bg-primary-600 hover:shadow-lg"
        >
          К каталогу товаров
        </Link>
      </div>
    );
  }

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : [placeholderImage];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-500 sm:mb-8">
          <Link href="/" className="hover:text-primary-600 hover:underline">
            Главная
          </Link>
          <ChevronLeft className="h-4 w-4 rotate-180 text-gray-400" />
          <Link
            href="/products"
            className="hover:text-primary-600 hover:underline"
          >
            Товары
          </Link>
          <ChevronLeft className="h-4 w-4 rotate-180 text-gray-400" />
          <span className="max-w-xs truncate font-medium text-gray-700 sm:max-w-sm">
            {product.name}
          </span>
        </nav>

        <div className="rounded-xl bg-white p-6 shadow-2xl sm:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <div className="space-y-4">
              <div className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 shadow-lg">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={selectedImageIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={productImages[selectedImageIndex]}
                      alt={`${product.name} - изображение ${
                        selectedImageIndex + 1
                      }`}
                      fill
                      className="object-contain"
                      priority={selectedImageIndex === 0}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </motion.div>
                </AnimatePresence>

                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      aria-label="Предыдущее изображение"
                      className="absolute left-2 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white/70 p-2 opacity-80 shadow-md transition-all duration-200 hover:bg-white hover:shadow-lg group-hover:opacity-100 sm:left-3 sm:p-2.5"
                    >
                      <ArrowLeft className="h-5 w-5 text-gray-700 sm:h-6 sm:w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      aria-label="Следующее изображение"
                      className="absolute right-2 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white/70 p-2 opacity-80 shadow-md transition-all duration-200 hover:bg-white hover:shadow-lg group-hover:opacity-100 sm:right-3 sm:p-2.5"
                    >
                      <ArrowRight className="h-5 w-5 text-gray-700 sm:h-6 sm:w-6" />
                    </button>
                  </>
                )}
                {!product.inStock && (
                  <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transform">
                    <span className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md sm:text-sm">
                      Нет в наличии
                    </span>
                  </div>
                )}
              </div>

              {productImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2 pt-1 sm:space-x-3">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`Показать изображение ${index + 1}`}
                      className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 bg-gray-100 shadow-sm transition-all duration-200 hover:opacity-80 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:h-20 sm:w-20 sm:rounded-lg ${
                        selectedImageIndex === index
                          ? 'border-primary-500 ring-2 ring-primary-500 ring-offset-1'
                          : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} эскиз ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6 lg:pt-2">
              <div>
                <h1 className="mb-2 text-2xl font-bold leading-tight text-gray-800 sm:text-3xl lg:text-4xl">
                  {product.name}
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
                    {product.inStock ? 'В наличии' : 'Нет в наличии'}
                  </span>
                  {product.sku && (
                    <span className="text-xs text-gray-500">
                      Арт: {product.sku}
                    </span>
                  )}
                </div>
              </div>

              <ProductDetailSection icon={Info} title="Описание">
                <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                  {product.description || 'Описание отсутствует.'}
                </p>
              </ProductDetailSection>

              {product.features && product.features.length > 0 && (
                <ProductDetailSection icon={Star} title="Ключевые особенности">
                  <ul className="list-inside space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2.5">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </ProductDetailSection>
              )}

              {product.specifications &&
                Object.keys(product.specifications).length > 0 && (
                  <ProductDetailSection icon={Zap} title="Характеристики">
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
                    label="Категория"
                    value={product.category}
                  />
                )}
                {product.subcategory && (
                  <InfoPill
                    icon={Layers}
                    label="Подкатегория"
                    value={product.subcategory}
                  />
                )}
                {product.difficulty && (
                  <InfoPill
                    icon={Star}
                    label="Сложность"
                    value={product.difficulty}
                  />
                )}
                {product.ageRange && (
                  <InfoPill
                    icon={UsersIcon}
                    label="Возраст"
                    value={product.ageRange + ' лет'}
                  />
                )}
                {product.tags && product.tags.length > 0 && (
                  <div className="col-span-full">
                    <InfoPill
                      icon={Tag}
                      label="Теги"
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
                    {product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}
                  </span>
                </button>
                <button
                  onClick={handleWhatsAppOrder}
                  className="flex w-full items-center justify-center space-x-2.5 rounded-lg bg-green-500 px-6 py-3 text-lg font-semibold text-white shadow-md transition-all duration-200 hover:bg-green-600 hover:shadow-lg"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Заказать по WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
