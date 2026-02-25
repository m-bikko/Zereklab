'use client';

import { useSalesAuth } from '@/hooks/useSalesAuth';
import { cleanPhoneInput } from '@/lib/phoneUtils';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Filter,
  Gift,
  LogOut,
  Package,
  Phone,
  RefreshCw,
  Search,
  User,
} from 'lucide-react';

interface SaleItem {
  productId: string;
  productName: string;
  price: number;
  salePrice?: number;
  quantity: number;
  totalPrice: number;
}

interface Sale {
  _id: string;
  customerPhone: string;
  items: SaleItem[];
  totalAmount: number;
  bonusesEarned: number;
  saleDate: string;
}

interface SalesResponse {
  sales: Sale[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalSales: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function SalesHistoryPage() {
  const { isAuthenticated, isLoading, user, logout } = useSalesAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [pagination, setPagination] = useState<
    SalesResponse['pagination'] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [phoneFilter, setPhoneFilter] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/ru/sales-login';
    }
  }, [isAuthenticated, isLoading]);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      if (phoneFilter.trim()) {
        params.append('phone', phoneFilter);
      }

      const response = await fetch(`/api/sales?${params}`);

      if (response.ok) {
        const data: SalesResponse = await response.json();
        setSales(data.sales);
        setPagination(data.pagination);
      } else {
        toast.error('Ошибка загрузки истории продаж');
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Ошибка загрузки истории продаж');
    } finally {
      setLoading(false);
    }
  }, [currentPage, phoneFilter]);

  // Fetch sales data
  useEffect(() => {
    if (isAuthenticated) {
      fetchSales();
    }
  }, [isAuthenticated, currentPage, phoneFilter, fetchSales]);

  const handlePhoneInputChange = (value: string) => {
    const cleaned = cleanPhoneInput(value);
    setPhoneInput(cleaned);
  };

  const handleSearch = () => {
    setPhoneFilter(phoneInput);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setPhoneFilter('');
    setPhoneInput('');
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU') + ' ₸';
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
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
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                История продаж
              </h1>
              <p className="text-gray-600">
                {pagination
                  ? `Всего продаж: ${pagination.totalSales}`
                  : 'Загрузка...'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="h-5 w-5" />
                <span>{user?.fullName}</span>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                <span>Фильтры</span>
              </button>
              <button
                onClick={fetchSales}
                disabled={loading}
                className="flex items-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
                <span>Обновить</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Выйти</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 border-t pt-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Номер покупателя
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={e => handlePhoneInputChange(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                      placeholder="+7 (777) 123-12-12"
                      className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="flex items-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Search className="h-4 w-4" />
                    <span>Найти</span>
                  </button>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Очистить фильтры
                  </button>
                </div>
                {phoneFilter && (
                  <div className="flex items-end">
                    <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                      Фильтр: {phoneFilter}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sales List */}
        {loading && sales.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-600">Загрузка истории продаж...</p>
            </div>
          </div>
        ) : sales.length === 0 ? (
          <div className="rounded-lg bg-white py-12 text-center shadow-sm">
            <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-xl font-semibold text-gray-700">
              Продажи не найдены
            </h3>
            <p className="text-gray-500">
              {phoneFilter
                ? 'Продажи для указанного номера не найдены'
                : 'История продаж пуста'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map(sale => (
              <div key={sale._id} className="rounded-lg bg-white p-6 shadow-sm">
                <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
                  {/* Sale Info */}
                  <div className="flex-1">
                    <div className="mb-4 flex flex-wrap items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {sale.customerPhone}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {formatDate(sale.saleDate)}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Товары:</h4>
                      {sale.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded bg-gray-50 p-3"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.productName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatPrice(item.salePrice || item.price)} ×{' '}
                              {item.quantity}
                              {item.salePrice && (
                                <span className="ml-2 text-xs text-green-600">
                                  Скидка
                                </span>
                              )}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {formatPrice(item.totalPrice)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="lg:w-64">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Сумма:</span>
                          </div>
                          <span className="text-xl font-bold text-gray-900">
                            {formatPrice(sale.totalAmount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t pt-3">
                          <div className="flex items-center space-x-2">
                            <Gift className="h-4 w-4 text-green-500" />
                            <span className="text-gray-600">Бонусы:</span>
                          </div>
                          <span className="font-semibold text-green-600">
                            +{sale.bonusesEarned}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-4">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Предыдущая</span>
            </button>

            <span className="text-gray-600">
              Страница {pagination.currentPage} из {pagination.totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>Следующая</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
