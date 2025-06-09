'use client';

import { ICategory, validateCategory } from '@/types';

import { ChangeEvent, FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

import {
  ChevronDown,
  ChevronRight,
  Edit,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';

interface CategoryManagementProps {
  categories: ICategory[];
  loading: boolean;
  onRefresh: () => void;
}

interface CategoryFormData {
  name: string;
  description: string;
  subcategories: string[];
  parentCategory?: string;
}

const initialFormData: CategoryFormData = {
  name: '',
  description: '',
  subcategories: [],
  parentCategory: undefined,
};

export default function CategoryManagement({
  categories,
  loading,
  onRefresh,
}: CategoryManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(
    null
  );
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSubcategory = () => {
    if (!newSubcategory.trim()) return;

    setFormData(prev => ({
      ...prev,
      subcategories: [...prev.subcategories, newSubcategory.trim()],
    }));
    setNewSubcategory('');
  };

  const handleRemoveSubcategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter((_, i) => i !== index),
    }));
  };

  const openForm = (category?: ICategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        subcategories: category.subcategories || [],
        parentCategory: category.parentCategory,
      });
    } else {
      setEditingCategory(null);
      setFormData(initialFormData);
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData(initialFormData);
    setNewSubcategory('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const categoryData = {
      ...formData,
      parentCategory: formData.parentCategory || undefined,
    };

    const errors = validateCategory(categoryData);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      setSaving(false);
      return;
    }

    const toastId = toast.loading(
      editingCategory ? 'Обновление категории...' : 'Создание категории...'
    );

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory._id}`
        : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        toast.success(
          editingCategory
            ? 'Категория успешно обновлена!'
            : 'Категория успешно создана!',
          { id: toastId }
        );
        closeForm();
        onRefresh();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(
          errorData.error || 'Произошла ошибка при сохранении категории.',
          { id: toastId }
        );
      }
    } catch (error) {
      console.error('Ошибка сохранения категории:', error);
      toast.error('Ошибка сети при сохранении категории.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить категорию "${categoryName}"?`))
      return;

    const toastId = toast.loading('Удаление категории...');
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Категория успешно удалена!', { id: toastId });
        onRefresh();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(
          errorData.error || 'Произошла ошибка при удалении категории.',
          { id: toastId }
        );
      }
    } catch (error) {
      console.error('Ошибка удаления категории:', error);
      toast.error('Ошибка сети при удалении категории.', { id: toastId });
    }
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const mainCategories = categories.filter(cat => !cat.parentCategory);
  const getSubcategories = (parentId: string) =>
    categories.filter(cat => cat.parentCategory === parentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Управление категориями</h2>
        <button
          onClick={() => openForm()}
          className="flex items-center space-x-2 rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
        >
          <Plus className="h-4 w-4" />
          <span>Добавить категорию</span>
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-gray-500">Загрузка категорий...</p>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="p-6">
            <div className="space-y-4">
              {mainCategories.map(category => {
                const subcategories = getSubcategories(category._id!);
                const isExpanded = expandedCategories.has(category._id!);

                return (
                  <div key={category._id} className="rounded-lg border">
                    <div className="flex items-center justify-between bg-gray-50 p-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleCategoryExpansion(category._id!)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-gray-500">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {category.subcategories?.length || 0} подкатегорий
                        </span>
                        <button
                          onClick={() => openForm(category)}
                          className="p-1 text-blue-600 hover:text-blue-900"
                          title="Редактировать"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(category._id!, category.name)
                          }
                          className="p-1 text-red-600 hover:text-red-900"
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {isExpanded &&
                      category.subcategories &&
                      category.subcategories.length > 0 && (
                        <div className="border-t bg-white p-4">
                          <h4 className="mb-3 text-sm font-medium text-gray-700">
                            Подкатегории:
                          </h4>
                          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                            {category.subcategories.map(
                              (subcategory, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                                >
                                  {subcategory}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                );
              })}

              {mainCategories.length === 0 && (
                <div className="py-10 text-center text-gray-500">
                  <p>Категории не найдены</p>
                  <p className="text-sm">
                    Добавьте первую категорию, нажав кнопку выше
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingCategory
                    ? 'Редактировать категорию'
                    : 'Добавить новую категорию'}
                </h3>
                <button
                  onClick={closeForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Название категории *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Введите название категории"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Описание
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Краткое описание категории"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Родительская категория
                    </label>
                    <select
                      name="parentCategory"
                      value={formData.parentCategory || ''}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Основная категория</option>
                      {mainCategories
                        .filter(cat => cat._id !== editingCategory?._id)
                        .map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Оставьте пустым для создания основной категории
                    </p>
                  </div>

                  {!formData.parentCategory && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Подкатегории
                      </label>
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newSubcategory}
                            onChange={e => setNewSubcategory(e.target.value)}
                            placeholder="Добавить подкатегорию"
                            className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSubcategory();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddSubcategory}
                            className="rounded-md bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {formData.subcategories.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              Подкатегории:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {formData.subcategories.map(
                                (subcategory, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                                  >
                                    {subcategory}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveSubcategory(index)
                                      }
                                      className="ml-2 text-blue-600 hover:text-blue-800"
                                    >
                                      ×
                                    </button>
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                    className="flex items-center space-x-2 rounded-md bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:opacity-50"
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
