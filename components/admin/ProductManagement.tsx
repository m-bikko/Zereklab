'use client';

import { getAgeOptions, isValidMinimumAge } from '@/lib/ageUtils';
import { ICategory, IProduct, validateMultilingualProduct } from '@/types';

import React, { ChangeEvent, FormEvent, useState } from 'react';
import toast from 'react-hot-toast';

import Image from 'next/image';

import {
  ArrowLeft,
  ArrowRight,
  Edit2,
  ImageIcon,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

interface ProductManagementProps {
  products: IProduct[];
  categories: ICategory[];
  loading: boolean;
  onRefresh: () => void;
}

interface MultilingualText {
  ru: string;
  kk: string;
  en: string;
}

interface UploadedItem {
  url: string;
  publicId: string;
  originalName: string;
}

interface ProductFormData {
  name: MultilingualText;
  description: MultilingualText;
  price: number;
  salePrice?: number;
  images: string[];
  videoUrl?: string;
  category: string;
  subcategory: string;
  sku: string;
  inStock: boolean;
  stockQuantity: number;
  features: MultilingualText[];
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | '';
  ageRange: string;
  specifications: Record<string, string>;
  estimatedDelivery: string;
}

const initialFormData: ProductFormData = {
  name: { ru: '', kk: '', en: '' },
  description: { ru: '', kk: '', en: '' },
  price: 0,
  salePrice: undefined,
  images: [],
  videoUrl: '',
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

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Helper function to upload a single image to Cloudinary
const uploadSingleToCloudinary = async (file: File): Promise<string> => {
  const data = await fileToBase64(file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: [{ data, name: file.name, type: file.type }],
      folder: 'zereklab/products',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Ошибка загрузки');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Загрузка не удалась');
  }

  return result.uploaded.map((item: UploadedItem) => item.url)[0];
};

// Helper function to delete images from Cloudinary
const deleteFromCloudinary = async (urls: string[]): Promise<void> => {
  try {
    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.warn('Error deleting images:', errorData.error);
      // Не бросаем ошибку, так как удаление изображений не критично
    }
  } catch (error) {
    console.warn('Failed to delete images from Cloudinary:', error);
    // Не бросаем ошибку, так как удаление изображений не критично
  }
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
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<'ru' | 'kk' | 'en'>(
    'ru'
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });

  // Get subcategories for selected category
  const selectedCategoryObj = categories.find(
    cat =>
      (typeof cat.name === 'string'
        ? cat.name
        : (cat.name as MultilingualText).ru) === formData.category
  );
  const subcategories = selectedCategoryObj?.subcategories || [];

  const getLocalizedValue = (
    value: string | MultilingualText | Record<string, string>,
    locale = 'ru'
  ): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      return (
        (value as Record<string, string>)[locale] ||
        (value as Record<string, string>).ru ||
        ''
      );
    }
    return '';
  };

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
            ? value === '' || value === '0'
              ? name === 'salePrice'
                ? undefined
                : 0 // salePrice can be undefined, others default to 0
              : Number(value)
            : value,
    }));
  };

  const handleMultilingualChange = (
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

  const handleFeatureChange = (
    index: number,
    language: 'ru' | 'kk' | 'en',
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index ? { ...feature, [language]: value } : feature
      ),
    }));
  };

  const handleArrayAdd = (field: 'features' | 'tags', value: string) => {
    if (!value.trim()) return;

    if (field === 'features') {
      // For features, create a multilingual object
      const newFeature: MultilingualText = {
        ru: value.trim(),
        kk: value.trim(),
        en: value.trim(),
      };
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature],
      }));
      setNewFeature('');
    } else {
      // For tags, keep as string array
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
      setNewTag('');
    }
  };

  const handleArrayRemove = (
    field: 'features' | 'tags' | 'images',
    index: number
  ) => {
    if (field === 'features') {
      setFormData(prev => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    }
  };

  // Function to reorder images
  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...formData.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    setFormData(prev => ({
      ...prev,
      images: newImages,
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

  // Handle file upload for images
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the limit
    const maxImages = 10;
    const currentImageCount = formData.images.length;
    const totalAfterUpload = currentImageCount + files.length;

    if (totalAfterUpload > maxImages) {
      toast.error(
        `Максимальное количество изображений: ${maxImages}. У вас уже ${currentImageCount}, попытка добавить ${files.length}.`
      );
      return;
    }

    setUploadingImage(true);
    setUploadProgress({ current: 0, total: files.length });
    const toastId = toast.loading(`Загрузка изображений: 0 из ${files.length}`);

    try {
      // Валидация файлов
      const validFiles: File[] = [];
      let rejectedCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`Файл ${file.name} не является изображением`);
          rejectedCount++;
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Файл ${file.name} слишком большой (максимум 10MB)`);
          rejectedCount++;
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        toast.error('Нет валидных файлов для загрузки', { id: toastId });
        return;
      }

      // Update progress
      setUploadProgress({ current: 0, total: validFiles.length });
      toast.loading(`Загрузка ${validFiles.length} изображений...`, {
        id: toastId,
      });

      // Upload to Cloudinary one by one to avoid body size limits
      const uploadedUrls: string[] = [];
      for (let i = 0; i < validFiles.length; i++) {
        try {
          setUploadProgress({ current: i + 1, total: validFiles.length });
          toast.loading(
            `Загрузка изображений: ${i + 1} из ${validFiles.length}`,
            { id: toastId }
          );
          const url = await uploadSingleToCloudinary(validFiles[i]);
          uploadedUrls.push(url);
        } catch (err) {
          console.error(`Error uploading ${validFiles[i].name}:`, err);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }));

        const successMessage =
          rejectedCount > 0 || uploadedUrls.length < validFiles.length
            ? `Загружено ${uploadedUrls.length} из ${files.length} изображений`
            : `Успешно загружено ${uploadedUrls.length} изображений`;

        toast.success(successMessage, { id: toastId });
      } else {
        toast.error('Не удалось загрузить ни одного изображения', {
          id: toastId,
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(`Ошибка загрузки изображений: ${error}`, { id: toastId });
    } finally {
      setUploadingImage(false);
      setUploadProgress({ current: 0, total: 0 });
      // Reset file input
      e.target.value = '';
    }
  };

  // Handle drag and drop for images
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Create a FileList-like object for handleImageUpload
    const mockEvent = {
      target: {
        files: files,
        value: '',
      },
    } as unknown as ChangeEvent<HTMLInputElement>;

    await handleImageUpload(mockEvent);
  };

  const openForm = (product?: IProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name:
          typeof product.name === 'string'
            ? { ru: product.name, kk: product.name, en: product.name }
            : product.name,
        description:
          typeof product.description === 'string'
            ? {
                ru: product.description,
                kk: product.description,
                en: product.description,
              }
            : product.description,
        price: product.price,
        salePrice: product.salePrice,
        images: product.images || [],
        videoUrl: product.videoUrl || '',
        category:
          typeof product.category === 'string'
            ? product.category
            : getLocalizedValue(product.category),
        subcategory: product.subcategory || '',
        sku: product.sku,
        inStock: product.inStock,
        stockQuantity: product.stockQuantity || 0,
        features: product.features
          ? product.features.map(feature =>
              typeof feature === 'string'
                ? { ru: feature, kk: feature, en: feature }
                : feature
            )
          : [],
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
    setActiveLanguage('ru');
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData(initialFormData);
    setNewFeature('');
    setNewTag('');
    setNewImageUrl('');
    setNewSpecKey('');
    setNewSpecValue('');
    setActiveLanguage('ru');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading(
      editingProduct ? 'Обновление товара...' : 'Создание товара...'
    );

    // Validate age range format
    if (formData.ageRange && !isValidMinimumAge(formData.ageRange)) {
      toast.error(
        'Неверный формат возраста. Используйте формат "3+" (от 1 до 20 лет)',
        { id: toastId }
      );
      setSaving(false);
      return;
    }

    // Client-side validation
    const validationErrors = validateMultilingualProduct({
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      sku: formData.sku,
    });

    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      toast.error('Пожалуйста, исправьте ошибки валидации.', { id: toastId });
      setSaving(false);
      return;
    }

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct._id}`
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      // Send full multilingual data to server
      const apiData = {
        ...formData,
        salePrice:
          formData.salePrice && formData.salePrice > 0
            ? formData.salePrice
            : null,
        difficulty: formData.difficulty || 'Beginner',
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
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
        console.error('API Error:', errorData);

        // Show detailed errors if available
        if (errorData.details && Array.isArray(errorData.details)) {
          errorData.details.forEach((detail: string) => toast.error(detail));
        } else {
          toast.error(
            errorData.error || 'Произошла ошибка при сохранении товара.',
            { id: toastId }
          );
        }
      }
    } catch (error) {
      console.error('Ошибка сохранения товара:', error);
      toast.error('Ошибка сети при сохранении товара.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;

    const toastId = toast.loading('Удаление товара...');

    try {
      const product = products.find(p => p._id === productId);

      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Delete associated images from Cloudinary if they exist
        if (product?.images && product.images.length > 0) {
          const cloudinaryUrls = product.images.filter(
            url =>
              url.includes('cloudinary.com') ||
              url.includes('res.cloudinary.com')
          );
          if (cloudinaryUrls.length > 0) {
            await deleteFromCloudinary(cloudinaryUrls);
          }
        }

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

  // Language tab component
  const LanguageTab = ({
    lang,
    flag,
    label,
  }: {
    lang: 'ru' | 'kk' | 'en';
    flag: string;
    label: string;
  }) => (
    <button
      type="button"
      onClick={() => setActiveLanguage(lang)}
      className={`flex items-center space-x-2 rounded-md border px-3 py-2 transition-colors ${
        activeLanguage === lang
          ? 'border-blue-300 bg-blue-100 text-blue-700'
          : 'border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100'
      }`}
    >
      <span>{flag}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Управление товарами
        </h2>
        <button
          onClick={() => openForm()}
          className="inline-flex items-center rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Добавить товар
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Товар
                </th>
                <th className="hidden px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell sm:px-6">
                  Категория
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Цена
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                  Наличие
                </th>
                <th className="hidden px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6 md:table-cell">
                  Возраст
                </th>
                <th className="relative px-3 py-3 sm:px-6">
                  <span className="sr-only">Действия</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {products.map(product => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0 sm:h-10 sm:w-10">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={getLocalizedValue(product.name)}
                            width={40}
                            height={40}
                            className="h-8 w-8 rounded object-cover sm:h-10 sm:w-10"
                            onError={e => {
                              (e.target as HTMLImageElement).src =
                                '/images/placeholder-product.svg';
                            }}
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-200 sm:h-10 sm:w-10">
                            <ImageIcon className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
                          </div>
                        )}
                      </div>
                      <div className="ml-2 sm:ml-4">
                        <div className="text-xs font-medium text-gray-900 sm:text-sm">
                          {getLocalizedValue(product.name)}
                        </div>
                        <div className="text-xs text-gray-500 sm:hidden">
                          {typeof product.category === 'string'
                            ? product.category
                            : getLocalizedValue(product.category)}
                        </div>
                        <div className="text-xs text-gray-500 sm:text-sm">
                          SKU: {product.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-900 sm:table-cell sm:px-6">
                    {typeof product.category === 'string'
                      ? product.category
                      : getLocalizedValue(product.category)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs text-gray-900 sm:px-6 sm:text-sm">
                    {product.salePrice ? (
                      <div>
                        <span className="text-gray-500 line-through">
                          {product.price.toLocaleString()} ₸
                        </span>
                        <br />
                        <span className="font-medium text-red-600">
                          {product.salePrice.toLocaleString()} ₸
                        </span>
                      </div>
                    ) : (
                      <span>{product.price.toLocaleString()} ₸</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 sm:px-6">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        product.inStock
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.inStock ? 'В наличии' : 'Нет в наличии'}
                    </span>
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-900 sm:px-6 md:table-cell">
                    {product.ageRange || 'Не указан'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium sm:px-6">
                    <div className="flex space-x-1 sm:space-x-2">
                      <button
                        onClick={() => openForm(product)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Редактировать"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {product._id && (
                        <button
                          onClick={() =>
                            product._id && handleDeleteProduct(product._id)
                          }
                          className="text-red-600 hover:text-red-900"
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500">Товары не найдены</p>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">
              &#8203;
            </span>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:align-middle">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      {editingProduct
                        ? 'Редактировать товар'
                        : 'Добавить товар'}
                    </h3>
                    <button
                      type="button"
                      onClick={closeForm}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Name Section with Language Tabs */}
                    <div className="lg:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Название товара *
                      </label>
                      <div className="mb-3 flex space-x-2">
                        <LanguageTab lang="ru" flag="🇷🇺" label="Русский" />
                        <LanguageTab lang="kk" flag="🇰🇿" label="Қазақша" />
                        <LanguageTab lang="en" flag="🇺🇸" label="English" />
                      </div>
                      <input
                        type="text"
                        value={formData.name[activeLanguage]}
                        onChange={e =>
                          handleMultilingualChange(
                            'name',
                            activeLanguage,
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder={
                          activeLanguage === 'ru'
                            ? 'Название на русском'
                            : activeLanguage === 'kk'
                              ? 'Атауы қазақ тілінде'
                              : 'Name in English'
                        }
                        required
                      />
                    </div>

                    {/* Description Section with Language Tabs */}
                    <div className="lg:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Описание товара *
                      </label>
                      <div className="mb-3 flex space-x-2">
                        <LanguageTab lang="ru" flag="🇷🇺" label="Русский" />
                        <LanguageTab lang="kk" flag="🇰🇿" label="Қазақша" />
                        <LanguageTab lang="en" flag="🇺🇸" label="English" />
                      </div>
                      <textarea
                        rows={4}
                        value={formData.description[activeLanguage]}
                        onChange={e =>
                          handleMultilingualChange(
                            'description',
                            activeLanguage,
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder={
                          activeLanguage === 'ru'
                            ? 'Описание на русском'
                            : activeLanguage === 'kk'
                              ? 'Сипаттамасы қазақ тілінде'
                              : 'Description in English'
                        }
                        required
                      />
                    </div>

                    {/* Basic Info */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Цена (₸) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Цена со скидкой (₸)
                      </label>
                      <input
                        type="number"
                        name="salePrice"
                        value={formData.salePrice || ''}
                        onChange={handleInputChange}
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Категория *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Выберите категорию</option>
                        {categories.map(category => (
                          <option
                            key={
                              typeof category.name === 'string'
                                ? category.name
                                : (category.name as MultilingualText).ru
                            }
                            value={
                              typeof category.name === 'string'
                                ? category.name
                                : (category.name as MultilingualText).ru
                            }
                          >
                            {getLocalizedValue(category.name)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Подкатегория
                      </label>
                      <select
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        disabled={subcategories.length === 0}
                      >
                        <option value="">Выберите подкатегорию</option>
                        {subcategories.map((subcategory, index) => (
                          <option
                            key={index}
                            value={getLocalizedValue(subcategory)}
                          >
                            {getLocalizedValue(subcategory)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        SKU *
                      </label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Количество на складе
                      </label>
                      <input
                        type="number"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleInputChange}
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Минимальный возраст
                      </label>
                      <select
                        name="ageRange"
                        value={formData.ageRange}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        {getAgeOptions().map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Уровень сложности
                      </label>
                      <select
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Выберите уровень</option>
                        <option value="Beginner">Начальный</option>
                        <option value="Intermediate">Средний</option>
                        <option value="Advanced">Продвинутый</option>
                      </select>
                    </div>

                    {/* Video URL */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        YouTube видео URL
                      </label>
                      <input
                        type="url"
                        name="videoUrl"
                        value={formData.videoUrl || ''}
                        onChange={handleInputChange}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Images Section */}
                    <div className="lg:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Изображения товара *
                      </label>

                      {/* File Upload with improved UI and drag & drop */}
                      <div className="mb-4">
                        <div
                          className={`flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed px-6 py-6 transition-all duration-200 ${
                            uploadingImage
                              ? 'cursor-not-allowed border-gray-200 bg-gray-50'
                              : isDragOver
                                ? 'scale-102 border-blue-500 bg-blue-100'
                                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() =>
                            !uploadingImage &&
                            document
                              .getElementById('image-upload-input')
                              ?.click()
                          }
                        >
                          <div className="text-center">
                            {uploadingImage ? (
                              <div className="space-y-2">
                                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                                {uploadProgress.total > 0 && (
                                  <div className="h-2 w-full rounded-full bg-gray-200">
                                    <div
                                      className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                                      style={{
                                        width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                                      }}
                                    ></div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Upload
                                className={`mx-auto h-8 w-8 transition-colors ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`}
                              />
                            )}
                            <div className="mt-3">
                              <p
                                className={`text-sm font-medium transition-colors ${
                                  uploadingImage
                                    ? 'text-gray-500'
                                    : isDragOver
                                      ? 'text-blue-600'
                                      : 'text-gray-600'
                                }`}
                              >
                                {uploadingImage
                                  ? `Загрузка в Cloudinary... ${uploadProgress.current}/${uploadProgress.total}`
                                  : isDragOver
                                    ? 'Отпустите файлы для загрузки'
                                    : 'Выберите или перетащите изображения товара'}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                Можно выбрать сразу несколько файлов
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF до 10MB каждый • Максимум 10
                                изображений
                              </p>
                              {formData.images.length >= 8 && (
                                <p className="mt-1 text-xs text-amber-600">
                                  ⚠️ Осталось места для{' '}
                                  {10 - formData.images.length} изображений
                                </p>
                              )}
                            </div>
                            {!uploadingImage && !isDragOver && (
                              <div className="mt-3 space-y-1">
                                <span className="inline-flex items-center rounded-md bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                                  Клик для выбора файлов
                                </span>
                                <br />
                                <span className="inline-flex items-center rounded-md bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                  Или перетащите сюда
                                </span>
                              </div>
                            )}
                          </div>
                          <input
                            id="image-upload-input"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </div>
                        {/* Instructions for multiple file selection */}
                        <div className="mt-2 rounded-md bg-blue-50 p-3 text-xs text-gray-500">
                          <div className="space-y-1">
                            <p>
                              <strong>
                                💡 Способы загрузки множественных изображений:
                              </strong>
                            </p>
                            <ul className="ml-2 list-inside list-disc space-y-1">
                              <li>
                                Зажмите{' '}
                                <kbd className="rounded border bg-white px-1">
                                  Ctrl
                                </kbd>{' '}
                                (
                                <kbd className="rounded border bg-white px-1">
                                  Cmd
                                </kbd>{' '}
                                на Mac) и кликайте по файлам
                              </li>
                              <li>
                                Выделите файлы мышью в проводнике и перетащите
                                сюда
                              </li>
                              <li>
                                Используйте{' '}
                                <kbd className="rounded border bg-white px-1">
                                  Shift
                                </kbd>{' '}
                                для выбора диапазона файлов
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* URL Input */}
                      <div className="mb-4">
                        <label className="mb-2 block text-xs font-medium text-gray-600">
                          Альтернативно: добавить по URL
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="url"
                            value={newImageUrl}
                            onChange={e => setNewImageUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddImage}
                            disabled={!newImageUrl.trim()}
                            className="rounded-md bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Добавить
                          </button>
                        </div>
                      </div>

                      {/* Image Preview with improved layout */}
                      {formData.images.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-700">
                              Загруженные изображения ({formData.images.length}
                              /10)
                            </h4>
                            <span className="text-xs text-gray-500">
                              Первое изображение будет основным
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                            {formData.images.map((image, index) => (
                              <div key={index} className="group relative">
                                <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-transparent bg-gray-100 transition-colors hover:border-blue-300">
                                  <Image
                                    src={image}
                                    alt={`Product image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    onError={e => {
                                      (e.target as HTMLImageElement).src =
                                        '/images/placeholder-product.svg';
                                    }}
                                  />

                                  {/* Image controls overlay */}
                                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-200 group-hover:bg-opacity-30">
                                    <div className="flex space-x-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                      {/* Move left */}
                                      {index > 0 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            moveImage(index, index - 1)
                                          }
                                          className="rounded-full bg-white bg-opacity-90 p-1 shadow-md transition-colors hover:bg-opacity-100"
                                          title="Переместить влево"
                                        >
                                          <ArrowLeft className="h-4 w-4 text-gray-700" />
                                        </button>
                                      )}

                                      {/* Move right */}
                                      {index < formData.images.length - 1 && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            moveImage(index, index + 1)
                                          }
                                          className="rounded-full bg-white bg-opacity-90 p-1 shadow-md transition-colors hover:bg-opacity-100"
                                          title="Переместить вправо"
                                        >
                                          <ArrowRight className="h-4 w-4 text-gray-700" />
                                        </button>
                                      )}

                                      {/* Delete */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleArrayRemove('images', index)
                                        }
                                        className="rounded-full bg-red-500 bg-opacity-90 p-1 shadow-md transition-colors hover:bg-opacity-100"
                                        title="Удалить изображение"
                                      >
                                        <X className="h-4 w-4 text-white" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Primary badge */}
                                  {index === 0 && (
                                    <div className="absolute left-2 top-2">
                                      <span className="rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                                        Основное
                                      </span>
                                    </div>
                                  )}

                                  {/* Image number */}
                                  <div className="absolute bottom-2 right-2">
                                    <span className="rounded-full bg-black bg-opacity-60 px-2 py-1 text-xs text-white">
                                      {index + 1}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Features Section */}
                    <div className="lg:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Особенности товара
                      </label>
                      <div className="space-y-3">
                        {formData.features.map((feature, index) => (
                          <div
                            key={index}
                            className="rounded-lg border bg-gray-50 p-3"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                Особенность {index + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleArrayRemove('features', index)
                                }
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="relative">
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                  🇷🇺 Русский
                                </label>
                                <input
                                  type="text"
                                  placeholder="Особенность на русском языке"
                                  value={feature.ru}
                                  onChange={e =>
                                    handleFeatureChange(
                                      index,
                                      'ru',
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-md border-gray-300 px-2 py-1 text-sm"
                                />
                              </div>
                              <div className="relative">
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                  🇰🇿 Қазақша
                                </label>
                                <input
                                  type="text"
                                  placeholder="Қазақ тіліндегі ерекшелік"
                                  value={feature.kk}
                                  onChange={e =>
                                    handleFeatureChange(
                                      index,
                                      'kk',
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-md border-gray-300 px-2 py-1 text-sm"
                                />
                              </div>
                              <div className="relative">
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                  🇺🇸 English
                                </label>
                                <input
                                  type="text"
                                  placeholder="Feature in English"
                                  value={feature.en}
                                  onChange={e =>
                                    handleFeatureChange(
                                      index,
                                      'en',
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-md border-gray-300 px-2 py-1 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newFeature}
                            onChange={e => setNewFeature(e.target.value)}
                            placeholder="Добавить новую особенность"
                            className="flex-1 rounded-md border-gray-300 px-3 py-2 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleArrayAdd('features', newFeature)
                            }
                            disabled={!newFeature.trim()}
                            className="rounded-md bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600 disabled:opacity-50"
                          >
                            Добавить
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Теги
                      </label>
                      <div className="mt-1 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleArrayRemove('tags', index)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newTag}
                            onChange={e => setNewTag(e.target.value)}
                            placeholder="Добавить тег"
                            className="flex-1 rounded-md border-gray-300 px-3 py-2 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => handleArrayAdd('tags', newTag)}
                            disabled={!newTag.trim()}
                            className="rounded-md bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600 disabled:opacity-50"
                          >
                            Добавить
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Specifications */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Характеристики
                      </label>
                      <div className="mt-1 space-y-2">
                        {Object.entries(formData.specifications).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm"
                            >
                              <span className="font-medium text-gray-700">
                                {key}:
                              </span>
                              <span className="flex-1 text-gray-600">
                                {value}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => {
                                    const updated = { ...prev.specifications };
                                    delete updated[key];
                                    return {
                                      ...prev,
                                      specifications: updated,
                                    };
                                  });
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          )
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSpecKey}
                            onChange={e => setNewSpecKey(e.target.value)}
                            placeholder="Название (напр. Размер)"
                            className="w-2/5 rounded-md border-gray-300 px-3 py-2 text-sm"
                          />
                          <input
                            type="text"
                            value={newSpecValue}
                            onChange={e => setNewSpecValue(e.target.value)}
                            placeholder="Значение (напр. 30 x 20 x 10 см)"
                            className="flex-1 rounded-md border-gray-300 px-3 py-2 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newSpecKey.trim() && newSpecValue.trim()) {
                                setFormData(prev => ({
                                  ...prev,
                                  specifications: {
                                    ...prev.specifications,
                                    [newSpecKey.trim()]: newSpecValue.trim(),
                                  },
                                }));
                                setNewSpecKey('');
                                setNewSpecValue('');
                              }
                            }}
                            disabled={
                              !newSpecKey.trim() || !newSpecValue.trim()
                            }
                            className="rounded-md bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600 disabled:opacity-50"
                          >
                            Добавить
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* In Stock */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        В наличии
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex w-full justify-center rounded-md bg-primary-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {editingProduct ? 'Обновить' : 'Создать'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Отмена
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
