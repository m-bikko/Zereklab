'use client';

import { useLocale } from '@/hooks/useLocale';
import { t } from '@/lib/i18n';
import { openWhatsAppOrder } from '@/lib/whatsapp';
import { useCartStore } from '@/store/cartStore';
import { getLocalizedText } from '@/types';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';

export default function CartModal() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
  } = useCartStore();
  const locale = useLocale();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckout = () => {
    if (items.length === 0) {
      return;
    }

    try {
      // Open WhatsApp with formatted order message
      openWhatsAppOrder(items, locale);

      // Optionally clear cart after successful order
      // clearCart();

      // Close cart modal
      closeCart();
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      alert(t('cart.whatsappError', locale));
    }
  };

  const handleContinueShopping = () => {
    router.push(`/${locale}/products`);
    closeCart();
  };

  // Предотвращаем рендеринг на сервере для корректной гидратации
  if (!mounted) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('cart.title', locale)}
                </h2>
                <button
                  onClick={closeCart}
                  className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  /* Empty Cart */
                  <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                    <ShoppingBag className="mb-4 h-16 w-16 text-gray-300" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">
                      {t('cart.empty', locale)}
                    </h3>
                    <p className="mb-6 text-sm text-gray-500">
                      {t('cart.emptyDescription', locale)}
                    </p>
                    <button
                      onClick={handleContinueShopping}
                      className="rounded-lg bg-primary-500 px-6 py-2 text-white transition-colors hover:bg-primary-600"
                    >
                      {t('cart.continueShopping', locale)}
                    </button>
                  </div>
                ) : (
                  /* Cart Items */
                  <div className="p-4">
                    <div className="space-y-4">
                      {items.map(item => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3"
                        >
                          {/* Product Image */}
                          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                            <Image
                              src={item.image}
                              alt={getLocalizedText(item.name, locale)}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {getLocalizedText(item.name, locale)}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {t('products.sku', locale)}: {item.sku}
                            </p>
                            <p className="text-sm font-medium text-primary-600">
                              {item.price.toLocaleString('ru-RU')} ₸
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-[2rem] text-center text-sm font-medium text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="rounded-full p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Clear Cart Button */}
                    {items.length > 0 && (
                      <button
                        onClick={clearCart}
                        className="mt-4 w-full rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        {t('cart.clear', locale)}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-gray-200 p-4">
                  {/* Total */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      {t('cart.total', locale)}:
                    </span>
                    <span className="text-lg font-bold text-primary-600">
                      {getTotalPrice().toLocaleString('ru-RU')} ₸
                    </span>
                  </div>

                  {/* Checkout Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={handleCheckout}
                      className="w-full rounded-lg bg-primary-500 py-3 font-medium text-white transition-colors hover:bg-primary-600"
                    >
                      {t('cart.checkout', locale)}
                    </button>
                    <button
                      onClick={handleContinueShopping}
                      className="w-full rounded-lg border border-gray-300 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      {t('cart.continueShopping', locale)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
