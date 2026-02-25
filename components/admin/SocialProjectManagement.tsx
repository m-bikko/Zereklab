'use client';

import RichTextEditor from '@/components/RichTextEditor';
import { ISocialProject } from '@/models/SocialProject';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import Image from 'next/image';

import {
  Edit,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';

interface SocialProjectManagementProps {
  locale: 'ru' | 'kk' | 'en';
}

interface SocialProjectFormData {
  title: {
    ru: string;
    kk: string;
    en: string;
  };
  slug: string;
  description: {
    ru: string;
    kk: string;
    en: string;
  };
  content: {
    ru: string;
    kk: string;
    en: string;
  };
  beforeImage: string;
  afterImage: string;
  referenceLink: string;
  isPublished: boolean;
}

const INITIAL_FORM_DATA: SocialProjectFormData = {
  title: { ru: '', kk: '', en: '' },
  slug: '',
  description: { ru: '', kk: '', en: '' },
  content: { ru: '', kk: '', en: '' },
  beforeImage: '',
  afterImage: '',
  referenceLink: '',
  isPublished: false,
};

export default function SocialProjectManagement({
  locale,
}: SocialProjectManagementProps) {
  const [projects, setProjects] = useState<ISocialProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ISocialProject | null>(
    null
  );
  const [formData, setFormData] =
    useState<SocialProjectFormData>(INITIAL_FORM_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState<'ru' | 'kk' | 'en'>('ru');
  const [uploadingImage, setUploadingImage] = useState<string | null>(null); // 'before' or 'after' or null

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ru: {
        'sp.management': 'Управление социальными проектами',
        'sp.add': 'Добавить проект',
        'sp.edit': 'Редактировать проект',
        'sp.title': 'Заголовок',
        'sp.slug': 'URL (slug)',
        'sp.description': 'Краткое описание',
        'sp.content': 'Посдробное описание (история)',
        'sp.before': 'Фото "До"',
        'sp.after': 'Фото "После"',
        'sp.published': 'Опубликовано',
        'sp.draft': 'Черновик',
        'sp.views': 'Просмотры',
        'sp.search': 'Поиск проектов...',
        'sp.save': 'Сохранить',
        'sp.cancel': 'Отмена',
        'sp.delete.confirm': 'Вы уверены, что хотите удалить этот проект?',
        'sp.publish_status': 'Статус публикации',
        'sp.image_upload': 'Загрузить изображение',
        'sp.date': 'Дата',
        'sp.reference_link': 'Ссылка на источник/проект',
      },
      kk: {
        'sp.management': 'Әлеуметтік жобаларды басқару',
        'sp.add': 'Жоба қосу',
        'sp.edit': 'Жобаны өңдеу',
        'sp.title': 'Тақырып',
        'sp.slug': 'URL (slug)',
        'sp.description': 'Қысқаша сипаттама',
        'sp.content': 'Толық сипаттама (тарих)',
        'sp.before': '"Дейін" суреті',
        'sp.after': '"Кейін" суреті',
        'sp.published': 'Жарияланған',
        'sp.draft': 'Жоба',
        'sp.views': 'Көру',
        'sp.search': 'Жобаларды іздеу...',
        'sp.save': 'Сақтау',
        'sp.cancel': 'Болдырмау',
        'sp.delete.confirm': 'Бұл жобаны жойғыңыз келе ме?',
        'sp.publish_status': 'Жариялау күйі',
        'sp.image_upload': 'Суретті жүктеу',
        'sp.date': 'Күні',
        'sp.reference_link': 'Дереккөз/жоба сілтемесі',
      },
      en: {
        'sp.management': 'Social Projects Management',
        'sp.add': 'Add Project',
        'sp.edit': 'Edit Project',
        'sp.title': 'Title',
        'sp.slug': 'URL (slug)',
        'sp.description': 'Short Description',
        'sp.content': 'Full Content (History)',
        'sp.before': '"Before" Image',
        'sp.after': '"After" Image',
        'sp.published': 'Published',
        'sp.draft': 'Draft',
        'sp.views': 'Views',
        'sp.search': 'Search projects...',
        'sp.save': 'Save',
        'sp.cancel': 'Cancel',
        'sp.delete.confirm': 'Are you sure you want to delete this project?',
        'sp.publish_status': 'Publication Status',
        'sp.image_upload': 'Upload Image',
        'sp.date': 'Date',
        'sp.reference_link': 'Reference/Source Link',
      },
    };

    return translations[locale]?.[key] || key;
  };

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/social-projects?limit=100');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Ошибка загрузки проектов');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openModal = (project?: ISocialProject) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: {
          ru: project.title.ru || '',
          kk: project.title.kk || '',
          en: project.title.en || '',
        },
        slug: project.slug,
        description: {
          ru: project.description.ru || '',
          kk: project.description.kk || '',
          en: project.description.en || '',
        },
        content: {
          ru: project.content.ru || '',
          kk: project.content.kk || '',
          en: project.content.en || '',
        },
        beforeImage: project.beforeImage,
        afterImage: project.afterImage,
        referenceLink: project.referenceLink || '',
        isPublished: project.isPublished,
      });
    } else {
      setEditingProject(null);
      setFormData({ ...INITIAL_FORM_DATA });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData(INITIAL_FORM_DATA);
    setCurrentTab('ru');
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

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
          folder: 'zereklab/social-projects',
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки изображения');
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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'before' | 'after'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите файл изображения');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 10MB');
      return;
    }

    setUploadingImage(type);
    const toastId = toast.loading('Загрузка изображения...');

    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setFormData(prev => ({
        ...prev,
        [type === 'before' ? 'beforeImage' : 'afterImage']: imageUrl,
      }));
      toast.success('Изображение успешно загружено', { id: toastId });
    } catch (error) {
      toast.error(`Ошибка загрузки: ${error}`, { id: toastId });
    } finally {
      setUploadingImage(null);
      event.target.value = '';
    }
  };

  const handleInputChange = (
    field: keyof SocialProjectFormData,
    value: unknown,
    lang?: 'ru' | 'kk' | 'en'
  ) => {
    setFormData(prev => {
      const newData = { ...prev };

      if (
        lang &&
        (field === 'title' || field === 'description' || field === 'content')
      ) {
        const currentFieldValue = newData[field] as {
          ru: string;
          kk: string;
          en: string;
        };

        (newData[field] as { ru: string; kk: string; en: string }) = {
          ...currentFieldValue,
          [lang]: value as string,
        };

        if (field === 'title' && lang === 'ru' && !editingProject) {
          newData.slug = generateSlug(value as string);
        }
      } else {
        (newData as Record<string, unknown>)[field] = value;
      }

      return newData;
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.title.ru || !formData.title.kk || !formData.title.en) {
        toast.error('Заполните заголовок на всех языках');
        return;
      }

      if (!formData.slug) {
        toast.error('Укажите slug для проекта');
        return;
      }

      if (!formData.beforeImage || !formData.afterImage) {
        toast.error('Загрузите оба изображения (до и после)');
        return;
      }

      const url = editingProject
        ? `/api/social-projects/${editingProject.slug}`
        : '/api/social-projects';
      const method = editingProject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save project');
      }

      toast.success(editingProject ? 'Проект обновлен' : 'Проект создан');
      closeModal();
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error(
        error instanceof Error ? error.message : 'Ошибка сохранения проекта'
      );
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(t('sp.delete.confirm'))) return;

    try {
      const response = await fetch(`/api/social-projects/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      toast.success('Проект удален');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Ошибка удаления проекта');
    }
  };

  const filteredProjects = projects.filter(project => {
    return (
      searchTerm === '' ||
      project.title.ru.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.title.kk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.title.en.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-6 overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex-shrink-0 text-2xl font-bold text-gray-900">
          {t('sp.management')}
        </h2>
        <button
          onClick={() => openModal()}
          className="inline-flex flex-shrink-0 items-center whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('sp.add')}
        </button>
      </div>

      {/* Search */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder={t('sp.search')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('sp.title')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('sp.publish_status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('sp.views')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('sp.date')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredProjects.map(project => (
                <tr key={project._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                        {project.afterImage && (
                          <Image
                            src={project.afterImage}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {project.title[locale]}
                        </div>
                        <div className="text-sm text-gray-500">
                          /{project.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {project.isPublished ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        <Eye className="mr-1 h-3 w-3" />
                        {t('sp.published')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        <EyeOff className="mr-1 h-3 w-3" />
                        {t('sp.draft')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {project.views}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(
                      project.createdAt || Date.now()
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => openModal(project)}
                      className="mr-4 text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.slug)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProject ? t('sp.edit') : t('sp.add')}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Language Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {['ru', 'kk', 'en'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setCurrentTab(lang as 'ru' | 'kk' | 'en')}
                      className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                        currentTab === lang
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } `}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t('sp.title')} ({currentTab.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={formData.title[currentTab]}
                    onChange={e =>
                      handleInputChange('title', e.target.value, currentTab)
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t('sp.slug')}
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => handleInputChange('slug', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t('sp.reference_link')}
                  </label>
                  <input
                    type="url"
                    value={formData.referenceLink}
                    onChange={e =>
                      handleInputChange('referenceLink', e.target.value)
                    }
                    placeholder="https://example.com"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t('sp.description')} ({currentTab.toUpperCase()})
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description[currentTab]}
                    onChange={e =>
                      handleInputChange(
                        'description',
                        e.target.value,
                        currentTab
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {t('sp.content')} ({currentTab.toUpperCase()})
                  </label>
                  <RichTextEditor
                    key={currentTab}
                    value={formData.content[currentTab] || ''}
                    onChange={content =>
                      handleInputChange('content', content, currentTab)
                    }
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Before Image */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t('sp.before')}
                    </label>
                    <div className="relative mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5 transition-colors hover:border-blue-500">
                      {formData.beforeImage ? (
                        <div className="w-full space-y-1 text-center">
                          <div className="relative mb-4 h-48 w-full">
                            <Image
                              src={formData.beforeImage}
                              alt="Before"
                              fill
                              className="rounded-md object-cover"
                            />
                            <button
                              onClick={() =>
                                setFormData(prev => ({
                                  ...prev,
                                  beforeImage: '',
                                }))
                              }
                              className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 text-center">
                          {uploadingImage === 'before' ? (
                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                          ) : (
                            <>
                              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="flex text-sm text-gray-600">
                                <label className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500">
                                  <span>{t('sp.image_upload')}</span>
                                  <input
                                    type="file"
                                    className="sr-only"
                                    accept="image/*"
                                    onChange={e =>
                                      handleImageUpload(e, 'before')
                                    }
                                  />
                                </label>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* After Image */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t('sp.after')}
                    </label>
                    <div className="relative mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5 transition-colors hover:border-blue-500">
                      {formData.afterImage ? (
                        <div className="w-full space-y-1 text-center">
                          <div className="relative mb-4 h-48 w-full">
                            <Image
                              src={formData.afterImage}
                              alt="After"
                              fill
                              className="rounded-md object-cover"
                            />
                            <button
                              onClick={() =>
                                setFormData(prev => ({
                                  ...prev,
                                  afterImage: '',
                                }))
                              }
                              className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 text-center">
                          {uploadingImage === 'after' ? (
                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                          ) : (
                            <>
                              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="flex text-sm text-gray-600">
                                <label className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500">
                                  <span>{t('sp.image_upload')}</span>
                                  <input
                                    type="file"
                                    className="sr-only"
                                    accept="image/*"
                                    onChange={e =>
                                      handleImageUpload(e, 'after')
                                    }
                                  />
                                </label>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={e =>
                      handleInputChange('isPublished', e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isPublished"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    {t('sp.published')}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 rounded-b-lg bg-gray-50 px-6 py-4">
              <button
                onClick={closeModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {t('sp.cancel')}
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {t('sp.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
