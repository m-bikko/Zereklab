'use client';

import { useSalesAuth } from '@/hooks/useSalesAuth';
import { IProduct, getLocalizedText } from '@/types';
import { cleanPhoneInput, isValidPhoneNumber } from '@/lib/phoneUtils';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';

import { 
  Minus, 
  Plus, 
  ShoppingCart, 
  Search, 
  X, 
  Package, 
  Gift,
  Calculator,
  Phone,
  LogOut,
  User
} from 'lucide-react';

interface SaleItem {
  product: IProduct;
  quantity: number;
}

export default function SalesPage() {
  const { isAuthenticated, isLoading, user, logout } = useSalesAuth();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/ru/sales-login';
    }
  }, [isAuthenticated, isLoading]);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products?simple=true');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        toast.error('Ошибка загрузки товаров');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    const cleaned = cleanPhoneInput(value);
    setCustomerPhone(cleaned);
  };

  const addProductToSale = (product: IProduct) => {
    const existingItem = selectedItems.find(item => item.product._id === product._id);
    
    if (existingItem) {
      setSelectedItems(prev => 
        prev.map(item => 
          item.product._id === product._id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedItems(prev => [...prev, { product, quantity: 1 }]);
    }
    
    setShowProductModal(false);
    toast.success(`${getLocalizedText(product.name, 'ru')} добавлен в продажу`);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setSelectedItems(prev => 
      prev.map(item => 
        item.product._id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setSelectedItems(prev => prev.filter(item => item.product._id !== productId));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      const price = item.product.salePrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateBonuses = () => {
    return Math.floor(calculateTotal() * 0.05);
  };

  const processSale = async () => {
    if (!isValidPhoneNumber(customerPhone)) {
      toast.error('Введите корректный номер телефона');
      return;
    }

    if (selectedItems.length === 0) {
      toast.error('Добавьте товары в продажу');
      return;
    }

    try {
      setProcessing(true);
      
      const saleData = {
        customerPhone,
        items: selectedItems.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
      };

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Продажа оформлена! Начислено ${result.sale.bonusesEarned} бонусов`);
        
        // Reset form
        setSelectedItems([]);
        setCustomerPhone('');
        
        // Refresh products to update stock
        fetchProducts();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка при оформлении продажи');
      }
    } catch (error) {
      console.error('Error processing sale:', error);
      toast.error('Ошибка при оформлении продажи');
    } finally {
      setProcessing(false);
    }
  };

  const filteredProducts = products.filter(product =>
    getLocalizedText(product.name, 'ru').toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Система продаж</h1>
              <p className="text-gray-600">Оформление продаж и начисление бонусов</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="h-5 w-5" />
                <span>{user?.fullName}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top Controls Row */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Customer Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Номер покупателя
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+7 (777) 123-12-12"
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              {customerPhone && !isValidPhoneNumber(customerPhone) && (
                <p className="mt-1 text-sm text-red-600">
                  Введите номер в формате +7 (777) 123-12-12
                </p>
              )}
            </div>

            {/* Add Product Button */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Выбор товара
              </label>
              <button
                onClick={() => setShowProductModal(true)}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
              >
                <Plus className="h-5 w-5" />
                <span>Добавить товар</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Товаров в корзине
              </label>
              <div className="flex h-10 items-center rounded-lg bg-gray-50 px-3">
                <ShoppingCart className="mr-2 h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900">{selectedItems.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Items and Summary */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Selected Items - Takes 2/3 width on xl screens */}
          <div className="xl:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Список выбранных товаров
              </h3>
                
              {selectedItems.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <ShoppingCart className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                  <p>Товары не выбраны</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedItems.map((item) => {
                    const price = item.product.salePrice || item.product.price;
                    return (
                      <div key={item.product._id} className="flex items-center space-x-3 rounded-lg border bg-white p-3">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {item.product.images && item.product.images.length > 0 ? (
                            <Image
                              src={item.product.images[0]}
                              alt={getLocalizedText(item.product.name, 'ru')}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{getLocalizedText(item.product.name, 'ru')}</h4>
                          <p className="text-sm text-gray-600">
                            {price.toLocaleString()} ₸
                            {item.product.salePrice && (
                              <span className="ml-2 text-xs text-green-600">Скидка</span>
                            )}
                          </p>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => item.product._id && updateQuantity(item.product._id, item.quantity - 1)}
                            className="rounded-full bg-gray-200 p-1 text-gray-700 hover:bg-gray-300"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          
                          <span className="w-8 text-center font-medium text-gray-900">{item.quantity}</span>
                          
                          <button
                            onClick={() => item.product._id && updateQuantity(item.product._id, item.quantity + 1)}
                            className="rounded-full bg-gray-200 p-1 text-gray-700 hover:bg-gray-300"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => item.product._id && removeItem(item.product._id)}
                            className="ml-2 rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Summary - Takes 1/3 width on xl screens, full width on smaller screens */}
          {selectedItems.length > 0 && (
            <div className="xl:col-span-1">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Итого</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Общая сумма:</span>
                    <span className="font-semibold">{calculateTotal().toLocaleString()} ₸</span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-3">
                    <div className="flex items-center space-x-2">
                      <Gift className="h-5 w-5 text-green-500" />
                      <span className="text-gray-600">Бонусы к начислению:</span>
                    </div>
                    <span className="font-semibold text-green-600">
                      {calculateBonuses()} бонусов
                    </span>
                  </div>
                </div>

                <button
                  onClick={processSale}
                  disabled={processing || !isValidPhoneNumber(customerPhone)}
                  className="mt-6 flex w-full items-center justify-center space-x-2 rounded-lg bg-green-500 px-4 py-3 text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Обработка...</span>
                    </>
                  ) : (
                    <>
                      <Calculator className="h-5 w-5" />
                      <span>Накопить бонус</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Product Selection Modal */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white m-4">
              <div className="flex items-center justify-between border-b bg-white p-4">
                <h2 className="text-xl font-semibold text-gray-900">Выберите товар</h2>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="bg-white p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Поиск товаров..."
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {loading ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                      <p className="mt-2 text-gray-600">Загрузка товаров...</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      <Package className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                      <p className="text-gray-500">Товары не найдены</p>
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => addProductToSale(product)}
                        disabled={!product.inStock}
                        className="w-full rounded-lg border bg-white p-3 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <div className="flex items-center space-x-3">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={product.images[0]}
                                alt={getLocalizedText(product.name, 'ru')}
                                width={64}
                                height={64}
                                className="h-16 w-16 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                                <Package className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{getLocalizedText(product.name, 'ru')}</h4>
                            <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                            <p className="text-sm font-medium text-blue-600">
                              {(product.salePrice || product.price).toLocaleString()} ₸
                              {product.salePrice && (
                                <span className="ml-2 text-xs text-gray-500 line-through">
                                  {product.price.toLocaleString()} ₸
                                </span>
                              )}
                            </p>
                          </div>
                          
                          {/* Stock Status */}
                          <div className="text-right">
                            <span className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                              {product.inStock ? 'В наличии' : 'Нет в наличии'}
                            </span>
                            {product.stockQuantity !== undefined && (
                              <p className="text-xs text-gray-500">Остаток: {product.stockQuantity}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}