'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ShoppingCart, MessageCircle, Star, Check, ArrowLeft, ArrowRight, AlertTriangle, Info, Tag, UsersIcon, Layers, Zap } from 'lucide-react'
import { IProduct } from '@/types'
import { useCartStore } from '@/store/cartStore'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<IProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const { addItem } = useCartStore()
  const placeholderImage = '/images/placeholder-product.svg';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${params.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Товар не найден.');
          } else {
            toast.error('Не удалось загрузить товар.');
          }
          setProduct(null);
          return;
        }
        
        const data = await response.json()
        setProduct(data)
      } catch (error) {
        console.error('Ошибка при загрузке товара:', error)
        toast.error('Ошибка при загрузке товара.')
        setProduct(null);
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const handleAddToCart = () => {
    if (product && product._id) {
      if (!product.inStock) {
        toast.error('Этого товара нет в наличии.');
        return;
      }
      addItem(product)
      toast.success(`${product.name} добавлен в корзину!`)
    } else {
      toast.error('Не удалось добавить товар в корзину.')
    }
  }

  const handleWhatsAppOrder = () => {
    if (!product) return
    
    let message = `Здравствуйте! Меня интересует заказ товара "${product.name}" из ZerekLab.\n\n`
    message += `Информация о товаре:\n`
    message += `- Название: ${product.name}\n`
    message += `- Цена: ₸${product.price.toLocaleString()}\n`
    if(product.category) message += `- Категория: ${product.category}\n`;
    if(product.sku) message += `- Артикул: ${product.sku}\n`;
    message += `\nПожалуйста, предоставьте информацию о наличии и способах оплаты. Спасибо!`;
    
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '71234567890'; 
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const nextImage = () => {
    if (product && product.images && product.images.length > 1) {
      setSelectedImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (product && product.images && product.images.length > 1) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded-md mb-8 w-48"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
              <div className="space-y-5">
                <div className="aspect-square bg-gray-200 rounded-xl shadow-md"></div>
                <div className="flex space-x-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg shadow-sm"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6 pt-2">
                <div className="h-10 bg-gray-300 rounded-md w-3/4"></div>
                <div className="h-8 bg-gray-300 rounded-md w-1/2"></div>
                <div className="space-y-3 pt-4">
                  <div className="h-5 bg-gray-200 rounded-md w-1/3"></div>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded-md w-full"></div>
                  ))}
                </div>
                <div className="space-y-3 pt-4">
                  <div className="h-5 bg-gray-200 rounded-md w-1/3"></div>
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded-md w-4/5"></div>
                  ))}
                </div>
                <div className="h-12 bg-gray-300 rounded-lg mt-6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 flex flex-col items-center justify-center text-center p-6">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Товар не найден</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          К сожалению, мы не смогли найти товар, который вы ищете. Возможно, он был удален или ссылка устарела.
        </p>
        <Link
          href="/products"
          className="bg-primary-500 text-white px-8 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium text-lg shadow-md hover:shadow-lg"
        >
          К каталогу товаров
        </Link>
      </div>
    )
  }

  const productImages = product.images && product.images.length > 0 ? product.images : [placeholderImage];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6 sm:mb-8">
          <Link href="/" className="hover:text-primary-600 hover:underline">Главная</Link>
          <ChevronLeft className="w-4 h-4 rotate-180 text-gray-400" />
          <Link href="/products" className="hover:text-primary-600 hover:underline">Товары</Link>
          <ChevronLeft className="w-4 h-4 rotate-180 text-gray-400" />
          <span className="text-gray-700 font-medium truncate max-w-xs sm:max-w-sm">{product.name}</span>
        </nav>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-lg group">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={selectedImageIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={productImages[selectedImageIndex]}
                      alt={`${product.name} - изображение ${selectedImageIndex + 1}`}
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
                      className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white p-2 sm:p-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 z-10 opacity-80 group-hover:opacity-100"
                    >
                      <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      aria-label="Следующее изображение"
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white p-2 sm:p-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 z-10 opacity-80 group-hover:opacity-100"
                    >
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                    </button>
                  </>
                )}
                {!product.inStock && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="text-white text-xs sm:text-sm font-semibold bg-red-600 px-3 py-1.5 rounded-md shadow-md">Нет в наличии</span>
                  </div>
                )}
              </div>

              {productImages.length > 1 && (
                <div className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-2 pt-1">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`Показать изображение ${index + 1}`}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 relative bg-gray-100 rounded-md sm:rounded-lg overflow-hidden border-2 transition-all duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm hover:shadow-md ${
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
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 leading-tight">{product.name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                  <span className="text-3xl lg:text-4xl font-bold text-primary-600">
                    ₸{product.price.toLocaleString()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-sm ${
                    product.inStock 
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {product.inStock ? 'В наличии' : 'Нет в наличии'}
                  </span>
                  {product.sku && <span className="text-xs text-gray-500">Арт: {product.sku}</span>}
                </div>
              </div>
              
              <ProductDetailSection icon={Info} title="Описание">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description || 'Описание отсутствует.'}</p>
              </ProductDetailSection>

              {product.features && product.features.length > 0 && (
                <ProductDetailSection icon={Star} title="Ключевые особенности">
                  <ul className="space-y-2 list-inside">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2.5">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </ProductDetailSection>
              )}
              
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                 <ProductDetailSection icon={Zap} title="Характеристики">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="flex">
                                <span className="font-medium text-gray-600 w-2/5 capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span className="text-gray-800 w-3/5">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                </ProductDetailSection>
              )}

               <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm pt-2">
                    {product.category && <InfoPill icon={Layers} label="Категория" value={product.category} />} 
                    {product.subcategory && <InfoPill icon={Layers} label="Подкатегория" value={product.subcategory} />} 
                    {product.difficulty && <InfoPill icon={Star} label="Сложность" value={product.difficulty} />} 
                    {product.ageRange && <InfoPill icon={UsersIcon} label="Возраст" value={product.ageRange + " лет"} />} 
                    {product.tags && product.tags.length > 0 && (
                        <div className="col-span-full">
                            <InfoPill icon={Tag} label="Теги" value={product.tags.join(', ')} /> 
                        </div>
                    )}
               </div>

              <div className="space-y-3 pt-6 border-t border-gray-200">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2.5 text-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}</span>
                </button>
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2.5 text-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Заказать по WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ProductDetailSection = ({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <Icon className="w-5 h-5 text-primary-500 mr-2.5" />
        {title}
      </h3>
      {children}
    </div>
  );
};

const InfoPill = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
        <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <p className="text-xs text-gray-700">
            <span className="font-medium text-gray-600">{label}:</span> {value}
        </p>
    </div>
); 