import mongoose from 'mongoose';

// Интерфейс для мультиязычного контента
export interface MultilingualContent {
  ru: string;
  kk: string;
  en: string;
}

// Интерфейс для медиа контента в статье
export interface MediaContent {
  type: 'image' | 'video';
  url: string;
  caption?: MultilingualContent;
  alt?: string;
}

// Интерфейс для источника информации
export interface SourceInfo {
  title: string; // Название источника
  url: string; // Ссылка на источник
}

// Статус публикации
export type BlogStatus = 'draft' | 'scheduled' | 'published';

// Интерфейс для блога/новости
export interface IBlog {
  _id?: string;
  title: MultilingualContent;
  slug: string; // URL-friendly идентификатор
  excerpt: MultilingualContent; // Краткое описание для карточек
  content: MultilingualContent; // Основной контент
  previewImage: string; // Основное изображение для превью (теперь с поддержкой загрузки)
  media?: MediaContent[]; // Дополнительные изображения и видео
  sources?: SourceInfo[]; // Источники информации с форматированными ссылками
  tags?: string[]; // Теги для фильтрации
  category?: string; // Категория новости
  status: BlogStatus; // Статус публикации: черновик, запланирована, опубликована
  isPublished: boolean; // Опубликована ли статья (deprecated, используйте status)
  isFeatured: boolean; // Рекомендуемая статья
  scheduledAt?: Date; // Дата запланированной публикации
  publishedAt?: Date; // Дата публикации
  views: number; // Количество просмотров
  likes: number; // Количество лайков
  author?: {
    name: string;
    avatar?: string;
  };
  seoTitle?: MultilingualContent; // SEO заголовок
  seoDescription?: MultilingualContent; // SEO описание
  relatedPosts?: string[]; // ID связанных статей
  readingTime?: number; // Время чтения в минутах
  createdAt?: Date;
  updatedAt?: Date;
  // Методы экземпляра
  calculateReadingTime(locale?: 'ru' | 'kk' | 'en'): number;
  incrementViews(): Promise<IBlog>;
  getPreview(locale?: 'ru' | 'kk' | 'en', length?: number): string;
}

// Схема для медиа контента
const MediaContentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  caption: {
    ru: { type: String, default: '' },
    kk: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  alt: {
    type: String,
    default: '',
  },
});

// Схема для автора
const AuthorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: '',
  },
});

// Схема для источника информации
const SourceInfoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Название источника не может быть длиннее 100 символов'],
    },
    url: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'URL должен начинаться с http:// или https://',
      },
    },
  },
  { _id: false }
);

