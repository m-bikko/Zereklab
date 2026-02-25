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
    <div
      className="relative min-h-screen overflow-hidden py-8"
      style={{
        background: 'linear-gradient(135deg, #fff5e6 0%, #ffe4cc 100%)',
      }}
    >
      {/* STEM Elements from forScanner.html */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Atoms */}
        <div
          className="absolute opacity-10"
          style={{
            top: '8%',
            right: '20%',
            animationDelay: '0s',
          }}
        >
          <div
            className="atom element"
            style={{
              animation: 'float 15s ease-in-out infinite',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '20px',
                height: '20px',
                background: '#ff6b35',
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 20px rgba(255, 107, 53, 0.5)',
              }}
            ></div>
            <div
              style={{
                position: 'absolute',
                border: '3px solid #ff8c42',
                borderRadius: '50%',
                animation: 'rotate 10s linear infinite',
                width: '60px',
                height: '60px',
                top: '10px',
                left: '10px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  background: '#ff6b35',
                  borderRadius: '50%',
                  top: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              ></div>
            </div>
            <div
              style={{
                position: 'absolute',
                border: '3px solid #ff8c42',
                borderRadius: '50%',
                animation: 'rotate 10s linear infinite',
                width: '70px',
                height: '35px',
                top: '22.5px',
                left: '5px',
                transform: 'rotate(60deg)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  background: '#ff6b35',
                  borderRadius: '50%',
                  top: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              ></div>
            </div>
          </div>
        </div>

        <div
          className="opacity-8 absolute"
          style={{
            bottom: '50%',
            left: '10%',
            animationDelay: '3s',
          }}
        >
          <div
            className="atom element"
            style={{
              animation: 'float 15s ease-in-out infinite',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '16px',
                height: '16px',
                background: '#ff6b35',
                borderRadius: '50%',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 15px rgba(255, 107, 53, 0.4)',
              }}
            ></div>
            <div
              style={{
                position: 'absolute',
                border: '2px solid #ff8c42',
                borderRadius: '50%',
                animation: 'rotate 8s linear infinite',
                width: '50px',
                height: '50px',
                top: '10px',
                left: '10px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: '6px',
                  height: '6px',
                  background: '#ff6b35',
                  borderRadius: '50%',
                  top: '-3px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Gears */}
        <div
          className="opacity-8 absolute"
          style={{
            top: '30%',
            left: '15%',
            animationDelay: '1s',
          }}
        >
          <div
            className="gear element"
            style={{
              animation: 'rotate 8s linear infinite',
              width: '60px',
              height: '60px',
              position: 'absolute',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: '#ff8c42',
                borderRadius: '50%',
                position: 'relative',
                boxShadow: '0 0 15px rgba(255, 140, 66, 0.3)',
              }}
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: '15px',
                    height: '20px',
                    background: '#ff8c42',
                    top: '-10px',
                    left: '50%',
                    transform: `translateX(-50%) rotate(${i * 45}deg)`,
                    transformOrigin: 'center 40px',
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="opacity-6 absolute"
          style={{
            bottom: '35%',
            right: '30%',
            animationDelay: '4s',
          }}
        >
          <div
            className="gear element"
            style={{
              animation: 'rotate 12s linear infinite reverse',
              width: '45px',
              height: '45px',
              position: 'absolute',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: '#ff8c42',
                borderRadius: '50%',
                position: 'relative',
                boxShadow: '0 0 10px rgba(255, 140, 66, 0.3)',
              }}
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: '12px',
                    height: '15px',
                    background: '#ff8c42',
                    top: '-7px',
                    left: '50%',
                    transform: `translateX(-50%) rotate(${i * 60}deg)`,
                    transformOrigin: 'center 30px',
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Flasks */}
        <div
          className="opacity-8 absolute"
          style={{
            top: '18%',
            left: '40%',
            animationDelay: '2s',
          }}
        >
          <div
            className="flask element"
            style={{
              animation: 'float 15s ease-in-out infinite',
              width: '50px',
              height: '70px',
              position: 'absolute',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '45px',
                background:
                  'linear-gradient(to bottom, transparent 40%, #ff6b35 40%)',
                border: '3px solid #ff8c42',
                borderRadius: '0 0 20px 20px',
                position: 'absolute',
                bottom: 0,
                left: '5px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: '6px',
                  height: '6px',
                  background: '#ffa652',
                  borderRadius: '50%',
                  bottom: '10px',
                  left: '10px',
                  animation: 'bubble-up 3s ease-in-out infinite',
                }}
              ></div>
              <div
                style={{
                  position: 'absolute',
                  width: '6px',
                  height: '6px',
                  background: '#ffa652',
                  borderRadius: '50%',
                  bottom: '15px',
                  left: '20px',
                  animation: 'bubble-up 3s ease-in-out infinite',
                  animationDelay: '1s',
                }}
              ></div>
            </div>
            <div
              style={{
                width: '16px',
                height: '25px',
                borderLeft: '3px solid #ff8c42',
                borderRight: '3px solid #ff8c42',
                position: 'absolute',
                top: 0,
                left: '17px',
              }}
            ></div>
          </div>
        </div>

        <div
          className="opacity-6 absolute"
          style={{
            bottom: '55%',
            right: '15%',
            animationDelay: '5s',
          }}
        >
          <div
            className="flask element"
            style={{
              animation: 'float 18s ease-in-out infinite',
              width: '40px',
              height: '55px',
              position: 'absolute',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '35px',
                background:
                  'linear-gradient(to bottom, transparent 40%, #ff6b35 40%)',
                border: '2px solid #ff8c42',
                borderRadius: '0 0 16px 16px',
                position: 'absolute',
                bottom: 0,
                left: '4px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  background: '#ffa652',
                  borderRadius: '50%',
                  bottom: '8px',
                  left: '8px',
                  animation: 'bubble-up 4s ease-in-out infinite',
                }}
              ></div>
            </div>
            <div
              style={{
                width: '12px',
                height: '20px',
                borderLeft: '2px solid #ff8c42',
                borderRight: '2px solid #ff8c42',
                position: 'absolute',
                top: 0,
                left: '14px',
              }}
            ></div>
          </div>
        </div>

        {/* Lightning bolts */}
        <div
          className="opacity-6 absolute"
          style={{
            top: '45%',
            right: '40%',
            animationDelay: '1.5s',
          }}
        >
          <div
            className="lightning element"
            style={{
              animation: 'float 20s ease-in-out infinite',
              width: '30px',
              height: '60px',
              position: 'absolute',
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '30px 15px 0 0',
                borderColor: '#ff6b35 transparent transparent transparent',
                position: 'relative',
              }}
            >
              <div
                style={{
                  content: '',
                  width: 0,
                  height: 0,
                  borderStyle: 'solid',
                  borderWidth: '0 0 30px 15px',
                  borderColor: 'transparent transparent #ff6b35 transparent',
                  position: 'absolute',
                  top: '15px',
                  left: '-8px',
                }}
              ></div>
            </div>
          </div>
        </div>

        <div
          className="absolute opacity-5"
          style={{
            top: '5%',
            left: '60%',
            animationDelay: '3.5s',
          }}
        >
          <div
            className="lightning element"
            style={{
              animation: 'float 25s ease-in-out infinite',
              width: '25px',
              height: '50px',
              position: 'absolute',
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '25px 12px 0 0',
                borderColor: '#ff6b35 transparent transparent transparent',
                position: 'relative',
              }}
            >
              <div
                style={{
                  content: '',
                  width: 0,
                  height: 0,
                  borderStyle: 'solid',
                  borderWidth: '0 0 25px 12px',
                  borderColor: 'transparent transparent #ff6b35 transparent',
                  position: 'absolute',
                  top: '12px',
                  left: '-6px',
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* DNA Helix */}
        <div
          className="opacity-6 absolute"
          style={{
            bottom: '25%',
            left: '35%',
            animationDelay: '2.5s',
          }}
        >
          <div
            className="dna element"
            style={{
              animation: 'float 20s ease-in-out infinite',
              width: '40px',
              height: '80px',
              position: 'absolute',
            }}
          >
            <div
              style={{
                width: '4px',
                height: '100%',
                background:
                  'linear-gradient(to bottom, #ff6b35 0%, #ff8c42 25%, #ff6b35 50%, #ff8c42 75%, #ff6b35 100%)',
                position: 'absolute',
                left: '18px',
                animation: 'wave 4s ease-in-out infinite',
              }}
            ></div>
            <div
              style={{
                width: '4px',
                height: '100%',
                background:
                  'linear-gradient(to bottom, #ff6b35 0%, #ff8c42 25%, #ff6b35 50%, #ff8c42 75%, #ff6b35 100%)',
                position: 'absolute',
                left: '18px',
                transform: 'translateX(10px)',
                animation: 'wave 4s ease-in-out infinite',
                animationDelay: '0.5s',
              }}
            ></div>
          </div>
        </div>

        {/* Rocket */}
        <div
          className="opacity-7 absolute"
          style={{
            top: '55%',
            left: '70%',
          }}
        >
          <div
            className="rocket"
            style={{
              animation: 'rocket-fly 20s ease-in-out infinite',
              width: '40px',
              height: '60px',
              position: 'absolute',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '40px',
                background: '#ff6b35',
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                position: 'absolute',
                left: '8px',
                top: 0,
              }}
            ></div>
            <div
              style={{
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '0 8px 20px 8px',
                borderColor: 'transparent transparent #ff8c42 transparent',
                position: 'absolute',
                bottom: '15px',
                left: '-4px',
              }}
            ></div>
            <div
              style={{
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '0 8px 20px 8px',
                borderColor: 'transparent transparent #ff8c42 transparent',
                position: 'absolute',
                bottom: '15px',
                right: '-4px',
              }}
            ></div>
            <div
              style={{
                width: '16px',
                height: '20px',
                background: 'linear-gradient(to bottom, #ffa652, #ff6b35)',
                borderRadius: '0 0 50% 50%',
                position: 'absolute',
                bottom: '-15px',
                left: '12px',
                animation: 'flame 0.3s ease-in-out infinite alternate',
              }}
            ></div>
          </div>
        </div>

        {/* Pattern dots */}
        <div className="opacity-4 absolute" style={{ top: '2%', right: '10%' }}>
          <div
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              background: '#ff6b35',
              borderRadius: '50%',
            }}
          ></div>
        </div>
        <div className="opacity-3 absolute" style={{ top: '35%', left: '5%' }}>
          <div
            style={{
              position: 'absolute',
              width: '6px',
              height: '6px',
              background: '#ff6b35',
              borderRadius: '50%',
            }}
          ></div>
        </div>
        <div
          className="absolute opacity-5"
          style={{ bottom: '20%', right: '50%' }}
        >
          <div
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              background: '#ff6b35',
              borderRadius: '50%',
            }}
          ></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          75% {
            transform: translateY(10px) rotate(-5deg);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes bubble-up {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-20px);
            opacity: 0;
          }
        }

        @keyframes wave {
          0%,
          100% {
            transform: scaleX(1);
          }
          50% {
            transform: scaleX(1.2);
          }
        }

        @keyframes rocket-fly {
          0%,
          100% {
            transform: translateY(0) rotate(-45deg);
          }
          50% {
            transform: translateY(-30px) rotate(-45deg);
          }
        }

        @keyframes flame {
          from {
            transform: scaleY(1);
            opacity: 0.8;
          }
          to {
            transform: scaleY(1.2);
            opacity: 1;
          }
        }
      `}</style>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
