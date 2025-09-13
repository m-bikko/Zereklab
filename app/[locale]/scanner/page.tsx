'use client';

import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import ProductDetailsModal from '@/components/ProductDetailsModal';
import { type Locale, getLocalizedMessage, t } from '@/lib/i18n';
import { IProduct } from '@/types';

import { useState } from 'react';
import toast from 'react-hot-toast';

import Image from 'next/image';

import { AlertCircle, Eye, Package, ScanLine } from 'lucide-react';

interface ScannerPageProps {
  params: {
    locale: Locale;
  };
}

export default function ScannerPage({ params: { locale } }: ScannerPageProps) {
  const [searchingSKU, setSearchingSKU] = useState('');
  const [searchResults, setSearchResults] = useState<IProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);

  // Поиск товара по SKU
  const searchProductBySKU = async (sku: string) => {
    if (!sku.trim()) {
      toast.error(t('scanner.errors.enterSku', locale));
      return;
    }

    setLoading(true);
    setSearchingSKU(sku);

    try {
      // First try exact SKU search
      const exactResponse = await fetch(
        `/api/products?sku=${encodeURIComponent(sku.trim())}`
      );

      if (exactResponse.ok) {
        const exactData = await exactResponse.json();

        if (exactData.products && exactData.products.length > 0) {
          setSearchResults(exactData.products);
          if (exactData.products.length === 1) {
            // Если найден один товар, сразу показываем детали
            setSelectedProduct(exactData.products[0]);
            setShowProductDetails(true);
          }
          toast.success(
            t('scanner.success.found', locale, {
              count: exactData.products.length,
            })
          );
          return;
        }
      }

      // If no exact match, try partial search
      const partialResponse = await fetch(
        `/api/products?search=${encodeURIComponent(sku.trim())}`
      );

      if (partialResponse.ok) {
        const partialData = await partialResponse.json();

        if (partialData.products && partialData.products.length > 0) {
          setSearchResults(partialData.products);
          toast.success(
            t('scanner.success.foundPartial', locale, {
              count: partialData.products.length,
            })
          );
        } else {
          setSearchResults([]);
          toast.error(t('scanner.notFoundMessage', locale, { sku }));
        }
      } else {
        throw new Error(t('scanner.errors.networkError', locale));
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
      toast.error(t('scanner.errors.searchError', locale));
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик сканирования
  const handleBarcodeScan = (barcode: string) => {
    searchProductBySKU(barcode);
  };

  // Ручной поиск по SKU
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchProductBySKU(searchingSKU);
  };

  // Показать детали товара
  const showProductDetail = (product: IProduct) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  // Функция для получения локализованного названия товара
  const getProductName = (product: IProduct) => {
    if (typeof product.name === 'string') {
      return product.name;
    }
    return getLocalizedMessage(product.name, locale);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <Package className="mr-3 h-12 w-12 text-primary-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              {t('scanner.title', locale)}
            </h1>
          </div>
          <p className="mx-auto max-w-2xl text-gray-600">
            {t('scanner.description', locale)}
          </p>
        </div>

        {/* Панель поиска */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-lg">
          <div className="flex flex-col items-end gap-4 sm:flex-row">
            {/* Сканер штрих-кода */}
            <div className="flex-shrink-0">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('scanner.scanning', locale)}
              </label>
              <BarcodeScannerModal onScan={handleBarcodeScan} locale={locale} />
            </div>

            {/* Ручной ввод SKU */}
            <div className="flex-1">
              <label
                htmlFor="sku-input"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {t('scanner.manualInput', locale)}
              </label>
              <form onSubmit={handleManualSearch} className="flex gap-2">
                <input
                  id="sku-input"
                  type="text"
                  value={searchingSKU}
                  onChange={e => setSearchingSKU(e.target.value)}
                  placeholder={t('scanner.skuPlaceholder', locale)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-2 text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <ScanLine className="h-4 w-4" />
                  )}
                  {t('scanner.findButton', locale)}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Результаты поиска */}
        {searchResults.length > 0 && (
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              {t('scanner.resultsCount', locale, {
                count: searchResults.length,
              })}
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map(product => (
                <div
                  key={product._id}
                  className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                >
                  {/* Изображение товара */}
                  {product.images && product.images.length > 0 ? (
                    <div className="relative mb-3 h-32 w-full">
                      <Image
                        src={product.images[0]}
                        alt={getProductName(product)}
                        fill
                        className="rounded-lg object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            '/images/placeholder-product.svg';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="mb-3 flex h-32 w-full items-center justify-center rounded-lg bg-gray-200">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  {/* Информация о товаре */}
                  <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">
                    {getProductName(product)}
                  </h3>

                  <div className="mb-3 space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">
                        {t('scanner.sku', locale)}:
                      </span>{' '}
                      {product.sku || t('scanner.notSpecified', locale)}
                    </p>
                    <p>
                      <span className="font-medium">
                        {t('scanner.price', locale)}:
                      </span>{' '}
                      {product.price} ₸
                    </p>
                    <p>
                      <span className="font-medium">
                        {t('scanner.category', locale)}:
                      </span>{' '}
                      {product.category}
                    </p>
                    <p
                      className={`${product.inStock ? 'text-green-600' : 'text-red-600'}`}
                    >
                      <span className="font-medium">
                        {t('scanner.status', locale)}:
                      </span>{' '}
                      {product.inStock
                        ? t('scanner.inStock', locale)
                        : t('scanner.outOfStock', locale)}
                    </p>
                  </div>

                  {/* Кнопка просмотра */}
                  <button
                    onClick={() => showProductDetail(product)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
                  >
                    <Eye className="h-4 w-4" />
                    {t('scanner.productDetails', locale)}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Сообщение об отсутствии результатов */}
        {searchingSKU && searchResults.length === 0 && !loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow-lg">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {t('scanner.notFound', locale)}
            </h3>
            <p className="text-gray-600">
              {t('scanner.notFoundMessage', locale, { sku: searchingSKU })}
              <br />
              {t('scanner.checkCode', locale)}
            </p>
          </div>
        )}

        {/* Инструкции */}
        {searchResults.length === 0 && !searchingSKU && (
          <div className="rounded-xl bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              {t('scanner.howToUse', locale)}
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary-100 p-2">
                  <ScanLine className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">
                    {t('scanner.scanningTitle', locale)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('scanner.scanningInstructions', locale)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary-100 p-2">
                  <Package className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-gray-900">
                    {t('scanner.manualTitle', locale)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t('scanner.manualInstructions', locale)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно с деталями товара */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          isOpen={showProductDetails}
          onClose={() => {
            setShowProductDetails(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
