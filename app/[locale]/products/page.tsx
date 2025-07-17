'use client';

import ProductFilters from '@/components/ProductFilters';
import ProductGrid from '@/components/ProductGrid';
import { useLocale } from '@/hooks/useLocale';
import { t } from '@/lib/i18n';
import { IProduct } from '@/types';

import { Suspense, useEffect, useMemo, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Filter, Grid3X3, List, Loader2, X } from 'lucide-react';

interface ProductsResponse {
  products: IProduct[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

function ProductsPageContent() {
  const locale = useLocale();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [pagination, setPagination] = useState<
    ProductsResponse['pagination'] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const searchParams = useSearchParams();
  const router = useRouter();

  const fetchProducts = useMemo(
    () => async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams.toString());

        const response = await fetch(`/api/products?${params}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || t('products.loading', locale));
        }

        const data: ProductsResponse = await response.json();
        setProducts(data.products);
        setPagination(data.pagination);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    },
    [searchParams, locale]
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/${locale}/products?${params.toString()}`, { scroll: false });
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
          <p className="text-lg text-gray-600">
            {t('products.loading', locale)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-1 text-3xl font-bold text-gray-900 sm:mb-2">
              {t('products.title', locale)}
            </h1>
            <p className="text-gray-600">
              {pagination
                ? `${t('products.found', locale)}: ${pagination.totalProducts}`
                : t('products.loading', locale)}
            </p>
          </div>

          <div className="mt-4 flex items-center space-x-3 sm:mt-0 sm:space-x-4">
            {/* View Mode Toggle */}
            <div className="hidden items-center space-x-1 rounded-lg border border-gray-300 bg-white p-1 shadow-sm sm:flex">
              <button
                onClick={() => setViewMode('grid')}
                aria-label={t('products.viewGrid', locale)}
                className={`rounded-md p-1.5 transition-colors sm:p-2 ${
                  viewMode === 'grid'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-primary-500'
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-label={t('products.viewList', locale)}
                className={`rounded-md p-1.5 transition-colors sm:p-2 ${
                  viewMode === 'list'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-primary-500'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-primary-600 shadow-sm transition-colors hover:bg-gray-100 lg:hidden"
            >
              <Filter className="h-5 w-5" />
              <span>
                {showFilters
                  ? t('products.hideFilters', locale)
                  : t('products.filters', locale)}
              </span>
            </button>
          </div>
        </div>

        {/* Filters Modal for mobile/tablet */}
        {showFilters && (
          <div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setShowFilters(false)}
          >
            <div
              className="fixed right-0 top-0 h-full w-full max-w-sm transform overflow-y-auto bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out"
              onClick={e => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <ProductFilters />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters Sidebar for Desktop */}
          <div className="hidden lg:block lg:w-64 xl:w-72">
            <div className="sticky top-24 rounded-xl bg-white p-6 shadow-lg">
              <ProductFilters />
            </div>
          </div>

          {/* Products Grid / List and Pagination */}
          <div className="flex-1">
            {loading && products.length > 0 && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                <p className="ml-3 text-gray-600">
                  {t('products.updating', locale)}
                </p>
              </div>
            )}
            {!loading && products.length === 0 && (
              <div className="rounded-lg bg-white py-12 text-center shadow-md">
                <Grid3X3 className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-xl font-semibold text-gray-700">
                  {t('products.noProducts', locale)}
                </h3>
                <p className="mb-6 text-gray-500">
                  {t('products.noProductsDesc', locale)}
                </p>
                <button
                  onClick={() => {
                    const params = new URLSearchParams();
                    router.push(`/${locale}/products?${params.toString()}`);
                  }}
                  className="inline-flex items-center space-x-2 rounded-lg bg-primary-500 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <span>{t('products.showAllProducts', locale)}</span>
                </button>
              </div>
            )}
            {products.length > 0 && (
              <ProductGrid products={products} viewMode={viewMode} />
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-10 flex justify-center sm:mt-12">
                <nav
                  aria-label={t('products.pages', locale)}
                  className="flex items-center space-x-1 sm:space-x-2"
                >
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                  >
                    {t('products.previous', locale)}
                  </button>

                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === pagination.currentPage;

                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= pagination.currentPage - 1 &&
                        page <= pagination.currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          aria-current={isCurrentPage ? 'page' : undefined}
                          className={`rounded-lg px-3 py-2 text-sm font-medium shadow-sm transition-colors sm:px-4 ${
                            isCurrentPage
                              ? 'border-primary-500 bg-primary-500 text-white'
                              : 'border border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === pagination.currentPage - 2 ||
                      page === pagination.currentPage + 2
                    ) {
                      return (
                        <span
                          key={page}
                          className="px-1 py-2 text-gray-500 sm:px-2"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                  >
                    {t('products.next', locale)}
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
            <p className="text-lg text-gray-600">Загрузка товаров...</p>
          </div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
