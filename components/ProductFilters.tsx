'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { defaultCategories, ICategory } from '@/types'

interface ProductFiltersProps {
  onApplyFilters?: () => void;
}

export default function ProductFilters({ onApplyFilters }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [isExpanded, setIsExpanded] = useState(true)
  const [availableCategories, setAvailableCategories] = useState<ICategory[]>(defaultCategories)
  const [filters, setFilters] = useState(() => ({
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
    difficulty: searchParams.get('difficulty') || '',
    ageRange: searchParams.get('ageRange') || ''
  }))

  useEffect(() => {
    // Set initial filters from searchParams
    // fetchAvailableCategories() // This was causing issues, let's rely on defaultCategories or a dedicated API later
    const currentCategory = searchParams.get('category') || '';
    const currentSubcategory = searchParams.get('subcategory') || '';
    const currentMinPrice = searchParams.get('minPrice') || '';
    const currentMaxPrice = searchParams.get('maxPrice') || '';
    const currentInStock = searchParams.get('inStock') === 'true';
    const currentDifficulty = searchParams.get('difficulty') || '';
    const currentAgeRange = searchParams.get('ageRange') || '';

    setFilters({
      category: currentCategory,
      subcategory: currentSubcategory,
      minPrice: currentMinPrice,
      maxPrice: currentMaxPrice,
      inStock: currentInStock,
      difficulty: currentDifficulty,
      ageRange: currentAgeRange,
    });
  }, [searchParams])

  // const fetchAvailableCategories = async () => {
  //   try {
  //     // For now, using defaultCategories. 
  //     // In a real app, you might fetch this from a dedicated API endpoint.
  //     // const response = await fetch('/api/products?distinct=category'); // Example for dedicated endpoint
  //     // if (response.ok) {
  //     //   const data = await response.json();
  //     //   setAvailableCategories(data.categories); // Assuming API returns { categories: ["Electronics", "Robotics"] }
  //     // } else {
  //     //   console.warn("Could not fetch dynamic categories, using defaults.");
  //     //   setAvailableCategories(defaultCategories);
  //     // }
  //   } catch (error) {
  //     console.error('Error fetching categories:', error)
  //     // Fallback to default categories
  //     setAvailableCategories(defaultCategories)
  //   }
  // };
  
  const handleApplyButtonClick = () => {
    updateURL(filters);
    if (onApplyFilters) {
      onApplyFilters();
    }
  };

  const updateURL = useCallback((newFilters: typeof filters) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Remove page parameter when filters change
    params.delete('page')
    
    // Update filter parameters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value.toString())
      } else {
        params.delete(key)
      }
    })

    router.push(`${pathname}?${params.toString()}`)
  }, [router, searchParams, pathname])

  const handleFilterChange = (key: string, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value }
    // Reset subcategory when category changes
    if (key === 'category') {
      newFilters.subcategory = ''
    }
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      subcategory: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      difficulty: '',
      ageRange: ''
    }
    setFilters(clearedFilters)
    updateURL(clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== false
  )

  const getSelectedCategoryData = () => {
    return availableCategories.find(cat => cat.name === filters.category)
  }

  const selectedCategoryData = getSelectedCategoryData()

  return (
    <div className="space-y-6 bg-white rounded-xl shadow-md p-5">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Фильтры</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          aria-label={isExpanded ? "Свернуть фильтры" : "Развернуть фильтры"}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      <div className={`space-y-5 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Category Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2.5">Категория</h4>
          <div className="space-y-1.5">
            {(availableCategories || defaultCategories).map((category) => (
              <label key={category.name} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded-md">
                <input
                  type="radio"
                  name="category"
                  value={category.name}
                  checked={filters.category === category.name}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 focus:ring-offset-1"
                />
                <span className="text-sm text-gray-600">{category.name}</span>
              </label>
            ))}
             <label className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded-md">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={filters.category === ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 focus:ring-offset-1"
                />
                <span className="text-sm text-gray-600">Все категории</span>
              </label>
          </div>
        </div>

        {/* Subcategory Filter */}
        {selectedCategoryData && selectedCategoryData.subcategories && selectedCategoryData.subcategories.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2.5">Подкатегория</h4>
            <div className="space-y-1.5">
              {selectedCategoryData.subcategories.map((subcategory) => (
                <label key={subcategory} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded-md">
                  <input
                    type="radio"
                    name="subcategory"
                    value={subcategory}
                    checked={filters.subcategory === subcategory}
                    onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 focus:ring-offset-1"
                  />
                  <span className="text-sm text-gray-600">{subcategory}</span>
                </label>
              ))}
              <label className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded-md">
                <input
                  type="radio"
                  name="subcategory"
                  value=""
                  checked={filters.subcategory === ''}
                  onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 focus:ring-offset-1"
                />
                <span className="text-sm text-gray-600">Все подкатегории</span>
              </label>
            </div>
          </div>
        )}

        {/* Price Range Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2.5">Цена (₸)</h4>
          <div className="space-y-3">
            <div className="flex space-x-2 items-center">
              <input
                type="number"
                placeholder="От"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({...prev, minPrice: e.target.value}))}
                onBlur={() => handleFilterChange('minPrice', filters.minPrice)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
              <span className="text-gray-400">–</span>
              <input
                type="number"
                placeholder="До"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({...prev, maxPrice: e.target.value}))}
                onBlur={() => handleFilterChange('maxPrice', filters.maxPrice)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: 'До 5000', min: '', max: '5000' },
                { label: '5т - 15т', min: '5000', max: '15000' },
                { label: '15т - 30т', min: '15000', max: '30000' },
                { label: '30т+', min: '30000', max: '' }
              ].map((range) => (
                <button
                  key={range.label}
                  onClick={() => {
                    setFilters(prev => ({...prev, minPrice: range.min, maxPrice: range.max}));
                    // Update URL immediately or wait for apply button
                    // handleFilterChange('minPrice', range.min); 
                    // handleFilterChange('maxPrice', range.max);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1 ${
                    filters.minPrice === range.min && filters.maxPrice === range.max
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:border-gray-300'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Difficulty Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2.5">Сложность</h4>
          <div className="space-y-1.5">
            {['', 'Beginner', 'Intermediate', 'Advanced'].map((difficulty) => (
              <label key={difficulty || 'all-difficulty'} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded-md">
                <input
                  type="radio"
                  name="difficulty"
                  value={difficulty}
                  checked={filters.difficulty === difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 focus:ring-offset-1"
                />
                <span className="text-sm text-gray-600">{difficulty || 'Любая сложность'}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Age Range Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2.5">Возрастной диапазон</h4>
          <div className="space-y-1.5">
            {['', '6-8', '9-12', '13+'].map((age) => (
              <label key={age || 'all-ages'} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded-md">
                <input
                  type="radio"
                  name="ageRange"
                  value={age}
                  checked={filters.ageRange === age}
                  onChange={(e) => handleFilterChange('ageRange', e.target.value)}
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 focus:ring-offset-1"
                />
                <span className="text-sm text-gray-600">{age ? `${age} лет` : 'Любой возраст'}</span>
              </label>
            ))}
          </div>
        </div>

        {/* In Stock Filter */}
        <div>
           <label className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded-md mt-2">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => handleFilterChange('inStock', e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-offset-1"
            />
            <span className="text-sm text-gray-600">Только в наличии</span>
          </label>
        </div>
        
        {/* Action Buttons */}
        <div className="pt-5 border-t border-gray-200 space-y-3">
            <button
                onClick={handleApplyButtonClick}
                className="w-full bg-primary-500 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-primary-600 transition-colors shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
            >
                Применить фильтры
            </button>
            {hasActiveFilters && (
                <button
                onClick={clearFilters}
                className="w-full bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 flex items-center justify-center space-x-1.5"
                >
                    <RotateCcw className="w-3.5 h-3.5"/>
                    <span>Сбросить все</span>
                </button>
            )}
        </div>
      </div>
    </div>
  )
} 