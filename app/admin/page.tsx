'use client';

import { ICategory, IProduct, validateProduct } from '@/types';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Edit,
  Eye,
  Image as ImageIcon,
  ListChecks,
  LogOut,
  Package,
  Plus,
  Save,
  Settings,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

interface AdminPageState {
  activeTab: 'products' | 'categories';
  products: IProduct[];
  categories: ICategory[];
  loadingProducts: boolean;
  loadingCategories: boolean;
  showProductForm: boolean;
  showCategoryForm: boolean;
  editingProduct: IProduct | null;
  editingCategory: ICategory | null;
}

// Define ProductFormSectionProps
interface ProductFormSectionProps {
  initialProductData: Partial<IProduct>;
  categories: ICategory[];
  isEditing: boolean;
  onSave: (productData: Partial<IProduct>) => Promise<void>;
  onClose: () => void;
}

const initialProductForm: Partial<IProduct> = {
  name: '',
  description: '',
  price: 0,
  images: [],
  category: '',
  subcategory: '',
  inStock: true,
  features: [],
  specifications: {},
  tags: [],
  sku: '',
  ageRange: '',
  difficulty: 'Beginner',
  relatedProducts: [],
  stockQuantity: 0,
  dimensions: { length: 0, width: 0, height: 0, weight: 0 },
  parameters: {},
};

// This initial form is for the new Category model fields
const initialCategoryFormState: Partial<ICategory> = {
  name: '',
  description: '',
  subcategories: [],
  parameters: {},
};

