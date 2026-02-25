'use client';

import RichTextEditor from '@/components/RichTextEditor';
import { BlogStatus, IBlog } from '@/models/Blog';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import Image from 'next/image';

import {
  Calendar,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  Link as LinkIcon,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  X,
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
  status: BlogStatus;
  scheduledAt: string;
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
  status: 'draft',
  scheduledAt: '',
  isPublished: false,
  isFeatured: false,
  author: {
    name: 'ZerekLab Team',
    avatar: '',
  },
};

const CATEGORIES = [
  'общие',
  'новости',
  'образование',
  'технологии',
  'arduino',
  'робототехника',
  'программирование',
  'diy',
];

export default function BlogManagement({ locale }: BlogManagementProps) {
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<IBlog | null>(null);
  const [formData, setFormData] = useState<BlogFormData>(INITIAL_FORM_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'published' | 'scheduled' | 'draft'
  >('all');
  const [currentTab, setCurrentTab] = useState<'ru' | 'kk' | 'en'>('ru');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newSource, setNewSource] = useState<SourceInfo>({
    title: '',
    url: '',
  });

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
        'blog.scheduled': 'Запланировано',
        'blog.draft': 'Черновик',
        'blog.featured': 'Рекомендуемая',
        'blog.author': 'Автор',
        'blog.views': 'Просмотры',
        'blog.likes': 'Лайки',
        'blog.search': 'Поиск статей...',
        'blog.filter.all': 'Все статьи',
        'blog.filter.published': 'Опубликованные',
        'blog.filter.scheduled': 'Запланированные',
        'blog.filter.draft': 'Черновики',
        'blog.save': 'Сохранить',
        'blog.cancel': 'Отмена',
        'blog.delete.confirm': 'Вы уверены, что хотите удалить эту статью?',
        'blog.status': 'Статус публикации',
        'blog.status.draft': 'Черновик',
        'blog.status.scheduled': 'Запланировать',
        'blog.status.published': 'Опубликовать сейчас',
        'blog.scheduledAt': 'Дата и время публикации',
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
        'blog.scheduled': 'Жоспарланған',
        'blog.draft': 'Жоба',
        'blog.featured': 'Ұсынылатын',
        'blog.author': 'Автор',
        'blog.views': 'Көру',
        'blog.likes': 'Ұнату',
        'blog.search': 'Мақалаларды іздеу...',
        'blog.filter.all': 'Барлық мақалалар',
        'blog.filter.published': 'Жарияланған',
        'blog.filter.scheduled': 'Жоспарланған',
        'blog.filter.draft': 'Жобалар',
        'blog.save': 'Сақтау',
        'blog.cancel': 'Болдырмау',
        'blog.delete.confirm': 'Бұл мақаланы жойғыңыз келе ме?',
        'blog.status': 'Жариялау күйі',
        'blog.status.draft': 'Жоба',
        'blog.status.scheduled': 'Жоспарлау',
        'blog.status.published': 'Қазір жариялау',
        'blog.scheduledAt': 'Жариялау күні мен уақыты',
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
        'blog.scheduled': 'Scheduled',
        'blog.draft': 'Draft',
        'blog.featured': 'Featured',
        'blog.author': 'Author',
        'blog.views': 'Views',
        'blog.likes': 'Likes',
        'blog.search': 'Search articles...',
        'blog.filter.all': 'All articles',
        'blog.filter.published': 'Published',
        'blog.filter.scheduled': 'Scheduled',
        'blog.filter.draft': 'Drafts',
        'blog.save': 'Save',
        'blog.cancel': 'Cancel',
        'blog.delete.confirm': 'Are you sure you want to delete this article?',
        'blog.status': 'Publication status',
        'blog.status.draft': 'Draft',
        'blog.status.scheduled': 'Schedule',
        'blog.status.published': 'Publish now',
        'blog.scheduledAt': 'Publication date and time',
      },
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

  // Функция для форматирования даты в формат datetime-local
  const formatDateTimeLocal = (date: Date | string | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Открыть модальное окно для создания/редактирования
  const openModal = (blog?: IBlog) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: {
          ru: blog.title.ru || '',
          kk: blog.title.kk || '',
          en: blog.title.en || '',
        },
        slug: blog.slug,
        excerpt: {
          ru: blog.excerpt.ru || '',
          kk: blog.excerpt.kk || '',
          en: blog.excerpt.en || '',
        },
        content: {
          ru: blog.content.ru || '',
          kk: blog.content.kk || '',
          en: blog.content.en || '',
        },
        previewImage: blog.previewImage,
        sources: blog.sources || [],
        tags: blog.tags || [],
        category: blog.category || 'общие',
        status: blog.status || (blog.isPublished ? 'published' : 'draft'),
        scheduledAt: formatDateTimeLocal(blog.scheduledAt),
        isPublished: blog.isPublished,
        isFeatured: blog.isFeatured,
        author: blog.author || { name: 'ZerekLab Team', avatar: '' },
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
          files: [
            {
              data: base64Data,
              name: file.name,
              type: file.type,
            },
          ],
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
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
        previewImage: imageUrl,
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
      sources: [...prev.sources, { ...newSource }],
    }));
    setNewSource({ title: '', url: '' });
  };

  // Удаление источника
  const removeSource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index),
    }));
  };

  // Обработка изменений формы
  const handleInputChange = (
    field: keyof BlogFormData,
    value: unknown,
    lang?: 'ru' | 'kk' | 'en'
  ) => {
    setFormData(prev => {
      const newData = { ...prev };

      if (
        lang &&
        (field === 'title' || field === 'excerpt' || field === 'content')
      ) {
        // Сохраняем существующий объект с языками и обновляем только нужный язык
        const currentFieldValue = newData[field] as {
          ru: string;
          kk: string;
          en: string;
        };

        (newData[field] as { ru: string; kk: string; en: string }) = {
          ...currentFieldValue,
          [lang]: value as string,
        };

        // Автогенерация slug при изменении русского заголовка
        if (field === 'title' && lang === 'ru' && !editingBlog) {
          newData.slug = generateSlug(value as string);
        }
      } else if (field === 'tags') {
        const tagsString = value as string;
        newData.tags = tagsString
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag);
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

      if (
        !formData.excerpt.ru ||
        !formData.excerpt.kk ||
        !formData.excerpt.en
      ) {
        toast.error('Заполните краткое описание на всех языках');
        return;
      }

      if (
        !formData.content.ru ||
        !formData.content.kk ||
        !formData.content.en
      ) {
        toast.error('Заполните содержание на всех языках');
        return;
      }

      if (!formData.previewImage) {
        toast.error('Добавьте превью изображение');
        return;
      }

      // Валидация для запланированных постов
      if (formData.status === 'scheduled') {
        if (!formData.scheduledAt) {
          toast.error('Укажите дату и время публикации');
          return;
        }
        const scheduledDate = new Date(formData.scheduledAt);
        if (scheduledDate <= new Date()) {
          toast.error('Дата публикации должна быть в будущем');
          return;
        }
      }

      const url = editingBlog ? `/api/blog/${editingBlog.slug}` : '/api/blog';
      const method = editingBlog ? 'PUT' : 'POST';

      // Подготовка данных для отправки
      const dataToSend = {
        ...formData,
        scheduledAt:
          formData.status === 'scheduled' && formData.scheduledAt
            ? new Date(formData.scheduledAt).toISOString()
            : null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save blog');
      }

      const statusMessages: Record<string, string> = {
        draft: editingBlog ? 'Черновик обновлен' : 'Черновик сохранен',
        scheduled: editingBlog
          ? 'Публикация запланирована'
          : 'Публикация запланирована',
        published: editingBlog ? 'Статья обновлена' : 'Статья опубликована',
      };

      toast.success(statusMessages[formData.status] || 'Статья сохранена');
      closeModal();
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error(
        error instanceof Error ? error.message : 'Ошибка сохранения статьи'
      );
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
    const matchesSearch =
      searchTerm === '' ||
      blog.title.ru.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.title.kk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags?.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      filterCategory === '' || blog.category === filterCategory;

    const blogStatus =
      blog.status || (blog.isPublished ? 'published' : 'draft');
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && blogStatus === 'published') ||
      (filterStatus === 'scheduled' && blogStatus === 'scheduled') ||
      (filterStatus === 'draft' && blogStatus === 'draft');

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-6 overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex-shrink-0 text-2xl font-bold text-gray-900">
          {t('blog.management')}
        </h2>
        <button
          onClick={() => openModal()}
          className="inline-flex flex-shrink-0 items-center whitespace-nowrap rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('blog.add')}
        </button>
      </div>

      {/* Фильтры и поиск */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder={t('blog.search')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Фильтр по категории */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-500"
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
            onChange={e =>
              setFilterStatus(
                e.target.value as 'all' | 'published' | 'scheduled' | 'draft'
              )
            }
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">{t('blog.filter.all')}</option>
            <option value="published">{t('blog.filter.published')}</option>
            <option value="scheduled">{t('blog.filter.scheduled')}</option>
            <option value="draft">{t('blog.filter.draft')}</option>
          </select>

          {/* Счетчик */}
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="mr-2 h-4 w-4" />
            {filteredBlogs.length} из {blogs.length}
          </div>
        </div>
      </div>

      {/* Список статей */}
      <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[35%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('blog.title')}
                </th>
                <th className="w-[12%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('blog.category')}
                </th>
                <th className="w-[18%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Статус
                </th>
                <th className="w-[12%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('blog.views')}/{t('blog.likes')}
                </th>
                <th className="w-[13%] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Дата
                </th>
                <th className="w-[10%] px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredBlogs.map(blog => (
                <tr key={blog._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex min-w-0 items-start space-x-3">
                      {blog.previewImage && (
                        <div className="relative h-10 w-10 flex-shrink-0">
                          <Image
                            src={blog.previewImage}
                            alt={blog.title[locale]}
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {blog.title[locale]}
                        </p>
                        <p className="truncate text-sm text-gray-500">
                          /{blog.slug}
                        </p>
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {blog.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                            {blog.tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{blog.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="truncate px-4 py-4 text-sm text-gray-900">
                    {blog.category}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex flex-wrap items-center gap-1">
                        {blog.status === 'published' ||
                        (!blog.status && blog.isPublished) ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            <Eye className="mr-1 h-3 w-3" />
                            {t('blog.published')}
                          </span>
                        ) : blog.status === 'scheduled' ? (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                            <Clock className="mr-1 h-3 w-3" />
                            {t('blog.scheduled')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                            <EyeOff className="mr-1 h-3 w-3" />
                            {t('blog.draft')}
                          </span>
                        )}
                        {blog.isFeatured && (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                            <Star className="mr-1 h-3 w-3" />
                          </span>
                        )}
                      </div>
                      {blog.status === 'scheduled' && blog.scheduledAt && (
                        <span className="flex items-center text-xs text-blue-600">
                          <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(blog.scheduledAt).toLocaleDateString()}
                          </span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center">
                        <Eye className="mr-1 h-3 w-3 text-gray-400" />
                        {blog.views || 0}
                      </span>
                      <span className="flex items-center">
                        <Star className="mr-1 h-3 w-3 text-gray-400" />
                        {blog.likes || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    <div>
                      <p>
                        {blog.publishedAt
                          ? new Date(blog.publishedAt).toLocaleDateString()
                          : '-'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(blog.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openModal(blog)}
                        className="p-1 text-primary-600 transition-colors hover:text-primary-900"
                        title="Редактировать"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.slug)}
                        className="p-1 text-red-600 transition-colors hover:text-red-900"
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

      {/* Модальное окно для создания/редактирования */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white">
            <div className="sticky top-0 border-b border-gray-200 bg-white px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingBlog ? t('blog.edit') : t('blog.add')}
              </h3>
            </div>

            <div className="space-y-6 p-6">
              {/* Табы для языков */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {['ru', 'kk', 'en'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setCurrentTab(lang as 'ru' | 'kk' | 'en')}
                      className={`border-b-2 px-1 py-2 text-sm font-medium ${
                        currentTab === lang
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Основные поля */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Заголовок */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t('blog.title')} ({currentTab.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={formData.title[currentTab] || ''}
                    onChange={e =>
                      handleInputChange('title', e.target.value, currentTab)
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                    placeholder={`Заголовок статьи на ${currentTab === 'ru' ? 'русском' : currentTab === 'kk' ? 'казахском' : 'английском'} языке`}
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t('blog.slug')}
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => handleInputChange('slug', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                    placeholder="url-friendly-identifier"
                  />
                </div>

                {/* Категория */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t('blog.category')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={e =>
                      handleInputChange('category', e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-500"
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
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t('blog.excerpt')} ({currentTab.toUpperCase()})
                  </label>
                  <textarea
                    value={formData.excerpt[currentTab] || ''}
                    onChange={e =>
                      handleInputChange('excerpt', e.target.value, currentTab)
                    }
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                    placeholder={`Краткое описание статьи на ${currentTab === 'ru' ? 'русском' : currentTab === 'kk' ? 'казахском' : 'английском'} языке`}
                  />
                </div>

                {/* Содержание с RichTextEditor */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t('blog.content')} ({currentTab.toUpperCase()})
                  </label>
                  <div className="rounded-lg border border-gray-300">
                    <RichTextEditor
                      key={`content-${currentTab}`}
                      value={formData.content[currentTab] || ''}
                      onChange={value =>
                        handleInputChange('content', value, currentTab)
                      }
                      placeholder={`Полное содержание статьи на ${currentTab === 'ru' ? 'русском' : currentTab === 'kk' ? 'казахском' : 'английском'} языке`}
                    />
                  </div>
                </div>

                {/* Превью изображение */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t('blog.preview')}
                  </label>

                  {/* Загрузка через файл */}
                  <div className="mb-4">
                    <div className="flex w-full items-center justify-center">
                      <label
                        className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 ${uploadingImage ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <div className="flex flex-col items-center justify-center pb-6 pt-5">
                          {uploadingImage ? (
                            <>
                              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-500"></div>
                              <p className="mb-2 mt-2 text-sm text-gray-500">
                                Загрузка изображения...
                              </p>
                            </>
                          ) : (
                            <>
                              <Upload className="mb-2 h-8 w-8 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">
                                  Кликните для загрузки
                                </span>{' '}
                                или перетащите файл
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF до 10MB
                              </p>
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
                    <label className="mb-2 block text-sm font-medium text-gray-600">
                      Или укажите URL изображения
                    </label>
                    <input
                      type="url"
                      value={formData.previewImage}
                      onChange={e =>
                        handleInputChange('previewImage', e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Превью загруженного изображения */}
                  {formData.previewImage && (
                    <div className="mt-4">
                      <div className="relative h-48 w-full max-w-md">
                        <Image
                          src={formData.previewImage}
                          alt="Превью"
                          fill
                          className="rounded-lg border border-gray-200 object-cover"
                          onError={e => {
                            (e.target as HTMLImageElement).style.display =
                              'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Теги */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t('blog.tags')}
                  </label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={e => handleInputChange('tags', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                    placeholder="arduino, робототехника, diy"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Теги через запятую
                  </p>
                </div>

                {/* Источники информации */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <LinkIcon className="mr-1 inline h-4 w-4" />
                    Источники информации
                  </label>

                  {/* Список существующих источников */}
                  {formData.sources.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {formData.sources.map((source, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                        >
                          <div className="flex-1">
                            <div className="flex items-center">
                              <ExternalLink className="mr-2 h-4 w-4 text-blue-500" />
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:text-blue-800"
                              >
                                {source.title}
                              </a>
                            </div>
                            <p className="mt-1 truncate text-xs text-gray-500">
                              {source.url}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSource(index)}
                            className="ml-3 flex-shrink-0 text-red-500 hover:text-red-700"
                            title="Удалить источник"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Форма добавления нового источника */}
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="mb-3 text-sm font-medium text-gray-700">
                      Добавить источник
                    </h4>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <input
                        type="text"
                        value={newSource.title}
                        onChange={e =>
                          setNewSource(prev => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Название источника"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="url"
                        value={newSource.url}
                        onChange={e =>
                          setNewSource(prev => ({
                            ...prev,
                            url: e.target.value,
                          }))
                        }
                        placeholder="https://example.com"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={addSource}
                        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                      >
                        Добавить
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Максимум 10 источников. Будут отображаться как
                      форматированные ссылки.
                    </p>
                  </div>
                </div>

                {/* Автор */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t('blog.author')}
                  </label>
                  <input
                    type="text"
                    value={formData.author?.name || ''}
                    onChange={e =>
                      handleInputChange('author', {
                        ...formData.author,
                        name: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                    placeholder="Имя автора"
                  />
                </div>

                {/* Статус публикации */}
                <div className="md:col-span-2">
                  <label className="mb-3 block text-sm font-medium text-gray-700">
                    {t('blog.status')}
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex cursor-pointer items-center">
                      <input
                        type="radio"
                        name="status"
                        value="draft"
                        checked={formData.status === 'draft'}
                        onChange={e =>
                          handleInputChange('status', e.target.value)
                        }
                        className="h-4 w-4 border-gray-300 text-gray-600 focus:ring-gray-500"
                      />
                      <span className="ml-2 flex items-center text-sm text-gray-700">
                        <EyeOff className="mr-1 h-4 w-4 text-gray-500" />
                        {t('blog.status.draft')}
                      </span>
                    </label>

                    <label className="flex cursor-pointer items-center">
                      <input
                        type="radio"
                        name="status"
                        value="scheduled"
                        checked={formData.status === 'scheduled'}
                        onChange={e =>
                          handleInputChange('status', e.target.value)
                        }
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 flex items-center text-sm text-gray-700">
                        <Clock className="mr-1 h-4 w-4 text-blue-500" />
                        {t('blog.status.scheduled')}
                      </span>
                    </label>

                    <label className="flex cursor-pointer items-center">
                      <input
                        type="radio"
                        name="status"
                        value="published"
                        checked={formData.status === 'published'}
                        onChange={e =>
                          handleInputChange('status', e.target.value)
                        }
                        className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-2 flex items-center text-sm text-gray-700">
                        <Eye className="mr-1 h-4 w-4 text-green-500" />
                        {t('blog.status.published')}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Дата и время для запланированной публикации */}
                {formData.status === 'scheduled' && (
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      <Calendar className="mr-1 inline h-4 w-4" />
                      {t('blog.scheduledAt')}
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={e =>
                        handleInputChange('scheduledAt', e.target.value)
                      }
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Статья будет автоматически опубликована в указанное время
                    </p>
                  </div>
                )}

                {/* Рекомендуемая статья */}
                <div className="md:col-span-2">
                  <label className="flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={e =>
                        handleInputChange('isFeatured', e.target.checked)
                      }
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 flex items-center text-sm text-gray-700">
                      <Star className="mr-1 h-4 w-4 text-yellow-500" />
                      {t('blog.featured')}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end space-x-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button
                onClick={closeModal}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                {t('blog.cancel')}
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-primary-500 px-4 py-2 text-white transition-colors hover:bg-primary-600"
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
