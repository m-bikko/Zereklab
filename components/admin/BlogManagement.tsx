'use client';

import { useState, useEffect } from 'react';
import { IBlog } from '@/models/Blog';
import RichTextEditor from '@/components/RichTextEditor';

import toast from 'react-hot-toast';
import Image from 'next/image';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star,
  Search,
  Filter,
  Upload,
  X,
  Link as LinkIcon,
  ExternalLink
} from 'lucide-react';

interface BlogManagementProps {
  locale: 'ru' | 'kk' | 'en';
}

interface SourceInfo {
  title: string;
  url: string;
}

interface BlogFormData {
  title: {
    ru: string;
    kk: string;
    en: string;
  };
  slug: string;
  excerpt: {
    ru: string;
    kk: string;
    en: string;
  };
  content: {
    ru: string;
    kk: string;
    en: string;
  };
  previewImage: string;
  sources: SourceInfo[];
  tags: string[];
  category: string;
  isPublished: boolean;
  isFeatured: boolean;
  author?: {
    name: string;
    avatar?: string;
  };
}

const INITIAL_FORM_DATA: BlogFormData = {
  title: { ru: '', kk: '', en: '' },
  slug: '',
  excerpt: { ru: '', kk: '', en: '' },
  content: { ru: '', kk: '', en: '' },
  previewImage: '',
  sources: [],
  tags: [],
  category: 'общие',
  isPublished: false,
  isFeatured: false,
  author: {
    name: 'ZerekLab Team',
    avatar: ''
  }
};

const CATEGORIES = [
  'общие',
  'новости',
  'образование', 
  'технологии',
  'arduino',
  'робототехника',
  'программирование',
  'diy'
];