// Move ProductFormSection outside AdminPage
const ProductFormSection: React.FC<ProductFormSectionProps> = ({
  initialProductData,
  categories,
  isEditing,
  onSave,
  onClose,
}) => {
  const [productForm, setProductForm] =
    useState<Partial<IProduct>>(initialProductData);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  useEffect(() => {
    // Update internal form state if initialProductData changes (e.g., when editing a different product)
    setProductForm(initialProductData);
  }, [initialProductData]);

  // Move form-related handlers here
  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setProductForm(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
            ? parseFloat(value) || 0
            : value,
    }));
  };

  const handleArrayChange = (
    field: keyof Pick<
      IProduct,
      'features' | 'tags' | 'images' | 'relatedProducts'
    >,
    index: number,
    value: string
  ) => {
    setProductForm(prev => {
      const currentArray = (prev[field] as string[]) || [];
      const newArray = [...currentArray];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addToArray = (
    field: keyof Pick<
      IProduct,
      'features' | 'tags' | 'images' | 'relatedProducts'
    >
  ) => {
    setProductForm(prev => ({
      ...prev,
      [field]: [...((prev[field] as string[]) || []), ''],
    }));
  };

  const removeFromArray = (
    field: keyof Pick<
      IProduct,
      'features' | 'tags' | 'images' | 'relatedProducts'
    >,
    index: number
  ) => {
    setProductForm(prev => ({
      ...prev,
      [field]: (prev[field] as string[])?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSpecChange = (key: string, value: string) => {
    setProductForm(prev => ({
      ...prev,
      specifications: {
        ...(prev.specifications || {}),
        [key]: value,
      },
    }));
  };

  const addSpecification = () => {
    if (newSpecKey && newSpecValue) {
      if (
        productForm.specifications &&
        productForm.specifications.hasOwnProperty(newSpecKey)
      ) {
        toast.error('Характеристика с таким ключом уже существует.');
        return;
      }
      setProductForm(prev => ({
        ...prev,
        specifications: {
          ...(prev.specifications || {}),
          [newSpecKey]: newSpecValue,
        },
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    } else {
      toast.error('Ключ и значение характеристики не могут быть пустыми.');
    }
  };

  const removeSpecification = (key: string) => {
    setProductForm(prev => {
      const newSpecs = { ...(prev.specifications || {}) };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors = validateProduct(productForm);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }
    await onSave(productForm);
  };

  const renderArrayField = (
    field: keyof Pick<
      IProduct,
      'features' | 'tags' | 'images' | 'relatedProducts'
    >,
    label: string,
    placeholder: string
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {((productForm[field] as string[]) || []).map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="text"
            value={item}
            onChange={e => handleArrayChange(field, index, e.target.value)}
            placeholder={`${placeholder} #${index + 1}`}
            className="flex-grow rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={() => removeFromArray(field, index)}
            className="p-2 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => addToArray(field)}
        className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-800"
      >
        <Plus className="h-4 w-4" />
        <span>Добавить {placeholder.toLowerCase()}</span>
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 py-10 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-800 sm:text-2xl">
            {isEditing ? 'Редактировать товар' : 'Добавить новый товар'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Название товара
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={productForm.name}
              onChange={handleFormChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Описание
            </label>
            <textarea
              name="description"
              id="description"
              rows={4}
              value={productForm.description}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            ></textarea>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Цена (₸)
              </label>
              <input
                type="number"
                name="price"
                id="price"
                value={productForm.price}
                onChange={handleFormChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="stockQuantity"
                className="block text-sm font-medium text-gray-700"
              >
                Количество на складе
              </label>
              <input
                type="number"
                name="stockQuantity"
                id="stockQuantity"
                value={productForm.stockQuantity}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="sku"
              className="block text-sm font-medium text-gray-700"
            >
              Артикул (SKU)
            </label>
            <input
              type="text"
              name="sku"
              id="sku"
              value={productForm.sku}
              onChange={handleFormChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Категория
              </label>
              <select
                name="category"
                id="category"
                value={productForm.category}
                onChange={handleFormChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Выберите категорию</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {(() => {
              const selectedCategory = categories.find(
                c => c.name === productForm.category
              );
              return (
                productForm.category &&
                selectedCategory?.subcategories &&
                selectedCategory.subcategories.length > 0 && (
                  <div>
                    <label
                      htmlFor="subcategory"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Подкатегория
                    </label>
                    <select
                      name="subcategory"
                      id="subcategory"
                      value={productForm.subcategory}
                      onChange={handleFormChange}
                      className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="">
                        Выберите подкатегорию (необязательно)
                      </option>
                      {selectedCategory.subcategories.map(sub => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              );
            })()}
          </div>

          {renderArrayField('images', 'Изображения (URL)', 'URL изображения')}
          {renderArrayField('features', 'Ключевые особенности', 'Особенность')}
          {renderArrayField('tags', 'Теги', 'Тег')}

          <div className="space-y-3 rounded-md border border-gray-200 p-4">
            <h4 className="text-md font-medium text-gray-800">
              Характеристики
            </h4>
            {Object.entries(productForm.specifications || {}).map(
              ([key, value]) => (
                <div
                  key={key}
                  className="flex items-center space-x-2 rounded bg-gray-50 p-2"
                >
                  <input
                    type="text"
                    value={key}
                    disabled
                    className="flex-1 rounded border border-gray-200 bg-gray-100 px-2 py-1 text-sm text-gray-500"
                  />
                  <span className="text-gray-400">:</span>
                  <input
                    type="text"
                    value={String(value)}
                    onChange={e => handleSpecChange(key, e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecification(key)}
                    className="p-1.5 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            )}
            <div className="flex items-end space-x-2 pt-2">
              <div className="flex-1">
                <label
                  htmlFor="newSpecKey"
                  className="block text-xs font-medium text-gray-500"
                >
                  Название характеристики
                </label>
                <input
                  type="text"
                  id="newSpecKey"
                  value={newSpecKey}
                  onChange={e => setNewSpecKey(e.target.value)}
                  placeholder="Напр: Цвет"
                  className="mt-0.5 block w-full rounded-md border border-gray-300 px-3 py-1.5 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="newSpecValue"
                  className="block text-xs font-medium text-gray-500"
                >
                  Значение
                </label>
                <input
                  type="text"
                  id="newSpecValue"
                  value={newSpecValue}
                  onChange={e => setNewSpecValue(e.target.value)}
                  placeholder="Напр: Красный"
                  className="mt-0.5 block w-full rounded-md border border-gray-300 px-3 py-1.5 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <button
                type="button"
                onClick={addSpecification}
                className="flex items-center space-x-1 rounded-md bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600"
              >
                <Plus className="h-4 w-4" /> <span>Добавить</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="ageRange"
                className="block text-sm font-medium text-gray-700"
              >
                Возрастной диапазон
              </label>
              <select
                name="ageRange"
                id="ageRange"
                value={productForm.ageRange}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Не указан</option>
                <option value="6-8">6-8 лет</option>
                <option value="9-12">9-12 лет</option>
                <option value="13+">13+ лет</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="difficulty"
                className="block text-sm font-medium text-gray-700"
              >
                Сложность
              </label>
              <select
                name="difficulty"
                id="difficulty"
                value={productForm.difficulty}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
              >
                <option value="Beginner">Начинающий</option>
                <option value="Intermediate">Средний</option>
                <option value="Advanced">Продвинутый</option>
              </select>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="inStock"
                name="inStock"
                type="checkbox"
                checked={!!productForm.inStock}
                onChange={handleFormChange}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="inStock" className="font-medium text-gray-700">
                В наличии
              </label>
              <p className="text-gray-500">
                Отметьте, если товар доступен для заказа.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 border-t border-gray-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 rounded-lg bg-primary-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-primary-600"
            >
              <Save className="h-4 w-4" />
              <span>Сохранить товар</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Define props for CategoryManagementSection
interface CategoryManagementSectionProps {
  categories: ICategory[];
  loadingCategories: boolean;
  showCategoryForm: boolean;
  editingCategory: ICategory | null;
  categoryForm: Partial<ICategory>;
  onShowForm: () => void;
  onHideForm: () => void;
  onSave: () => Promise<void>;
  onEdit: (category: ICategory) => void;
  onDelete: (id: string | undefined) => Promise<void>;
  onFormChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubcategoryChange: (index: number, value: string) => void;
  onAddSubcategoryField: () => void;
  onRemoveSubcategoryField: (index: number) => void;
}

// Move CategoryManagementSection outside AdminPage
const CategoryManagementSection: React.FC<CategoryManagementSectionProps> = ({
  categories,
  loadingCategories,
  showCategoryForm,
  editingCategory,
  categoryForm,
  onShowForm,
  onHideForm,
  onSave,
  onEdit,
  onDelete,
  onFormChange,
  onSubcategoryChange,
  onAddSubcategoryField,
  onRemoveSubcategoryField,
}) => (
  <div className="p-6">
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-800">
        Управление Категориями
      </h2>
      <button
        onClick={onShowForm}
        className="flex items-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600"
      >
        <Plus className="h-4 w-4" />
        <span>Добавить Категорию</span>
      </button>
    </div>

    {loadingCategories ? (
      <p>Загрузка категорий...</p>
    ) : categories.length > 0 ? (
      <div className="space-y-3">
        {categories.map(cat => (
          <div
            key={cat._id}
            className="flex items-start justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm"
          >
            <div className="mr-4 flex-1">
              <h3 className="font-semibold text-gray-700">{cat.name}</h3>
              <p className="break-words text-xs text-gray-500">
                {cat.description || 'Нет описания'}
              </p>
              {cat.subcategories && cat.subcategories.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Подкатегории: {cat.subcategories.join(', ')}
                </p>
              )}
            </div>
            <div className="flex flex-shrink-0 flex-col items-end space-y-1 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
              <button
                onClick={() => onEdit(cat)}
                className="flex items-center rounded-md p-2 text-xs text-blue-500 hover:bg-blue-50 hover:text-blue-700"
              >
                <Edit className="mr-1 h-3.5 w-3.5" /> Ред.
              </button>
              <button
                onClick={() => onDelete(cat._id)}
                className="flex items-center rounded-md p-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Удал.
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500">
        Категории не найдены. Добавьте первую категорию.
      </p>
    )}

    {showCategoryForm && (
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 py-10 backdrop-blur-sm">
        <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-800 sm:text-2xl">
              {editingCategory ? 'Редактировать' : 'Добавить'} Категорию
            </h2>
            <button
              onClick={onHideForm}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              {' '}
              <X className="h-6 w-6" />{' '}
            </button>
          </div>
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              onSave();
            }}
            className="space-y-6"
          >
            <div>
              {' '}
              <label
                htmlFor="categoryName"
                className="block text-sm font-medium text-gray-700"
              >
                Название категории
              </label>{' '}
              <input
                type="text"
                name="name"
                id="categoryName"
                value={categoryForm.name || ''}
                onChange={onFormChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />{' '}
            </div>
            <div>
              {' '}
              <label
                htmlFor="categoryDescription"
                className="block text-sm font-medium text-gray-700"
              >
                Описание
              </label>{' '}
              <textarea
                name="description"
                id="categoryDescription"
                rows={3}
                value={categoryForm.description || ''}
                onChange={onFormChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              ></textarea>{' '}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Подкатегории
              </label>
              {(categoryForm.subcategories || []).map((sub, index) => (
                <div key={index} className="mt-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={sub}
                    onChange={e => onSubcategoryChange(index, e.target.value)}
                    placeholder={`Подкатегория #${index + 1}`}
                    className="flex-grow rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveSubcategoryField(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    {' '}
                    <Trash2 className="h-4 w-4" />{' '}
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={onAddSubcategoryField}
                className="mt-2 flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-800"
              >
                {' '}
                <Plus className="h-4 w-4" />{' '}
                <span>Добавить подкатегорию</span>{' '}
              </button>
            </div>
            {/* TODO: Add UI for managing parameters if needed */}
            <div className="flex justify-end space-x-3 border-t border-gray-200 pt-5">
              <button
                type="button"
                onClick={onHideForm}
                className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 rounded-lg bg-primary-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-primary-600"
              >
                {' '}
                <Save className="h-4 w-4" />{' '}
                <span>Сохранить категорию</span>{' '}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);

export default function AdminPage() {
  const [state, setState] = useState<AdminPageState>({
    activeTab: 'products',
    products: [],
    categories: [],
    loadingProducts: false,
    loadingCategories: false,
    showProductForm: false,
    showCategoryForm: false,
    editingProduct: null,
    editingCategory: null,
  });
  const router = useRouter();

  const [productForm, setProductForm] =
    useState<Partial<IProduct>>(initialProductForm);
  const [categoryForm, setCategoryForm] = useState<Partial<ICategory>>(
    initialCategoryFormState
  );

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setState(prev => ({ ...prev, loadingProducts: true }));
      const response = await fetch(
        '/api/products?limit=200&sortBy=createdAt&sortOrder=desc'
      );
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ ...prev, products: data.products }));
      } else {
        toast.error('Не удалось загрузить товары.');
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      toast.error('Ошибка при загрузке товаров.');
    } finally {
      setState(prev => ({ ...prev, loadingProducts: false }));
    }
  };

  const fetchCategories = async () => {
    try {
      setState(prev => ({ ...prev, loadingCategories: true }));
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ ...prev, categories: data.data as ICategory[] }));
      } else {
        toast.error('Не удалось загрузить категории.');
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
      toast.error('Ошибка при загрузке категорий.');
    } finally {
      setState(prev => ({ ...prev, loadingCategories: false }));
    }
  };

  const saveProduct = async (currentProductData: Partial<IProduct>) => {
    const errors = validateProduct(currentProductData);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    const toastId = toast.loading(
      state.editingProduct ? 'Обновление товара...' : 'Создание товара...'
    );
    try {
      const method = state.editingProduct ? 'PUT' : 'POST';
      const url = state.editingProduct
        ? `/api/products/${state.editingProduct._id}`
        : '/api/products';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProductData),
      });

      if (response.ok) {
        toast.success(
          `Товар успешно ${state.editingProduct ? 'обновлен' : 'создан'}!`,
          { id: toastId }
        );
        resetProductForm();
        fetchProducts();
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Не удалось сохранить товар' }));
        throw new Error(errorData.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Не удалось сохранить товар.', {
        id: toastId,
      });
    }
  };

  const deleteProduct = async (id: string | undefined) => {
    if (!id) {
      toast.error('ID товара не определен.');
      return;
    }
    if (
      !confirm(
        'Вы уверены, что хотите удалить этот товар? Это действие необратимо.'
      )
    )
      return;

    const toastId = toast.loading('Удаление товара...');
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success('Товар успешно удален!', { id: toastId });
        fetchProducts();
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Не удалось удалить товар.' }));
        throw new Error(errorData.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Не удалось удалить товар.', {
        id: toastId,
      });
    }
  };

  const resetProductForm = () => {
    setProductForm(initialProductForm);
    setState(prev => ({
      ...prev,
      showProductForm: false,
      editingProduct: null,
    }));
  };

  const openAddProductForm = () => {
    setProductForm(initialProductForm);
    setState(prev => ({
      ...prev,
      showProductForm: true,
      editingProduct: null,
    }));
  };

  const openEditProductForm = (product: IProduct) => {
    const formValues: Partial<IProduct> = { ...initialProductForm };
    for (const key in initialProductForm) {
      if (product.hasOwnProperty(key)) {
        (formValues as any)[key] = (product as any)[key];
      }
    }
    formValues.images = Array.isArray(product.images) ? product.images : [];
    formValues.features = Array.isArray(product.features)
      ? product.features
      : [];
    formValues.tags = Array.isArray(product.tags) ? product.tags : [];
    formValues.specifications =
      typeof product.specifications === 'object' &&
      product.specifications !== null
        ? product.specifications
        : {};

    setProductForm(formValues);
    setState(prev => ({
      ...prev,
      activeTab: 'products',
      showProductForm: true,
      editingProduct: product,
    }));
  };

  const handleLogout = async () => {
    const toastId = toast.loading('Выход из системы...');
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('authToken');
      sessionStorage.clear();

      if (response.ok) {
        toast.success('Выход выполнен успешно!', { id: toastId });
        router.replace('/login');
      } else {
        const errorText = await response.text().catch(() => 'Произошла ошибка');
        toast.error(`Ошибка выхода: ${errorText}`, { id: toastId });
      }
    } catch (error) {
      console.error('Ошибка выхода на клиенте:', error);
      toast.error('Произошла ошибка при выходе.', { id: toastId });
    }
  };

  const openCategoryFormForAdd = () => {
    resetCategoryForm(); // Clears form and sets editingCategory to null
    setState(prev => ({ ...prev, showCategoryForm: true }));
  };

  // --- Category Management Functions ---
  const resetCategoryForm = () => {
    setCategoryForm(initialCategoryFormState);
    setState(prev => ({
      ...prev,
      showCategoryForm: false,
      editingCategory: null,
    }));
  };

  const handleCategoryFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubcategoryChange = (index: number, value: string) => {
    setCategoryForm(prev => {
      const newSubcategories = [...(prev.subcategories || [])];
      newSubcategories[index] = value;
      return { ...prev, subcategories: newSubcategories };
    });
  };

  const addSubcategoryField = () => {
    setCategoryForm(prev => ({
      ...prev,
      subcategories: [...(prev.subcategories || []), ''],
    }));
  };

  const removeSubcategoryField = (index: number) => {
    setCategoryForm(prev => ({
      ...prev,
      subcategories: (prev.subcategories || []).filter((_, i) => i !== index),
    }));
  };

  const saveCategory = async () => {
    if (!categoryForm.name?.trim()) {
      toast.error('Название категории обязательно.');
      return;
    }

    const toastId = toast.loading(
      state.editingCategory
        ? 'Обновление категории...'
        : 'Создание категории...'
    );
    try {
      const method = state.editingCategory ? 'PUT' : 'POST';
      const url = state.editingCategory
        ? `/api/categories/${state.editingCategory._id}`
        : '/api/categories';

      const body = {
        name: categoryForm.name,
        description: categoryForm.description || '',
        subcategories: categoryForm.subcategories || [],
        parameters: categoryForm.parameters || {}, // Ensure parameters are included if used
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(
          `Категория успешно ${
            state.editingCategory ? 'обновлена' : 'создана'
          }!`,
          { id: toastId }
        );
        resetCategoryForm();
        fetchCategories(); // Refresh the category list
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Не удалось сохранить категорию' }));
        throw new Error(errorData.message || 'Произошла неизвестная ошибка');
      }
    } catch (error: any) {
      toast.error(error.message || 'Не удалось сохранить категорию.', {
        id: toastId,
      });
    }
  };

  const editCategory = (category: ICategory) => {
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      subcategories: category.subcategories || [],
      parameters: category.parameters || {},
      // Do not spread the entire category object if it contains _id, createdAt, etc.
      // that are not part of the editable form fields directly managed by categoryForm state
    });
    setState(prev => ({
      ...prev,
      showCategoryForm: true,
      editingCategory: category,
    }));
  };

  const deleteCategory = async (id: string | undefined) => {
    if (!id) {
      toast.error('ID категории не определен.');
      return;
    }
    if (
      !confirm(
        'Вы уверены, что хотите удалить эту категорию? Это действие необратимо и может повлиять на связанные товары.'
      )
    )
      return;

    const toastId = toast.loading('Удаление категории...');
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('Категория успешно удалена!', { id: toastId });
        fetchCategories(); // Refresh list
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Не удалось удалить категорию.' }));
        throw new Error(errorData.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Не удалось удалить категорию.', {
        id: toastId,
      });
    }
  };
  // --- End Category Management Functions ---

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="flex flex-col items-start justify-between border-b border-gray-200 bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-5 text-white sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Панель Администратора
              </h1>
              <p className="text-sm text-gray-300">
                Управление товарами и категориями ZerekLab
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Выйти из системы"
              className="mt-3 flex items-center space-x-2 rounded-lg bg-red-500 px-4 py-2 text-white shadow-md transition-all duration-150 hover:bg-red-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 sm:mt-0"
            >
              <LogOut className="h-5 w-5" />
              <span>Выйти</span>
            </button>
          </div>

          <div className="border-b border-gray-200 bg-gray-50">
            <nav
              className="-mb-px flex space-x-1 px-4 sm:px-6"
              aria-label="Tabs"
            >
              <button
                onClick={() =>
                  setState(prev => ({ ...prev, activeTab: 'products' }))
                }
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  state.activeTab === 'products'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } mx-1 rounded-t-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1`}
              >
                <Package className="mr-2 inline-block h-5 w-5 align-text-bottom" />{' '}
                Товары ({state.products.length})
              </button>
              <button
                onClick={() =>
                  setState(prev => ({ ...prev, activeTab: 'categories' }))
                }
                className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  state.activeTab === 'categories'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } mx-1 rounded-t-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-1`}
              >
                <ListChecks className="mr-2 inline-block h-5 w-5 align-text-bottom" />{' '}
                Категории ({state.categories.length})
              </button>
            </nav>
          </div>

          <div>
            {state.activeTab === 'products' && (
              <div className="p-4 sm:p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Список Товаров ({state.products.length})
                  </h2>
                  <button
                    onClick={openAddProductForm}
                    className="flex items-center space-x-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-primary-600 hover:shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Добавить Товар</span>
                  </button>
                </div>

                {state.loadingProducts ? (
                  <p className="py-10 text-center text-gray-500">
                    Загрузка товаров...
                  </p>
                ) : state.products.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 bg-white">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Изобр.
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Название
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Категория
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Цена (₸)
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Наличие
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Действия
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {state.products.map(product => (
                          <tr
                            key={product._id}
                            className="transition-colors hover:bg-gray-50"
                          >
                            <td className="whitespace-nowrap px-4 py-3">
                              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                                {product.images && product.images[0] ? (
                                  <Image
                                    src={product.images[0]}
                                    alt={product.name || 'Изобр. товара'}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                                    <ImageIcon className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="max-w-xs px-6 py-3">
                              <div
                                className="truncate text-sm font-medium text-gray-900"
                                title={product.name}
                              >
                                {product.name}
                              </div>
                              <div
                                className="truncate text-xs text-gray-500"
                                title={product.sku || undefined}
                              >
                                Арт: {product.sku || '-'}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-500">
                              {product.category}
                            </td>
                            <td className="whitespace-nowrap px-6 py-3 text-sm text-gray-500">
                              {product.price.toLocaleString()}
                            </td>
                            <td className="whitespace-nowrap px-6 py-3">
                              <span
                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                  product.inStock
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {product.inStock
                                  ? 'В наличии'
                                  : 'Нет в наличии'}
                              </span>
                            </td>
                            <td className="space-x-2 whitespace-nowrap px-6 py-3 text-sm font-medium">
                              <Link
                                href={`/products/${product._id}`}
                                target="_blank"
                                title="Посмотреть товар на сайте"
                                className="inline-flex items-center rounded-md p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => openEditProductForm(product)}
                                title="Редактировать товар"
                                className="inline-flex items-center rounded-md p-1.5 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-800"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteProduct(product._id)}
                                title="Удалить товар"
                                className="inline-flex items-center rounded-md p-1.5 text-red-600 hover:bg-red-50 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="py-10 text-center text-gray-500">
                    Товары не найдены. Добавьте свой первый товар!
                  </p>
                )}
              </div>
            )}

            {state.activeTab === 'categories' && (
              <CategoryManagementSection
                categories={state.categories}
                loadingCategories={state.loadingCategories}
                showCategoryForm={state.showCategoryForm}
                editingCategory={state.editingCategory}
                categoryForm={categoryForm}
                onShowForm={openCategoryFormForAdd}
                onHideForm={resetCategoryForm} // resetCategoryForm also hides the form
                onSave={saveCategory}
                onEdit={editCategory}
                onDelete={deleteCategory}
                onFormChange={handleCategoryFormChange}
                onSubcategoryChange={handleSubcategoryChange}
                onAddSubcategoryField={addSubcategoryField}
                onRemoveSubcategoryField={removeSubcategoryField}
              />
            )}
          </div>
        </div>
        {state.showProductForm && (
          <ProductFormSection
            initialProductData={
              state.editingProduct ? productForm : initialProductForm
            }
            categories={state.categories}
            isEditing={!!state.editingProduct}
            onSave={saveProduct}
            onClose={resetProductForm}
          />
        )}
      </div>
    </div>
  );
}
