'use client';

import { ICategory, IProduct, validateProduct } from '@/types';

import { ChangeEvent, FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

import Image from 'next/image';

import { Edit, Plus, Save, Trash2, Upload, X } from 'lucide-react';

interface ProductManagementProps {
  products: IProduct[];
  categories: ICategory[];
  loading: boolean;
  onRefresh: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  subcategory: string;
  sku: string;
  inStock: boolean;
  stockQuantity: number;
  features: string[];
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | '';
  ageRange: string;
  specifications: Record<string, string>;
  estimatedDelivery: string;
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  salePrice: undefined,
  images: [],
  category: '',
  subcategory: '',
  sku: '',
  inStock: true,
  stockQuantity: 0,
  features: [],
  tags: [],
  difficulty: '',
  ageRange: '',
  specifications: {},
  estimatedDelivery: '',
};

export default function ProductManagement({
  products,
  categories,
  loading,
  onRefresh,
}: ProductManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
            ? value === ''
              ? 0
              : Number(value)
            : value,
    }));
  };

  const handleArrayAdd = (field: 'features' | 'tags', value: string) => {
    if (!value.trim()) return;

    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }));

    if (field === 'features') setNewFeature('');
    if (field === 'tags') setNewTag('');
  };

  const handleArrayRemove = (
    field: 'features' | 'tags' | 'images',
    index: number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()],
    }));
    setNewImageUrl('');
  };

  const handleSpecificationChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }));
  };

  const openForm = (product?: IProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        images: product.images || [],
        category: product.category,
        subcategory: product.subcategory || '',
        sku: product.sku,
        inStock: product.inStock,
        stockQuantity: product.stockQuantity || 0,
        features: product.features || [],
        tags: product.tags || [],
        difficulty: product.difficulty || '',
        ageRange: product.ageRange || '',
        specifications: product.specifications || {},
        estimatedDelivery: product.estimatedDelivery || '',
      });
    } else {
      setEditingProduct(null);
      setFormData(initialFormData);
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData(initialFormData);
    setNewFeature('');
    setNewTag('');
    setNewImageUrl('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const productData = {
      ...formData,
      salePrice: formData.salePrice || undefined,
      difficulty: formData.difficulty || 'Beginner',
    };

    const errors = validateProduct(productData);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      setSaving(false);
      return;
    }

    const toastId = toast.loading(
      editingProduct ? 'Обновление товара...' : 'Создание товара...'
    );

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct._id}`
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        toast.success(
          editingProduct ? 'Товар успешно обновлен!' : 'Товар успешно создан!',
          { id: toastId }
        );
        closeForm();
        onRefresh();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(
          errorData.error || 'Произошла ошибка при сохранении товара.',
          { id: toastId }
        );
      }
    } catch (error) {
      console.error('Ошибка сохранения товара:', error);
      toast.error('Ошибка сети при сохранении товара.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить товар "${productName}"?`))
      return;

    const toastId = toast.loading('Удаление товара...');
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Товар успешно удален!', { id: toastId });
        onRefresh();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(
          errorData.error || 'Произошла ошибка при удалении товара.',
          { id: toastId }
        );
      }
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
      toast.error('Ошибка сети при удалении товара.', { id: toastId });
    }
  };

  const selectedCategory = categories.find(
    cat => cat.name === formData.category
  );
  const subcategories = selectedCategory?.subcategories || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Управление товарами</h2>
        <button
          onClick={() => openForm()}
          className="flex items-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          <span>Добавить товар</span>
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-gray-500">Загрузка товаров...</p>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Товар
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Цена
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Категория
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {products.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200">
                              <span className="text-xs text-gray-400">
                                Нет фото
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: {product.sku}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {product.salePrice ? (
                          <>
                            <span className="text-gray-400 line-through">
                              {product.price} ₸
                            </span>
                            <span className="ml-2 text-red-600">
                              {product.salePrice} ₸
                            </span>
                          </>
                        ) : (
                          <span>{product.price} ₸</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {product.category}
                      {product.subcategory && (
                        <div className="text-xs text-gray-400">
                          {product.subcategory}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          product.inStock
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.inStock ? 'В наличии' : 'Нет в наличии'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openForm(product)}
                          className="p-1 text-blue-600 hover:text-blue-900"
                          title="Редактировать"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(product._id!, product.name)
                          }
                          className="p-1 text-red-600 hover:text-red-900"
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingProduct
                    ? 'Редактировать товар'
                    : 'Добавить новый товар'}
                </h3>
                <button
                  onClick={closeForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Название товара *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        SKU *
                      </label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Цена (₸) *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Цена со скидкой (₸)
                        </label>
                        <input
                          type="number"
                          name="salePrice"
                          value={formData.salePrice || ''}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Категория *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Выберите категорию</option>
                          {categories.map(category => (
                            <option key={category._id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Подкатегория
                        </label>
                        <select
                          name="subcategory"
                          value={formData.subcategory}
                          onChange={handleInputChange}
                          disabled={!formData.category}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                          <option value="">Выберите подкатегорию</option>
                          {subcategories.map(sub => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Уровень сложности
                        </label>
                        <select
                          name="difficulty"
                          value={formData.difficulty}
                          onChange={handleInputChange}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Выберите уровень</option>
                          <option value="Beginner">Начинающий</option>
                          <option value="Intermediate">Средний</option>
                          <option value="Advanced">Продвинутый</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Возрастная группа
                        </label>
                        <input
                          type="text"
                          name="ageRange"
                          value={formData.ageRange}
                          onChange={handleInputChange}
                          placeholder="8-12 лет"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Количество на складе
                        </label>
                        <input
                          type="number"
                          name="stockQuantity"
                          value={formData.stockQuantity}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Время доставки
                        </label>
                        <input
                          type="text"
                          name="estimatedDelivery"
                          value={formData.estimatedDelivery}
                          onChange={handleInputChange}
                          placeholder="1-3 рабочих дня"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Товар в наличии
                      </label>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Описание *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Изображения
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={e => setNewImageUrl(e.target.value)}
                        placeholder="URL изображения"
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="rounded-md bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
                      >
                        <Upload className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={img}
                            alt={`Изображение ${index + 1}`}
                            width={60}
                            height={60}
                            className="h-15 w-15 rounded border object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleArrayRemove('images', index)}
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Особенности
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={e => setNewFeature(e.target.value)}
                        placeholder="Добавить особенность"
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleArrayAdd('features', newFeature);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleArrayAdd('features', newFeature)}
                        className="rounded-md bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((feature, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                        >
                          {feature}
                          <button
                            type="button"
                            onClick={() => handleArrayRemove('features', index)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Теги
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        placeholder="Добавить тег"
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleArrayAdd('tags', newTag);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleArrayAdd('tags', newTag)}
                        className="rounded-md bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleArrayRemove('tags', index)}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 border-t pt-6">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
