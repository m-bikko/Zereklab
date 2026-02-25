import mongoose from 'mongoose';

// Interface for multilingual content (same as Blog)
export interface MultilingualContent {
  ru: string;
  kk: string;
  en: string;
}

export interface ISocialProject {
  _id?: string;
  title: MultilingualContent;
  slug: string;
  description: MultilingualContent; // Short description
  content: MultilingualContent; // Full content
  beforeImage: string;
  afterImage: string;
  referenceLink?: string; // Optional reference or source link
  isPublished: boolean;
  publishedAt?: Date;
  views: number;
  createdAt?: Date;
  updatedAt?: Date;
  // Methods
  getPreview(locale?: 'ru' | 'kk' | 'en', length?: number): string;
}

const SocialProjectSchema = new mongoose.Schema(
  {
    title: {
      ru: { type: String, required: true, trim: true },
      kk: { type: String, required: false, trim: true },
      en: { type: String, required: false, trim: true },
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    description: {
      ru: { type: String, required: true, trim: true },
      kk: { type: String, required: false, trim: true },
      en: { type: String, required: false, trim: true },
    },
    content: {
      ru: { type: String, required: true },
      kk: { type: String, required: false },
      en: { type: String, required: false },
    },
    beforeImage: {
      type: String,
      required: true,
    },
    afterImage: {
      type: String,
      required: true,
    },
    referenceLink: {
      type: String,
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SocialProjectSchema.index({ isPublished: 1, publishedAt: -1 });
SocialProjectSchema.index({ slug: 1 });

// Helper for preview
SocialProjectSchema.methods.getPreview = function (
  locale: 'ru' | 'kk' | 'en' = 'ru',
  length: number = 150
) {
  const content = this.description[locale] || this.description.ru || '';
  return content.length > length
    ? content.substring(0, length) + '...'
    : content;
};

// Auto update publishedAt
SocialProjectSchema.pre('save', function (next) {
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const SocialProject =
  mongoose.models.SocialProject ||
  mongoose.model<ISocialProject>('SocialProject', SocialProjectSchema);

export default SocialProject;
