/**
 * Извлекает YouTube Video ID из различных форматов URL
 * @param url YouTube URL
 * @returns Video ID или null если URL некорректный
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    // Standard YouTube URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    // YouTube shortened URLs
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    // YouTube embed URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    // YouTube shorts URLs
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If it's already just a video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * Создает URL для встраиваемого YouTube плеера
 * @param videoId YouTube Video ID
 * @returns Embed URL
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
}

/**
 * Создает URL для миниатюры YouTube видео
 * @param videoId YouTube Video ID
 * @param quality Качество миниатюры ('default', 'medium', 'high', 'standard', 'maxres')
 * @returns Thumbnail URL
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium'
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality === 'medium' ? 'mqdefault' : quality === 'high' ? 'hqdefault' : quality === 'standard' ? 'sddefault' : quality === 'maxres' ? 'maxresdefault' : 'default'}.jpg`;
}

/**
 * Проверяет, является ли URL валидным YouTube URL
 * @param url URL для проверки
 * @returns true если URL валидный
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}
