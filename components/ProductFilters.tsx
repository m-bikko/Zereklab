'use client';

import { ICategory } from '@/types';

import { useCallback, useEffect, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

export default function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isExpanded, setIsExpanded] = useState(true);
  const [availableCategories, setAvailableCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(() => ({
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
    difficulty: searchParams.get('difficulty') || '',
    ageRange: searchParams.get('ageRange') || '',
  }));

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (response.ok) {
        const categories = await response.json();
        setAvailableCategories(categories);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Update filters when searchParams change
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
  }, [searchParams]);

  const updateURL = useCallback(
    (newFilters: typeof filters) => {
      const params = new URLSearchParams(searchParams.toString());

      // Remove page parameter when filters change
      params.delete('page');

      // Update filter parameters
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.set(key, value.toString());
        } else {
          params.delete(key);
        }
      });

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, searchParams, pathname]
  );

  const handleFilterChange = (key: string, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    // Reset subcategory when category changes
    if (key === 'category') {
      newFilters.subcategory = '';
    }
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      subcategory: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      difficulty: '',
      ageRange: '',
    };
    setFilters(clearedFilters);
    updateURL(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(
    value => value !== '' && value !== false
  );

  const getSelectedCategoryData = () => {
    return availableCategories.find(cat => cat.name === filters.category);
  };

  const selectedCategoryData = getSelectedCategoryData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h3 className="text-lg font-semibold text-gray-800">Фильтры</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          aria-label={isExpanded ? 'Свернуть фильтры' : 'Развернуть фильтры'}
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className={`space-y-5 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Category Filter */}
        <div>
          <h4 className="mb-2.5 text-sm font-medium text-gray-700">
            Категория
          </h4>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 animate-pulse rounded bg-gray-200"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="flex cursor-pointer items-center space-x-2 rounded-md p-1 hover:bg-gray-50">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={filters.category === ''}
                  onChange={e => handleFilterChange('category', e.target.value)}
                  className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-1"
                />
                <span className="text-sm text-gray-600">Все категории</span>
              </label>
              {availableCategories.map(category => (
                <label
                  key={category._id || category.name}
                  className="flex cursor-pointer items-center space-x-2 rounded-md p-1 hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.name}
                    checked={filters.category === category.name}
                    onChange={e => handleFilterChange('category', e.target.value)}
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-1"
                  />
                  <span className="text-sm text-gray-600">{category.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Subcategory Filter */}
        {selectedCategoryData &&
          selectedCategoryData.subcategories &&
          selectedCategoryData.subcategories.length > 0 && (
            <div>
              <h4 className="mb-2.5 text-sm font-medium text-gray-700">
                Подкатегория
              </h4>
              <div className="space-y-1.5">
                <label className="flex cursor-pointer items-center space-x-2 rounded-md p-1 hover:bg-gray-50">
                  <input
                    type="radio"
                    name="subcategory"
                    value=""
                    checked={filters.subcategory === ''}
                    onChange={e =>
                      handleFilterChange('subcategory', e.target.value)
                    }
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-1"
                  />
                  <span className="text-sm text-gray-600">
                    Все подкатегории
                  </span>
                </label>
                {selectedCategoryData.subcategories.map(subcategory => (
                  <label
                    key={subcategory}
                    className="flex cursor-pointer items-center space-x-2 rounded-md p-1 hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="subcategory"
                      value={subcategory}
                      checked={filters.subcategory === subcategory}
                      onChange={e =>
                        handleFilterChange('subcategory', e.target.value)
                      }
                      className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-1"
                    />
                    <span className="text-sm text-gray-600">{subcategory}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

        {/* Price Range Filter */}
        <div>
          <h4 className="mb-2.5 text-sm font-medium text-gray-700">Цена (₸)</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="От"
                value={filters.minPrice}
                onChange={e =>
                  setFilters(prev => ({ ...prev, minPrice: e.target.value }))
                }
                onBlur={() => handleFilterChange('minPrice', filters.minPrice)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <span className="text-gray-400">–</span>
              <input
                type="number"
                placeholder="До"
                value={filters.maxPrice}
                onChange={e =>
                  setFilters(prev => ({ ...prev, maxPrice: e.target.value }))
                }
                onBlur={() => handleFilterChange('maxPrice', filters.maxPrice)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: 'До 5000', min: '', max: '5000' },
                { label: '5т - 15т', min: '5000', max: '15000' },
                { label: '15т - 30т', min: '15000', max: '30000' },
                { label: '30т+', min: '30000', max: '' },
              ].map(range => (
                <button
                  key={range.label}
                  onClick={() => {
                    const newFilters = {
                      ...filters,
                      minPrice: range.min,
                      maxPrice: range.max,
                    };
                    setFilters(newFilters);
                    updateURL(newFilters);
                  }}
                  className={`rounded-full border px-2.5 py-1.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-1 ${
                    filters.minPrice === range.min &&
                    filters.maxPrice === range.max
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-gray-200 bg-gray-100 text-gray-700 hover:border-gray-300 hover:bg-gray-200'
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
          <h4 className="mb-2.5 text-sm font-medium text-gray-700">
            Сложность
          </h4>
          <div className="space-y-1.5">
            {[
              { value: '', label: 'Любая сложность' },
              { value: 'Beginner', label: 'Начинающий' },
              { value: 'Intermediate', label: 'Средний' },
              { value: 'Advanced', label: 'Продвинутый' },
            ].map(difficulty => (
              <label
                key={difficulty.value || 'all-difficulty'}
                className="flex cursor-pointer items-center space-x-2 rounded-md p-1 hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={difficulty.value}
                  checked={filters.difficulty === difficulty.value}
                  onChange={e =>
                    handleFilterChange('difficulty', e.target.value)
                  }
                  className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-1"
                />
                <span className="text-sm text-gray-600">
                  {difficulty.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Age Range Filter */}
        <div>
          <h4 className="mb-2.5 text-sm font-medium text-gray-700">
            Возрастной диапазон
          </h4>
          <div className="space-y-1.5">
            {[
              { value: '', label: 'Любой возраст' },
              { value: '6-8', label: '6-8 лет' },
              { value: '9-12', label: '9-12 лет' },
              { value: '13+', label: '13+ лет' },
            ].map(age => (
              <label
                key={age.value || 'all-ages'}
                className="flex cursor-pointer items-center space-x-2 rounded-md p-1 hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="ageRange"
                  value={age.value}
                  checked={filters.ageRange === age.value}
                  onChange={e => handleFilterChange('ageRange', e.target.value)}
                  className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-1"
                />
                <span className="text-sm text-gray-600">
                  {age.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* In Stock Filter */}
        <div>
          <label className="mt-2 flex cursor-pointer items-center space-x-2 rounded-md p-1 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={e => handleFilterChange('inStock', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-1"
            />
            <span className="text-sm text-gray-600">Только в наличии</span>
          </label>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="border-t border-gray-200 pt-5">
            <button
              onClick={clearFilters}
              className="flex w-full items-center justify-center space-x-1.5 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Сбросить все</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
