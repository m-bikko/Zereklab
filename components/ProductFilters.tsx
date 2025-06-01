'use client';

import { ICategory } from '@/types';

import { useCallback, useEffect, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ChevronDown, ChevronUp, RotateCcw, X } from 'lucide-react';

interface ProductFiltersProps {
  onApplyFilters?: () => void;
}

export default function ProductFilters({
  onApplyFilters,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isExpanded, setIsExpanded] = useState(true);
  const [availableCategories, setAvailableCategories] = useState<ICategory[]>(
    []
  );
  const [filters, setFilters] = useState(() => ({
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
    difficulty: searchParams.get('difficulty') || '',
    ageRange: searchParams.get('ageRange') || '',
  }));

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
  }, [searchParams]);

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
    <div className="space-y-6 rounded-xl bg-white p-5 shadow-md">
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
          <div className="space-y-1.5">
            {availableCategories.map(category => (
              <label
                key={category.name}
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
          </div>
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
                    setFilters(prev => ({
                      ...prev,
                      minPrice: range.min,
                      maxPrice: range.max,
                    }));
                    // Update URL immediately or wait for apply button
                    // handleFilterChange('minPrice', range.min);
                    // handleFilterChange('maxPrice', range.max);
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
            {['', 'Beginner', 'Intermediate', 'Advanced'].map(difficulty => (
              <label
                key={difficulty || 'all-difficulty'}
                className="flex cursor-pointer items-center space-x-2 rounded-md p-1 hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={difficulty}
                  checked={filters.difficulty === difficulty}
                  onChange={e =>
                    handleFilterChange('difficulty', e.target.value)
                  }
                  className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-1"
                />
                <span className="text-sm text-gray-600">
                  {difficulty || 'Любая сложность'}
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
            {['', '6-8', '9-12', '13+'].map(age => (
              <label
                key={age || 'all-ages'}
                className="flex cursor-pointer items-center space-x-2 rounded-md p-1 hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="ageRange"
                  value={age}
                  checked={filters.ageRange === age}
                  onChange={e => handleFilterChange('ageRange', e.target.value)}
                  className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-1"
                />
                <span className="text-sm text-gray-600">
                  {age ? `${age} лет` : 'Любой возраст'}
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

        {/* Action Buttons */}
        <div className="space-y-3 border-t border-gray-200 pt-5">
          <button
            onClick={handleApplyButtonClick}
            className="w-full rounded-lg bg-primary-500 px-4 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-primary-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
          >
            Применить фильтры
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex w-full items-center justify-center space-x-1.5 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Сбросить все</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
