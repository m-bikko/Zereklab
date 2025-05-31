'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { X, Plus, Minus, Trash2, MessageCircle, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartModal() {
  const { 
    isOpen, 
    items, 
    closeCart, 
    updateQuantity, 
    removeItem, 
    getTotalPrice, 
    clearCart 
  } = useCartStore()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const generateWhatsAppMessage = () => {
    if (items.length === 0) return ''
    
    let message = 'Здравствуйте! Я хотел бы заказать следующие товары из ZerekLab:\n\n'
    
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`
      message += `   Количество: ${item.quantity}\n`
      message += `   Цена: ₸${item.price.toLocaleString()} за шт.\n`
      message += `   Подитог: ₸${(item.price * item.quantity).toLocaleString()}\n\n`
    })
    
    message += `Итого: ₸${getTotalPrice().toLocaleString()}\n\n`
    message += 'Пожалуйста, подтвердите наличие и предоставьте детали для оплаты. Спасибо!'
    
    return encodeURIComponent(message)
  }

  const handleWhatsAppOrder = () => {
    const message = generateWhatsAppMessage()
    const whatsappUrl = `https://wa.me/7XXXXXXXXXX?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="cart-title" role="dialog" aria-modal="true">
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
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-4">
              <h2 id="cart-title" className="text-lg font-semibold text-gray-900">Корзина</h2>
              <button
                type="button"
                onClick={closeCart}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Закрыть корзину"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mb-6" />
                  <h3 className="text-xl font-medium text-gray-800 mb-2">Ваша корзина пуста</h3>
                  <p className="text-gray-500 mb-6 max-w-xs">
                    Добавьте несколько удивительных образовательных наборов, чтобы начать!
                  </p>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="bg-primary-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-600 transition-colors shadow-sm"
                  >
                    Продолжить покупки
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <motion.li
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                      className="flex py-4 space-x-4"
                    >
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.images[0] || '/images/placeholder-product.svg'}
                          alt={item.name || 'Изображение товара'}
                          fill
                          sizes="(max-width: 640px) 80px, 96px"
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm sm:text-base font-medium text-gray-800 hover:text-primary-600 transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">₸{item.price.toLocaleString()}</p>
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1.5 text-gray-500 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-full hover:bg-gray-100"
                            aria-label="Уменьшить количество"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          
                          <span className="text-sm font-medium text-gray-800 w-8 text-center tabular-nums">
                            {item.quantity}
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="p-1.5 text-gray-500 hover:text-primary-600 transition-colors rounded-full hover:bg-gray-100"
                            aria-label="Увеличить количество"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end justify-between">
                        <span className="text-sm sm:text-base font-medium text-gray-800">
                          ₸{(item.price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                          aria-label="Удалить товар"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 px-4 sm:px-6 py-4 space-y-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold text-gray-900">Итого:</span>
                  <span className="text-base sm:text-lg font-bold text-primary-600">
                    ₸{getTotalPrice().toLocaleString()}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleWhatsAppOrder}
                    className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Заказать через WhatsApp</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
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
  )
} 