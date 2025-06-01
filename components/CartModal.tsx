'use client';

import { useCartStore } from '@/store/cartStore';

import { useEffect } from 'react';

import Image from 'next/image';

import { AnimatePresence, motion } from 'framer-motion';
import {
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';

export default function CartModal() {
  const {
    isOpen,
    items,
    closeCart,
    updateQuantity,
    removeItem,
    getTotalPrice,
    clearCart,
  } = useCartStore();

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

  const generateWhatsAppMessage = () => {
    if (items.length === 0) return '';

    let message =
      'Здравствуйте! Я хотел бы заказать следующие товары из ZerekLab:\n\n';

    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   Количество: ${item.quantity}\n`;
      message += `   Цена: ₸${item.price.toLocaleString()} за шт.\n`;
      message += `   Подитог: ₸${(
        item.price * item.quantity
      ).toLocaleString()}\n\n`;
    });

    message += `Итого: ₸${getTotalPrice().toLocaleString()}\n\n`;
    message +=
      'Пожалуйста, подтвердите наличие и предоставьте детали для оплаты. Спасибо!';

    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = () => {
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/7XXXXXXXXXX?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-hidden"
          aria-labelledby="cart-title"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeCart}
          />

          <motion.div
            key="modal"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
              <h2
                id="cart-title"
                className="text-lg font-semibold text-gray-900"
              >
                Корзина
              </h2>
              <button
                type="button"
                onClick={closeCart}
                className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                aria-label="Закрыть корзину"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag className="mb-6 h-16 w-16 text-gray-300" />
                  <h3 className="mb-2 text-xl font-medium text-gray-800">
                    Ваша корзина пуста
                  </h3>
                  <p className="mb-6 max-w-xs text-gray-500">
                    Добавьте несколько удивительных образовательных наборов,
                    чтобы начать!
                  </p>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="rounded-lg bg-primary-500 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-primary-600"
                  >
                    Продолжить покупки
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {items.map(item => (
                    <motion.li
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        y: -20,
                        transition: { duration: 0.2 },
                      }}
                      className="flex space-x-4 py-4"
                    >
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-24 sm:w-24">
                        <Image
                          src={
                            item.images[0] || '/images/placeholder-product.svg'
                          }
                          alt={item.name || 'Изображение товара'}
                          fill
                          sizes="(max-width: 640px) 80px, 96px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-800 transition-colors hover:text-primary-600 sm:text-base">
                            {item.name}
                          </h4>
                          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                            ₸{item.price.toLocaleString()}
                          </p>
                        </div>

                        <div className="mt-2 flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item._id || '', item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Уменьшить количество"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <span className="w-8 text-center text-sm font-medium tabular-nums text-gray-800">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item._id || '', item.quantity + 1)
                            }
                            className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600"
                            aria-label="Увеличить количество"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <span className="text-sm font-medium text-gray-800 sm:text-base">
                          ₸{(item.price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item._id || '')}
                          className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label="Удалить товар"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="space-y-4 border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-gray-900 sm:text-lg">
                    Итого:
                  </span>
                  <span className="text-base font-bold text-primary-600 sm:text-lg">
                    ₸{getTotalPrice().toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleWhatsAppOrder}
                    className="flex w-full items-center justify-center space-x-2 rounded-lg bg-green-500 px-4 py-3 font-medium text-white shadow-sm transition-colors hover:bg-green-600"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Заказать через WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full rounded-lg bg-gray-200 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-300"
                  >
                    Очистить корзину
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
