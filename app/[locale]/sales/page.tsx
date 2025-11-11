'use client';

import { useSalesAuth } from '@/hooks/useSalesAuth';
import { IProduct, getLocalizedText } from '@/types';
import { cleanPhoneInput, isValidPhoneNumber } from '@/lib/phoneUtils';
import BonusManagement from '@/components/admin/BonusManagement';
import BonusProcessing from '@/components/admin/BonusProcessing';

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
  User,
  Clock,
  CreditCard
} from 'lucide-react';

interface SaleItem {
  product: IProduct;
  quantity: number;
}

interface BonusData {
  phoneNumber: string;
  fullName?: string;
  availableBonuses: number;
  totalBonuses: number;
  usedBonuses: number;
  lastUpdated: string;
  pendingBonuses?: {
    available: Array<{
      _id: string;
      bonusAmount: number;
      availableDate: string;
    }>;
    upcoming: Array<{
      _id: string;
      bonusAmount: number;
      availableDate: string;
    }>;
    totalAvailable: number;
    totalUpcoming: number;
  };
}

export default function SalesPage() {
  const { isAuthenticated, isLoading, user, logout } = useSalesAuth();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerFullName, setCustomerFullName] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [bonusData, setBonusData] = useState<BonusData | null>(null);
  const [activeTab, setActiveTab] = useState('sales');

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
    
    // Clear bonus data when phone changes
    if (bonusData) {
      setBonusData(null);
    }
  };

  const searchBonuses = async () => {
    if (!isValidPhoneNumber(customerPhone)) {
      toast.error('Введите корректный номер телефона');
      return;
    }

    try {
      setLoading(true);
      
      // Fetch both current bonuses and pending bonuses
      const [bonusResponse, pendingResponse] = await Promise.all([
        fetch(`/api/bonuses?phone=${encodeURIComponent(customerPhone)}`),
        fetch(`/api/pending-bonuses?phone=${encodeURIComponent(customerPhone)}`)
      ]);
      
      if (bonusResponse.ok) {
        const bonusData = await bonusResponse.json();
        const combinedData = bonusData;
        
        // Add pending bonus data if available
        if (pendingResponse.ok) {
          const pendingData = await pendingResponse.json();
          combinedData.pendingBonuses = pendingData.pendingBonuses;
        }
        
        setBonusData(combinedData);
        setShowBonusModal(true);
      } else {
        const errorData = await bonusResponse.json();
        toast.error(errorData.error || 'Ошибка при поиске бонусов');
      }
    } catch (err) {
      console.error('Error fetching bonuses:', err);
      toast.error('Ошибка при поиске бонусов');
    } finally {
      setLoading(false);
    }
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
    return Math.floor(calculateTotal() * 0.03);
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
        customerFullName: customerFullName.trim() || undefined,
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
        toast.success(`Продажа оформлена! ${result.sale.bonusesEarned} бонусов будут доступны ${new Date(result.sale.bonusAvailableDate).toLocaleDateString('ru-RU')}`);
        
        // Reset form
        setSelectedItems([]);
        setCustomerPhone('');
        setCustomerFullName('');
        setBonusData(null);
        
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
              <p className="text-gray-600">Оформление продаж и управление бонусами</p>
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

        {/* Navigation Tabs */}
        <div className="mb-6 rounded-lg bg-white shadow-sm">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'sales'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Продажи</span>
            </button>
            <button
              onClick={() => setActiveTab('bonuses')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'bonuses'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Gift className="h-5 w-5" />
              <span>Управление бонусами</span>
            </button>
            <button
              onClick={() => setActiveTab('processing')}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'processing'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CreditCard className="h-5 w-5" />
              <span>Обработка бонусов</span>
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'sales' && (
          <>
        {/* Top Controls Row */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
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

            {/* Customer Full Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ФИО покупателя (необязательно)
              </label>
              <input
                type="text"
                value={customerFullName}
                onChange={(e) => setCustomerFullName(e.target.value)}
                placeholder="Иванов Иван Иванович"
                className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Add Product Button */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Действия
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowProductModal(true)}
                  className="flex items-center justify-center space-x-2 rounded-lg bg-blue-500 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-600"
                >
                  <Plus className="h-4 w-4" />
                  <span>Товар</span>
                </button>
                <button
                  onClick={searchBonuses}
                  disabled={!isValidPhoneNumber(customerPhone) || loading}
                  className="flex items-center justify-center space-x-2 rounded-lg bg-purple-500 px-3 py-2 text-sm text-white transition-colors hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Gift className="h-4 w-4" />
                  <span>Бонусы</span>
                </button>
              </div>
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
                      <Clock className="h-5 w-5 text-orange-500" />
                      <span className="text-gray-600">Бонусы через 10 дней:</span>
                    </div>
                    <span className="font-semibold text-orange-600">
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

        {/* Bonus Modal */}
        {showBonusModal && bonusData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-lg bg-white m-4">
              <div className="flex items-center justify-between border-b bg-white p-4">
                <h2 className="text-xl font-semibold text-gray-900">Бонусы клиента</h2>
                <button
                  onClick={() => setShowBonusModal(false)}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {/* Current Available Bonuses */}
                  <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Доступные сейчас</p>
                      <p className="text-3xl font-bold text-green-600">
                        {bonusData.availableBonuses}
                      </p>
                      <p className="text-sm text-gray-500">бонусов</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-blue-50 p-3 text-center">
                      <p className="text-xs text-gray-600 mb-1">Всего накоплено</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {bonusData.totalBonuses}
                      </p>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-3 text-center">
                      <p className="text-xs text-gray-600 mb-1">Потрачено</p>
                      <p className="text-lg font-semibold text-purple-600">
                        {bonusData.usedBonuses}
                      </p>
                    </div>
                  </div>

                  {/* Pending Bonuses Section */}
                  {bonusData.pendingBonuses && (
                    <div className="space-y-3">
                      {/* Ready to credit bonuses */}
                      {bonusData.pendingBonuses.available && bonusData.pendingBonuses.available.length > 0 && (
                        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                          <div className="text-center mb-3">
                            <p className="text-sm font-medium text-yellow-800">Готовы к начислению</p>
                            <p className="text-2xl font-bold text-yellow-700">
                              {bonusData.pendingBonuses.totalAvailable}
                            </p>
                            <p className="text-xs text-yellow-600">бонусов</p>
                          </div>
                          <div className="space-y-2">
                            {bonusData.pendingBonuses.available.map((bonus) => (
                              <div key={bonus._id} className="flex justify-between text-xs text-yellow-700">
                                <span>Покупка от {new Date(bonus.availableDate).toLocaleDateString('ru-RU')}</span>
                                <span>{bonus.bonusAmount} бонусов</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Upcoming bonuses */}
                      {bonusData.pendingBonuses.upcoming && bonusData.pendingBonuses.upcoming.length > 0 && (
                        <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
                          <div className="text-center mb-3">
                            <p className="text-sm font-medium text-orange-800">Ожидают начисления</p>
                            <p className="text-2xl font-bold text-orange-700">
                              {bonusData.pendingBonuses.totalUpcoming}
                            </p>
                            <p className="text-xs text-orange-600">бонусов</p>
                          </div>
                          <div className="space-y-2">
                            {bonusData.pendingBonuses.upcoming.map((bonus) => (
                              <div key={bonus._id} className="flex justify-between text-xs text-orange-700">
                                <span>Будут доступны {new Date(bonus.availableDate).toLocaleDateString('ru-RU')}</span>
                                <span>{bonus.bonusAmount} бонусов</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Последнее обновление: {new Date(bonusData.lastUpdated).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {/* Bonus Management Tab */}
        {activeTab === 'bonuses' && (
          <BonusManagement />
        )}

        {/* Bonus Processing Tab */}
        {activeTab === 'processing' && (
          <BonusProcessing />
        )}
      </div>
    </div>
  );
}