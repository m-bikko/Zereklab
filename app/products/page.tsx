'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProductGrid from '@/components/ProductGrid'
import ProductFilters from '@/components/ProductFilters'
import { IProduct } from '@/types'
import { Filter, Grid3X3, List, X, Loader2 } from 'lucide-react'

interface ProductsResponse {
  products: IProduct[]
  pagination: {
    currentPage: number
    totalPages: number
    totalProducts: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([])
  const [pagination, setPagination] = useState<ProductsResponse['pagination'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const searchParams = useSearchParams()
  const router = useRouter()

  const fetchProducts = useMemo(() => async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(searchParams.toString())
      
      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Не удалось загрузить товары')
      }
      
      const data: ProductsResponse = await response.json()
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Ошибка при загрузке товаров:', error)
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/products?${params.toString()}`, { scroll: false })
  }

  if (loading && products.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
          <p className="text-lg text-gray-600">Загрузка товаров...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Образовательные Наборы</h1>
            <p className="text-gray-600">
              {pagination ? `Найдено товаров: ${pagination.totalProducts}` : 'Загрузка...'}
            </p>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4 mt-4 sm:mt-0">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center space-x-1 bg-white p-1 rounded-lg border border-gray-300 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Вид сетка"
                className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary-500 text-white shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-primary-500'
                }`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-label="Вид список"
                className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary-500 text-white shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-primary-500'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-primary-600 shadow-sm lg:hidden"
            >
              <Filter className="w-5 h-5" />
              <span>{showFilters ? 'Скрыть фильтры' : 'Фильтры'}</span>
            </button>
          </div>
        </div>

        {/* Filters Modal for mobile/tablet */}
        {showFilters && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={() => setShowFilters(false)}>
            <div 
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl p-6 overflow-y-auto transform transition-transform duration-300 ease-in-out"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Фильтры</h2>
                <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700 p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <ProductFilters />
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar for Desktop */}
          <div className="hidden lg:block lg:w-64 xl:w-72">
            <div className="bg-white p-6 rounded-xl shadow-lg sticky top-24">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Фильтры</h2>
              <ProductFilters />
            </div>
          </div>

          {/* Products Grid / List and Pagination */}
          <div className="flex-1">
            {loading && products.length > 0 && (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" /> 
                    <p className="ml-3 text-gray-600">Обновление товаров...</p>
                </div>
            )}
            {!loading && products.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <Grid3X3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Товары не найдены</h3>
                <p className="text-gray-500">Попробуйте изменить критерии фильтрации или сбросить фильтры.</p>
              </div>
            )}
            {products.length > 0 && <ProductGrid products={products} viewMode={viewMode} />} 
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-10 sm:mt-12 flex justify-center">
                <nav aria-label="Навигация по страницам" className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Назад
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1
                    const isCurrentPage = page === pagination.currentPage
                    
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          aria-current={isCurrentPage ? 'page' : undefined}
                          className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${ 
                            isCurrentPage
                              ? 'bg-primary-500 text-white border-primary-500'
                              : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (
                      page === pagination.currentPage - 2 ||
                      page === pagination.currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-1 sm:px-2 py-2 text-gray-500">
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Вперед
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 