export default function BlogManagement({ locale }: BlogManagementProps) {
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<IBlog | null>(null);
  const [formData, setFormData] = useState<BlogFormData>(INITIAL_FORM_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [currentTab, setCurrentTab] = useState<'ru' | 'kk' | 'en'>('ru');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newSource, setNewSource] = useState<SourceInfo>({ title: '', url: '' });

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ru: {
        'blog.management': 'Управление блогом',
        'blog.add': 'Добавить статью',
        'blog.edit': 'Редактировать статью',
        'blog.title': 'Заголовок',
        'blog.slug': 'URL (slug)',
        'blog.excerpt': 'Краткое описание',
        'blog.content': 'Содержание',
        'blog.preview': 'Превью изображение',
        'blog.tags': 'Теги',
        'blog.category': 'Категория',
        'blog.published': 'Опубликовано',
        'blog.featured': 'Рекомендуемая',
        'blog.author': 'Автор',
        'blog.views': 'Просмотры',
        'blog.likes': 'Лайки',
        'blog.search': 'Поиск статей...',
        'blog.filter.all': 'Все статьи',
        'blog.filter.published': 'Опубликованные',
        'blog.filter.draft': 'Черновики',
        'blog.save': 'Сохранить',
        'blog.cancel': 'Отмена',
        'blog.delete.confirm': 'Вы уверены, что хотите удалить эту статью?'
      },
      kk: {
        'blog.management': 'Блогты басқару',
        'blog.add': 'Мақала қосу',
        'blog.edit': 'Мақаланы өңдеу',
        'blog.title': 'Тақырып',
        'blog.slug': 'URL (slug)',
        'blog.excerpt': 'Қысқаша сипаттама',
        'blog.content': 'Мазмұн',
        'blog.preview': 'Алдын ала көру суреті',
        'blog.tags': 'Тегтер',
        'blog.category': 'Санат',
        'blog.published': 'Жарияланған',
        'blog.featured': 'Ұсынылатын',
        'blog.author': 'Автор',
        'blog.views': 'Көру',
        'blog.likes': 'Ұнату',
        'blog.search': 'Мақалаларды іздеу...',
        'blog.filter.all': 'Барлық мақалалар',
        'blog.filter.published': 'Жарияланған',
        'blog.filter.draft': 'Жобалар',
        'blog.save': 'Сақтау',
        'blog.cancel': 'Болдырмау',
        'blog.delete.confirm': 'Бұл мақаланы жойғыңыз келе ме?'
      },
      en: {
        'blog.management': 'Blog Management',
        'blog.add': 'Add Article',
        'blog.edit': 'Edit Article',
        'blog.title': 'Title',
        'blog.slug': 'URL (slug)',
        'blog.excerpt': 'Excerpt',
        'blog.content': 'Content',
        'blog.preview': 'Preview Image',
        'blog.tags': 'Tags',
        'blog.category': 'Category',
        'blog.published': 'Published',
        'blog.featured': 'Featured',
        'blog.author': 'Author',
        'blog.views': 'Views',
        'blog.likes': 'Likes',
        'blog.search': 'Search articles...',
        'blog.filter.all': 'All articles',
        'blog.filter.published': 'Published',
        'blog.filter.draft': 'Drafts',
        'blog.save': 'Save',
        'blog.cancel': 'Cancel',
        'blog.delete.confirm': 'Are you sure you want to delete this article?'
      }
    };

    return translations[locale]?.[key] || key;
  };

  // Загрузка списка блогов
  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/blog?published=false&limit=100');
      if (!response.ok) throw new Error('Failed to fetch blogs');
      const data = await response.json();
      setBlogs(data.blogs || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Ошибка загрузки статей');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Открыть модальное окно для создания/редактирования
  const openModal = (blog?: IBlog) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: {
          ru: blog.title.ru || '',
          kk: blog.title.kk || '',
          en: blog.title.en || ''
        },
        slug: blog.slug,
        excerpt: {
          ru: blog.excerpt.ru || '',
          kk: blog.excerpt.kk || '',
          en: blog.excerpt.en || ''
        },
        content: {
          ru: blog.content.ru || '',
          kk: blog.content.kk || '',
          en: blog.content.en || ''
        },
        previewImage: blog.previewImage,
        sources: blog.sources || [],
        tags: blog.tags || [],
        category: blog.category || 'общие',
        isPublished: blog.isPublished,
        isFeatured: blog.isFeatured,
        author: blog.author || { name: 'ZerekLab Team', avatar: '' }
      });
    } else {
      setEditingBlog(null);
      setFormData({ ...INITIAL_FORM_DATA });
    }
    setShowModal(true);
  };

  // Закрыть модальное окно
  const closeModal = () => {
    setShowModal(false);
    setEditingBlog(null);
    setFormData(INITIAL_FORM_DATA);
    setCurrentTab('ru');
    setNewSource({ title: '', url: '' });
  };

  // Создать slug из заголовка
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50);
  };

  // Функция для преобразования файла в base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Загрузка изображения в Cloudinary
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    try {
      const base64Data = await fileToBase64(file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: [{
            data: base64Data,
            name: file.name,
            type: file.type,
          }],
          folder: 'zereklab/blog',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки изображения');
      }

      const result = await response.json();
      
      if (!result.success || !result.uploaded || result.uploaded.length === 0) {
        throw new Error('Не удалось загрузить изображение');
      }

      return result.uploaded[0].url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  // Обработка загрузки изображения
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите файл изображения');
      return;
    }

    // Проверка размера файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 10MB');
      return;
    }

    setUploadingImage(true);
    const toastId = toast.loading('Загрузка изображения...');

    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setFormData(prev => ({
        ...prev,
        previewImage: imageUrl
      }));
      toast.success('Изображение успешно загружено', { id: toastId });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(`Ошибка загрузки изображения: ${error}`, { id: toastId });
    } finally {
      setUploadingImage(false);
      // Сброс input
      event.target.value = '';
    }
  };

  // Добавление источника
  const addSource = () => {
    if (!newSource.title.trim() || !newSource.url.trim()) {
      toast.error('Заполните название и URL источника');
      return;
    }

    // Простая валидация URL
    try {
      new URL(newSource.url);
    } catch (error) {
      toast.error('Некорректный URL источника');
      return;
    }

    setFormData(prev => ({
      ...prev,
      sources: [...prev.sources, { ...newSource }]
    }));
    setNewSource({ title: '', url: '' });
  };

  // Удаление источника
  const removeSource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index)
    }));
  };

  // Обработка изменений формы
  const handleInputChange = (field: keyof BlogFormData, value: unknown, lang?: 'ru' | 'kk' | 'en') => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (lang && (field === 'title' || field === 'excerpt' || field === 'content')) {
        // Сохраняем существующий объект с языками и обновляем только нужный язык
        const currentFieldValue = newData[field] as { ru: string; kk: string; en: string; };
        
        (newData[field] as { ru: string; kk: string; en: string; }) = {
          ...currentFieldValue,
          [lang]: value as string
        };
        
        // Автогенерация slug при изменении русского заголовка
        if (field === 'title' && lang === 'ru' && !editingBlog) {
          newData.slug = generateSlug(value as string);
        }
      } else if (field === 'tags') {
        const tagsString = value as string;
        newData.tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else {
        (newData as Record<string, unknown>)[field] = value;
      }
      
      return newData;
    });
  };

  // Сохранение статьи
  const handleSave = async () => {
    try {
      // Валидация
      if (!formData.title.ru || !formData.title.kk || !formData.title.en) {
        toast.error('Заполните заголовок на всех языках');
        return;
      }
      
      if (!formData.slug) {
        toast.error('Укажите slug для статьи');
        return;
      }
      
      if (!formData.excerpt.ru || !formData.excerpt.kk || !formData.excerpt.en) {
        toast.error('Заполните краткое описание на всех языках');
        return;
      }
      
      if (!formData.content.ru || !formData.content.kk || !formData.content.en) {
        toast.error('Заполните содержание на всех языках');
        return;
      }
      
      if (!formData.previewImage) {
        toast.error('Добавьте превью изображение');
        return;
      }

      const url = editingBlog ? `/api/blog/${editingBlog.slug}` : '/api/blog';
      const method = editingBlog ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save blog');
      }

      toast.success(editingBlog ? 'Статья обновлена' : 'Статья создана');
      closeModal();
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка сохранения статьи');
    }
  };

  // Удаление статьи
  const handleDelete = async (slug: string) => {
    if (!confirm(t('blog.delete.confirm'))) return;
    
    try {
      const response = await fetch(`/api/blog/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete blog');
      }

      toast.success('Статья удалена');
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Ошибка удаления статьи');
    }
  };

  // Фильтрация блогов
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = searchTerm === '' || 
      blog.title.ru.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.title.kk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === '' || blog.category === filterCategory;
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'published' && blog.isPublished) ||
      (filterStatus === 'draft' && !blog.isPublished);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('blog.management')}
        </h2>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('blog.add')}
        </button>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('blog.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          {/* Фильтр по категории */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Все категории</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          
          {/* Фильтр по статусу */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">{t('blog.filter.all')}</option>
            <option value="published">{t('blog.filter.published')}</option>
            <option value="draft">{t('blog.filter.draft')}</option>
          </select>
          
          {/* Счетчик */}
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            {filteredBlogs.length} из {blogs.length}
          </div>
        </div>
      </div>

      {/* Список статей */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('blog.title')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('blog.category')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('blog.views')}/{t('blog.likes')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBlogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      {blog.previewImage && (
                        <div className="w-12 h-12 relative flex-shrink-0">
                          <Image
                            src={blog.previewImage}
                            alt={blog.title[locale]}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {blog.title[locale]}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          /{blog.slug}
                        </p>
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {blog.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                            {blog.tags.length > 3 && (
                              <span className="text-xs text-gray-500">+{blog.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {blog.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {blog.isPublished ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Eye className="w-3 h-3 mr-1" />
                          {t('blog.published')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Черновик
                        </span>
                      )}
                      {blog.isFeatured && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          {t('blog.featured')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1 text-gray-400" />
                        {blog.views || 0}
                      </span>
                      <span className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-gray-400" />
                        {blog.likes || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <p>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : '-'}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(blog.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openModal(blog)}
                        className="text-primary-600 hover:text-primary-900 transition-colors"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.slug)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно для создания/редактирования */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingBlog ? t('blog.edit') : t('blog.add')}
              </h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Табы для языков */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {['ru', 'kk', 'en'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setCurrentTab(lang as 'ru' | 'kk' | 'en')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        currentTab === lang
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Основные поля */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Заголовок */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('blog.title')} ({currentTab.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={formData.title[currentTab] || ''}
                    onChange={(e) => handleInputChange('title', e.target.value, currentTab)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={`Заголовок статьи на ${currentTab === 'ru' ? 'русском' : currentTab === 'kk' ? 'казахском' : 'английском'} языке`}
                  />
                </div>
                
                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('blog.slug')}
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="url-friendly-identifier"
                  />
                </div>
                
                {/* Категория */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('blog.category')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Краткое описание */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('blog.excerpt')} ({currentTab.toUpperCase()})
                  </label>
                  <textarea
                    value={formData.excerpt[currentTab] || ''}
                    onChange={(e) => handleInputChange('excerpt', e.target.value, currentTab)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={`Краткое описание статьи на ${currentTab === 'ru' ? 'русском' : currentTab === 'kk' ? 'казахском' : 'английском'} языке`}
                  />
                </div>
                
                {/* Содержание с RichTextEditor */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('blog.content')} ({currentTab.toUpperCase()})
                  </label>
                  <div className="border border-gray-300 rounded-lg">
                    <RichTextEditor
                      key={`content-${currentTab}`}
                      value={formData.content[currentTab] || ''}
                      onChange={(value) => handleInputChange('content', value, currentTab)}
                      placeholder={`Полное содержание статьи на ${currentTab === 'ru' ? 'русском' : currentTab === 'kk' ? 'казахском' : 'английском'} языке`}
                    />
                  </div>
                </div>
                
                {/* Превью изображение */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('blog.preview')}
                  </label>
                  
                  {/* Загрузка через файл */}
                  <div className="mb-4">
                    <div className="flex items-center justify-center w-full">
                      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {uploadingImage ? (
                            <>
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                              <p className="mb-2 text-sm text-gray-500 mt-2">Загрузка изображения...</p>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 mb-2 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Кликните для загрузки</span> или перетащите файл
                              </p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF до 10MB</p>
                            </>
                          )}
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Альтернативно по URL */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Или укажите URL изображения
                    </label>
                    <input
                      type="url"
                      value={formData.previewImage}
                      onChange={(e) => handleInputChange('previewImage', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Превью загруженного изображения */}
                  {formData.previewImage && (
                    <div className="mt-4">
                      <div className="w-full max-w-md h-48 relative">
                        <Image
                          src={formData.previewImage}
                          alt="Превью"
                          fill
                          className="object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Теги */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('blog.tags')}
                  </label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="arduino, робототехника, diy"
                  />
                  <p className="text-xs text-gray-500 mt-1">Теги через запятую</p>
                </div>

                {/* Источники информации */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <LinkIcon className="inline w-4 h-4 mr-1" />
                    Источники информации
                  </label>
                  
                  {/* Список существующих источников */}
                  {formData.sources.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {formData.sources.map((source, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <ExternalLink className="w-4 h-4 mr-2 text-blue-500" />
                              <a 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {source.title}
                              </a>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate">{source.url}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSource(index)}
                            className="ml-3 text-red-500 hover:text-red-700 flex-shrink-0"
                            title="Удалить источник"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Форма добавления нового источника */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Добавить источник</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={newSource.title}
                        onChange={(e) => setNewSource(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Название источника"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      />
                      <input
                        type="url"
                        value={newSource.url}
                        onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://example.com"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      />
                      <button
                        type="button"
                        onClick={addSource}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        Добавить
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Максимум 10 источников. Будут отображаться как форматированные ссылки.
                    </p>
                  </div>
                </div>
                
                {/* Автор */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('blog.author')}
                  </label>
                  <input
                    type="text"
                    value={formData.author?.name || ''}
                    onChange={(e) => handleInputChange('author', { ...formData.author, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Имя автора"
                  />
                </div>
                
                
                {/* Чекбоксы */}
                <div className="md:col-span-2 flex flex-wrap gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t('blog.published')}</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t('blog.featured')}</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('blog.cancel')}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                {t('blog.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}