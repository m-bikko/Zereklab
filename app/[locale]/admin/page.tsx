'use client';

import AdminGuard from '@/components/AdminGuard';
import CategoryManagement from '@/components/admin/CategoryManagement';
import ContactManagement from '@/components/admin/ContactManagement';
import ProductManagement from '@/components/admin/ProductManagement';
import { useAuth } from '@/hooks/useAuth';
import { ICategory, IProduct } from '@/types';
import { IContactDocument } from '@/models/Contact';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import dynamic from 'next/dynamic';

import {
  BarChart3,
  Calendar,
  LogOut,
  Mail,
  Package,
  RefreshCw,
  Settings,
  Tags,
  Users,
} from 'lucide-react';

// Динамический импорт для избежания проблем с SSR
const DailyQuotesManagement = dynamic(
  () => import('@/components/admin/DailyQuotesManagement'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    ),
  }
);

export default function AdminPage() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    | 'products'
    | 'categories'
    | 'contacts'
    | 'daily-quotes'
    | 'analytics'
    | 'users'
    | 'settings'
  >('products');
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [contacts, setContacts] = useState<IContactDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, contactsRes] = await Promise.all([
        fetch('/api/products?simple=true'),
        fetch('/api/categories'),
        fetch('/api/contact'),
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      } else {
        toast.error('Ошибка загрузки товаров');
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      } else {
        toast.error('Ошибка загрузки категорий');
      }

      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setContacts(contactsData.data || []);
      } else {
        toast.error('Ошибка загрузки обращений');
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Вы успешно вышли из системы');
  };

  const handleRefresh = () => {
    fetchData();
  };

  const tabClass = (tabName: string) =>
    `flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
      activeTab === tabName
        ? 'bg-blue-500 text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  ZerekLab - Админ панель
                </h1>
                <button
                  onClick={handleRefresh}
                  className="p-2 text-gray-500 transition-colors hover:text-gray-700"
                  title="Обновить данные"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar */}
            <aside className="lg:w-64">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('products')}
                  className={tabClass('products')}
                >
                  <Package className="h-5 w-5" />
                  <span>Товары</span>
                  <span className="ml-auto rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700">
                    {products.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={tabClass('categories')}
                >
                  <Tags className="h-5 w-5" />
                  <span>Категории</span>
                  <span className="ml-auto rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700">
                    {categories.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('contacts')}
                  className={tabClass('contacts')}
                >
                  <Mail className="h-5 w-5" />
                  <span>Обращения</span>
                  {contacts.filter(c => c.status === 'new').length > 0 && (
                    <span className="ml-auto rounded-full bg-red-500 px-2 py-1 text-xs text-white">
                      {contacts.filter(c => c.status === 'new').length}
                    </span>
                  )}
                  {contacts.filter(c => c.status === 'new').length === 0 && (
                    <span className="ml-auto rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700">
                      {contacts.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('daily-quotes')}
                  className={tabClass('daily-quotes')}
                >
                  <Calendar className="h-5 w-5" />
                  <span>Цитаты дня</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={tabClass('analytics')}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Аналитика</span>
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={tabClass('users')}
                >
                  <Users className="h-5 w-5" />
                  <span>Пользователи</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={tabClass('settings')}
                >
                  <Settings className="h-5 w-5" />
                  <span>Настройки</span>
                </button>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {activeTab === 'products' && (
                <ProductManagement
                  products={products}
                  categories={categories}
                  loading={loading}
                  onRefresh={handleRefresh}
                />
              )}

              {activeTab === 'categories' && (
                <CategoryManagement
                  categories={categories}
                  loading={loading}
                  onRefresh={handleRefresh}
                />
              )}

              {activeTab === 'contacts' && (
                <ContactManagement
                  contacts={contacts}
                  loading={loading}
                  onRefresh={handleRefresh}
                />
              )}

              {activeTab === 'daily-quotes' && <DailyQuotesManagement />}

              {activeTab === 'analytics' && (
                <div className="rounded-lg bg-white p-6">
                  <h2 className="mb-6 text-xl font-semibold">Аналитика</h2>

                  <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-blue-50 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">
                            Всего товаров
                          </p>
                          <p className="text-3xl font-bold text-blue-900">
                            {products.length}
                          </p>
                        </div>
                        <Package className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>

                    <div className="rounded-lg bg-green-50 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">
                            В наличии
                          </p>
                          <p className="text-3xl font-bold text-green-900">
                            {products.filter(p => p.inStock).length}
                          </p>
                        </div>
                        <Package className="h-8 w-8 text-green-500" />
                      </div>
                    </div>

                    <div className="rounded-lg bg-yellow-50 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-600">
                            Категории
                          </p>
                          <p className="text-3xl font-bold text-yellow-900">
                            {categories.length}
                          </p>
                        </div>
                        <Tags className="h-8 w-8 text-yellow-500" />
                      </div>
                    </div>

                    <div className="rounded-lg bg-red-50 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-600">
                            Нет в наличии
                          </p>
                          <p className="text-3xl font-bold text-red-900">
                            {products.filter(p => !p.inStock).length}
                          </p>
                        </div>
                        <Package className="h-8 w-8 text-red-500" />
                      </div>
                    </div>
                  </div>

                  <div className="py-10 text-center text-gray-500">
                    <BarChart3 className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <h3 className="mb-2 text-lg font-medium">
                      Подробная аналитика в разработке
                    </h3>
                    <p>
                      Здесь будут отображаться графики продаж, популярные товары
                      и другая статистика
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="rounded-lg bg-white p-6">
                  <h2 className="mb-6 text-xl font-semibold">
                    Управление пользователями
                  </h2>
                  <div className="py-10 text-center text-gray-500">
                    <Users className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <h3 className="mb-2 text-lg font-medium">
                      Система пользователей в разработке
                    </h3>
                    <p>
                      Здесь будет управление пользователями, их заказами и
                      профилями
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="rounded-lg bg-white p-6">
                  <h2 className="mb-6 text-xl font-semibold">
                    Настройки системы
                  </h2>
                  <div className="space-y-6">
                    <div className="rounded-lg border p-4">
                      <h3 className="mb-2 font-medium">Информация о системе</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <strong>Версия:</strong> ZerekLab v1.0
                        </p>
                        <p>
                          <strong>База данных:</strong> MongoDB
                        </p>
                        <p>
                          <strong>Фреймворк:</strong> Next.js 14
                        </p>
                        <p>
                          <strong>Авторизация:</strong> localStorage-based
                        </p>
                      </div>
                    </div>

                    <div className="py-10 text-center text-gray-500">
                      <Settings className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                      <h3 className="mb-2 text-lg font-medium">
                        Дополнительные настройки в разработке
                      </h3>
                      <p>
                        Здесь будут настройки сайта, способов оплаты, доставки и
                        другие параметры
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
