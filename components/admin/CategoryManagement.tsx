'use client';

import { ICategory } from '@/types';

import { ChangeEvent, FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

import {
  ChevronDown,
  ChevronRight,
  Edit,
  Globe,
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

interface MultilingualText {
  ru: string;
  kk: string;
  en: string;
}

interface CategoryFormData {
  name: MultilingualText;
  description: MultilingualText;
  subcategories: MultilingualText[];
  parentCategory?: string;
}

const initialMultilingualText: MultilingualText = {
  ru: '',
  kk: '',
  en: '',
};

const initialFormData: CategoryFormData = {
  name: { ...initialMultilingualText },
  description: { ...initialMultilingualText },
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
  const [newSubcategory, setNewSubcategory] = useState<MultilingualText>({
    ...initialMultilingualText,
  });
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [activeLanguageTab, setActiveLanguageTab] = useState<
    'ru' | 'kk' | 'en'
  >('ru');

  const languages = [
    { code: 'ru' as const, name: 'Русский', flag: '🇷🇺' },
    { code: 'kk' as const, name: 'Қазақша', flag: '🇰🇿' },
    { code: 'en' as const, name: 'English', flag: '🇺🇸' },
  ];

  const validateMultilingualText = (
    text: MultilingualText,
    fieldName: string
  ): string[] => {
    const errors: string[] = [];
    if (!text.ru.trim())
      errors.push(`${fieldName} на русском языке обязательно`);
    if (!text.kk.trim())
      errors.push(`${fieldName} на казахском языке обязательно`);
    if (!text.en.trim())
      errors.push(`${fieldName} на английском языке обязательно`);
    return errors;
  };

  const handleMultilingualInputChange = (
    field: 'name' | 'description',
    language: 'ru' | 'kk' | 'en',
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: value,
      },
    }));
  };

  const handleSubcategoryInputChange = (
    language: 'ru' | 'kk' | 'en',
    value: string
  ) => {
    setNewSubcategory(prev => ({
      ...prev,
      [language]: value,
    }));
  };

  const handleAddSubcategory = () => {
    const errors = validateMultilingualText(newSubcategory, 'Подкатегория');
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setFormData(prev => ({
      ...prev,
      subcategories: [...prev.subcategories, { ...newSubcategory }],
    }));
    setNewSubcategory({ ...initialMultilingualText });
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
        name:
          typeof category.name === 'string'
            ? { ru: category.name, kk: category.name, en: category.name }
            : category.name || { ...initialMultilingualText },
        description:
          typeof category.description === 'string'
            ? {
                ru: category.description,
                kk: category.description,
                en: category.description,
              }
            : category.description || { ...initialMultilingualText },
        subcategories: (category.subcategories || []).map(sub =>
          typeof sub === 'string' ? { ru: sub, kk: sub, en: sub } : sub
        ),
        parentCategory: category.parentCategory,
      });
    } else {
      setEditingCategory(null);
      setFormData(initialFormData);
    }
    setShowForm(true);
    setActiveLanguageTab('ru');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData(initialFormData);
    setNewSubcategory({ ...initialMultilingualText });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Валидация
    const nameErrors = validateMultilingualText(formData.name, 'Название');
    if (nameErrors.length > 0) {
      nameErrors.forEach(error => toast.error(error));
      setSaving(false);
      return;
    }

    const categoryData = {
      name: formData.name,
      description: formData.description,
      subcategories: formData.subcategories,
      parentCategory: formData.parentCategory || undefined,
    };

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

  const handleDelete = async (categoryId: string, categoryName: any) => {
    const displayName =
      typeof categoryName === 'string'
        ? categoryName
        : categoryName?.ru || 'категорию';
    if (!confirm(`Вы уверены, что хотите удалить категорию "${displayName}"?`))
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
                const isExpanded = expandedCategories.has(category._id || '');
                const categoryName =
                  typeof category.name === 'string'
                    ? category.name
                    : (category.name as any)?.ru || 'Без названия';
                const categoryDescription =
                  typeof category.description === 'string'
                    ? category.description
                    : (category.description as any)?.ru || '';

                return (
                  <div key={category._id} className="rounded-lg border">
                    <div className="flex items-center justify-between bg-gray-50 p-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() =>
                            toggleCategoryExpansion(category._id || '')
                          }
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
                            {categoryName}
                          </h3>
                          {categoryDescription && (
                            <p className="text-sm text-gray-500">
                              {categoryDescription}
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
                          className="p-1 text-blue-500 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(category._id || '', category.name)
                          }
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t p-4">
                        <div className="space-y-2">
                          {category.subcategories?.map((subcategory, index) => {
                            const subName =
                              typeof subcategory === 'string'
                                ? subcategory
                                : (subcategory as any)?.ru || 'Без названия';
                            return (
                              <div
                                key={index}
                                className="ml-6 rounded bg-gray-100 px-3 py-2 text-sm"
                              >
                                {subName}
                              </div>
                            );
                          })}
                          {(!category.subcategories ||
                            category.subcategories.length === 0) && (
                            <p className="ml-6 text-sm text-gray-500">
                              Подкатегории отсутствуют
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно формы */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingCategory
                  ? 'Редактировать категорию'
                  : 'Добавить категорию'}
              </h3>
              <button
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Языковые вкладки */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setActiveLanguageTab(lang.code)}
                      className={`flex items-center space-x-2 border-b-2 px-1 py-2 text-sm font-medium ${
                        activeLanguageTab === lang.code
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Поля формы для активного языка */}
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Название категории (
                    {languages.find(l => l.code === activeLanguageTab)?.name})
                  </label>
                  <input
                    type="text"
                    value={formData.name[activeLanguageTab]}
                    onChange={e =>
                      handleMultilingualInputChange(
                        'name',
                        activeLanguageTab,
                        e.target.value
                      )
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={`Введите название на ${languages.find(l => l.code === activeLanguageTab)?.name.toLowerCase()}`}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Описание (
                    {languages.find(l => l.code === activeLanguageTab)?.name})
                  </label>
                  <textarea
                    value={formData.description[activeLanguageTab]}
                    onChange={e =>
                      handleMultilingualInputChange(
                        'description',
                        activeLanguageTab,
                        e.target.value
                      )
                    }
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={`Введите описание на ${languages.find(l => l.code === activeLanguageTab)?.name.toLowerCase()}`}
                  />
                </div>
              </div>

              {/* Подкатегории */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Подкатегории
                </label>

                {/* Список существующих подкатегорий */}
                {formData.subcategories.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {formData.subcategories.map((subcategory, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                      >
                        <span className="text-sm">
                          🇷🇺 {subcategory.ru} | 🇰🇿 {subcategory.kk} | 🇺🇸{' '}
                          {subcategory.en}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubcategory(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Добавление новой подкатегории */}
                <div className="space-y-3 rounded-md border border-gray-200 p-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Добавить подкатегорию
                  </h4>
                  {languages.map(lang => (
                    <div key={lang.code}>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        {lang.flag} {lang.name}
                      </label>
                      <input
                        type="text"
                        value={newSubcategory[lang.code]}
                        onChange={e =>
                          handleSubcategoryInputChange(
                            lang.code,
                            e.target.value
                          )
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder={`Название на ${lang.name.toLowerCase()}`}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    className="flex items-center space-x-2 rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Добавить подкатегорию</span>
                  </button>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Сохранение...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{editingCategory ? 'Обновить' : 'Создать'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
