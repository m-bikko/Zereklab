'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Eye, Star, AlertTriangle } from 'lucide-react'
import { IProduct } from '@/types'
import { useCartStore } from '@/store/cartStore'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface ProductGridProps {
  products: IProduct[]
  viewMode: 'grid' | 'list'
}

export default function ProductGrid({ products, viewMode }: ProductGridProps) {
  const { addItem } = useCartStore()

  const handleAddToCart = (product: IProduct) => {
    if (!product._id) {
      toast.error('Невозможно добавить товар: отсутствует ID товара.')
      return;
    }
    if (!product.inStock) {
        toast.error('Этого товара нет в наличии.')
        return;
    }
    addItem(product)
    toast.success(`${product.name} добавлен в корзину!`)
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-md">
        <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Товары не отображаются</h3>
        <p className="text-gray-500">Пожалуйста, проверьте подключение или попробуйте позже.</p>
      </div>
    )
  }

  const placeholderImage = '/images/placeholder-product.svg';

  if (viewMode === 'list') {
    return (
      <div className="space-y-4 sm:space-y-6">
        {products.map((product, index) => (
          <motion.div
            key={product._id || `product-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Product Image */}
              <Link href={`/products/${product._id}`} className="block sm:w-48 md:w-56 lg:w-64 h-48 sm:h-auto flex-shrink-0 relative group overflow-hidden bg-gray-100">
                <Image
                  src={product.images?.[0] || placeholderImage}
                  alt={product.name || 'Изображение товара'}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 192px, 256px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <span className="text-white font-semibold px-3 py-1 bg-red-500 rounded-md text-sm">Нет в наличии</span>
                  </div>
                )}
              </Link>

              {/* Product Info */}
              <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                <div>
                  <Link href={`/products/${product._id}`} className="block mb-1.5">
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  {product.category && (
                    <span className="text-xs text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full font-medium mb-2 inline-block">
                      {product.category}
                    </span>
                  )}
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3 sm:line-clamp-2">
                    {product.description}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mt-auto pt-3">
                  <div className="mb-3 sm:mb-0">
                    <span className="text-2xl lg:text-3xl font-bold text-primary-600">₸{product.price.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full xs:w-auto">
                    <Link
                      href={`/products/${product._id}`}
                      className="flex-1 xs:flex-none bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm font-medium shadow-sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Смотреть
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      className="flex-1 xs:flex-none bg-primary-500 text-white px-4 py-2.5 rounded-lg hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-medium shadow-md hover:shadow-lg"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.inStock ? 'В корзину' : 'Нет в наличии'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product, index) => (
        <motion.div
          key={product._id || `product-grid-${index}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col border border-gray-200"
        >
          <Link href={`/products/${product._id}`} className="block relative aspect-w-1 aspect-h-1 w-full bg-gray-100 overflow-hidden group">
            <Image
              src={product.images?.[0] || placeholderImage}
              alt={product.name || 'Изображение товара'}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" 
              className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
                <span className="text-white font-semibold px-3 py-1 bg-red-500 rounded-md text-sm">Нет в наличии</span>
              </div>
            )}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              <div className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors">
                <Eye className="w-5 h-5 text-gray-700" />
              </div>
            </div>
          </Link>

          <div className="p-4 flex flex-col flex-grow">
            <Link href={`/products/${product._id}`} className="block mb-1.5">
              <h3 className="font-semibold text-gray-800 hover:text-primary-600 transition-colors line-clamp-2 h-12">
                {product.name}
              </h3>
            </Link>
            {product.category && (
              <span className="text-xs text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full font-medium mb-2 inline-block self-start">
                {product.category}
              </span>
            )}
            
            <div className="mt-auto">
              <div className="mb-3">
                <span className="text-xl font-bold text-primary-600">₸{product.price.toLocaleString()}</span>
              </div>

              <button
                onClick={() => handleAddToCart(product)}
                disabled={!product.inStock}
                className="w-full bg-primary-500 text-white py-2.5 px-4 rounded-lg hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm font-medium shadow-md hover:shadow-lg"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{product.inStock ? 'В корзину' : 'Нет в наличии'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
} 