// Основная схема блога
const BlogSchema = new mongoose.Schema(
  {
    title: {
      ru: {
        type: String,
        required: [true, 'Заголовок на русском языке обязателен'],
        trim: true,
        maxlength: [200, 'Заголовок не может быть длиннее 200 символов'],
      },
      kk: {
        type: String,
        required: [true, 'Заголовок на казахском языке обязателен'],
        trim: true,
        maxlength: [200, 'Заголовок не может быть длиннее 200 символов'],
      },
      en: {
        type: String,
        required: [true, 'Заголовок на английском языке обязателен'],
        trim: true,
        maxlength: [200, 'Заголовок не может быть длиннее 200 символов'],
      },
    },
    slug: {
      type: String,
      required: [true, 'Slug обязателен'],
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9-]+$/,
        'Slug может содержать только строчные буквы, цифры и дефисы',
      ],
      index: { unique: true },
    },
    excerpt: {
      ru: {
        type: String,
        required: [true, 'Краткое описание на русском языке обязательно'],
        trim: true,
        maxlength: [300, 'Краткое описание не может быть длиннее 300 символов'],
      },
      kk: {
        type: String,
        required: [true, 'Краткое описание на казахском языке обязательно'],
        trim: true,
        maxlength: [300, 'Краткое описание не может быть длиннее 300 символов'],
      },
      en: {
        type: String,
        required: [true, 'Краткое описание на английском языке обязательно'],
        trim: true,
        maxlength: [300, 'Краткое описание не может быть длиннее 300 символов'],
      },
    },
    content: {
      ru: {
        type: String,
        required: [true, 'Содержание на русском языке обязательно'],
        trim: true,
      },
      kk: {
        type: String,
        required: [true, 'Содержание на казахском языке обязательно'],
        trim: true,
      },
      en: {
        type: String,
        required: [true, 'Содержание на английском языке обязательно'],
        trim: true,
      },
    },
    previewImage: {
      type: String,
      required: [true, 'Превью изображение обязательно'],
    },
    media: [MediaContentSchema],
    sources: {
      type: [SourceInfoSchema],
      default: [],
      validate: {
        validator: function (sources: SourceInfo[]) {
          return sources.length <= 10;
        },
        message: 'Максимально можно указать 10 источников',
      },
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    category: {
      type: String,
      trim: true,
      default: 'общие',
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published'],
      default: 'draft',
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    scheduledAt: {
      type: Date,
      default: null,
      required: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
      required: false,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    author: {
      type: AuthorSchema,
      default: () => ({
        name: 'ZerekLab Team',
        avatar: '',
      }),
    },
    seoTitle: {
      ru: { type: String, trim: true, maxlength: 60 },
      kk: { type: String, trim: true, maxlength: 60 },
      en: { type: String, trim: true, maxlength: 60 },
    },
    seoDescription: {
      ru: { type: String, trim: true, maxlength: 160 },
      kk: { type: String, trim: true, maxlength: 160 },
      en: { type: String, trim: true, maxlength: 160 },
    },
    relatedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
      },
    ],
    readingTime: {
      type: Number,
      min: 1,
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Индексы для оптимизации поиска (slug уже имеет уникальный индекс в схеме)
BlogSchema.index({ isPublished: 1, publishedAt: -1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ category: 1 });
BlogSchema.index({ isFeatured: 1 });
BlogSchema.index({ views: -1 });
BlogSchema.index({ createdAt: -1 });

// Виртуальное поле для полного URL
BlogSchema.virtual('url').get(function () {
  return `/blog/${this.slug}`;
});

// Автоматически устанавливать publishedAt при публикации и синхронизировать isPublished со status
BlogSchema.pre('save', function (next) {
  // Синхронизация status с isPublished для обратной совместимости
  if (this.status === 'published') {
    this.isPublished = true;
    if (!this.publishedAt) {
      this.publishedAt = new Date();
    }
  } else {
    this.isPublished = false;
  }

  // Если статус scheduled, но scheduledAt не установлен - ставим на час вперёд
  if (this.status === 'scheduled' && !this.scheduledAt) {
    this.scheduledAt = new Date(Date.now() + 60 * 60 * 1000);
  }

  // Если сбросили статус в draft - очищаем scheduledAt
  if (this.status === 'draft') {
    (this as unknown as Record<string, unknown>).scheduledAt = undefined;
  }

  next();
});

// Метод для подсчета времени чтения
BlogSchema.methods.calculateReadingTime = function (
  locale: 'ru' | 'kk' | 'en' = 'ru'
) {
  const content = this.content[locale] || this.content.ru;
  const wordsPerMinute = 200; // Средняя скорость чтения
  const wordCount = content.split(/\s+/).length;
  this.readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return this.readingTime;
};

// Метод для увеличения просмотров
BlogSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Метод для получения превью контента
BlogSchema.methods.getPreview = function (
  locale: 'ru' | 'kk' | 'en' = 'ru',
  length: number = 150
) {
  const content = this.content[locale] || this.content.ru;
  // Удаляем HTML теги для превью
  const plainText = content.replace(/<[^>]*>/g, '');
  return plainText.length > length
    ? plainText.substring(0, length) + '...'
    : plainText;
};

// Фильтр для опубликованных постов (с обратной совместимостью)
const publishedFilter = {
  $or: [
    { status: 'published' },
    { isPublished: true, status: { $exists: false } },
    { isPublished: true, status: null },
  ],
};

// Статический метод для получения популярных статей
BlogSchema.statics.getPopular = function (limit: number = 10) {
  return this.find(publishedFilter)
    .sort({ views: -1, likes: -1 })
    .limit(limit)
    .lean();
};

// Статический метод для получения рекомендуемых статей
BlogSchema.statics.getFeatured = function (limit: number = 3) {
  return this.find({ ...publishedFilter, isFeatured: true })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();
};

// Статический метод для получения последних статей
BlogSchema.statics.getLatest = function (limit: number = 10) {
  return this.find(publishedFilter)
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();
};

// Статический метод для публикации запланированных постов
BlogSchema.statics.publishScheduledPosts = async function () {
  const now = new Date();
  const result = await this.updateMany(
    {
      status: 'scheduled',
      scheduledAt: { $lte: now },
    },
    {
      $set: {
        status: 'published',
        isPublished: true,
        publishedAt: now,
      },
    }
  );
  return result.modifiedCount;
};

// Интерфейс для статических методов
interface BlogModel extends mongoose.Model<IBlog> {
  getPopular(limit?: number): Promise<IBlog[]>;
  getFeatured(limit?: number): Promise<IBlog[]>;
  getLatest(limit?: number): Promise<IBlog[]>;
  publishScheduledPosts(): Promise<number>;
}

const Blog = (mongoose.models.Blog ||
  mongoose.model<IBlog, BlogModel>('Blog', BlogSchema)) as unknown as BlogModel;

export default Blog;
