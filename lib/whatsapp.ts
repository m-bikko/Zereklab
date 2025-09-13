import { getLocalizedText } from '@/types';

import type { CartItem } from '@/store/cartStore';

/**
 * Formats cart items into a WhatsApp message
 * @param items - Array of cart items
 * @param locale - Current locale
 * @param whatsappNumber - WhatsApp number from environment
 * @returns Formatted WhatsApp URL
 */
export function createWhatsAppOrderMessage(
  items: CartItem[],
  locale: string = 'ru'
): string {
  if (!items || items.length === 0) {
    return '';
  }

  // Get translations based on locale
  const translations = {
    ru: {
      greeting: 'Здравствуйте! Я хочу заказать следующие товары:',
      item: 'Товар',
      quantity: 'Количество',
      price: 'Цена',
      total: 'Общая сумма',
      currency: '₸',
      thanks: 'Пожалуйста, подтвердите заказ и сообщите о сроках доставки.',
      contact: 'Спасибо!',
    },
    kk: {
      greeting: 'Сәлеметсіз бе! Мен мына тауарларды тапсырыс бергім келеді:',
      item: 'Тауар',
      quantity: 'Саны',
      price: 'Бағасы',
      total: 'Жалпы сома',
      currency: '₸',
      thanks: 'Тапсырысты растап, жеткізу мерзімдері туралы хабарлаңыз.',
      contact: 'Рахмет!',
    },
    en: {
      greeting: 'Hello! I would like to order the following items:',
      item: 'Item',
      quantity: 'Quantity',
      price: 'Price',
      total: 'Total Amount',
      currency: '₸',
      thanks: 'Please confirm the order and let me know about delivery times.',
      contact: 'Thank you!',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.ru;

  // Calculate total
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Build message
  let message = `${t.greeting}\n\n`;

  // Add each item
  items.forEach((item, index) => {
    const itemName = getLocalizedText(item.name, locale);
    const itemTotal = item.price * item.quantity;
    
    message += `${index + 1}. ${itemName}\n`;
    message += `   ${t.quantity}: ${item.quantity}\n`;
    message += `   ${t.price}: ${item.price.toLocaleString('ru-RU')} ${t.currency}\n`;
    message += `   SKU: ${item.sku}\n\n`;
  });

  // Add total
  message += `${t.total}: ${totalPrice.toLocaleString('ru-RU')} ${t.currency}\n\n`;
  message += `${t.thanks}\n${t.contact}`;

  return message;
}

/**
 * Creates a WhatsApp URL with the formatted order message
 * @param items - Array of cart items
 * @param locale - Current locale
 * @param whatsappNumber - WhatsApp number (optional, uses env variable if not provided)
 * @returns WhatsApp URL
 */
export function createWhatsAppOrderUrl(
  items: CartItem[],
  locale: string = 'ru',
  whatsappNumber?: string
): string {
  const message = createWhatsAppOrderMessage(items, locale);
  const phoneNumber = whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '77753084648';
  
  // Clean phone number (remove non-digits except +)
  const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;
}

/**
 * Opens WhatsApp with the order message
 * @param items - Array of cart items
 * @param locale - Current locale
 * @param whatsappNumber - WhatsApp number (optional)
 */
export function openWhatsAppOrder(
  items: CartItem[],
  locale: string = 'ru',
  whatsappNumber?: string
): void {
  const url = createWhatsAppOrderUrl(items, locale, whatsappNumber);
  window.open(url, '_blank');
}

/**
 * Validates if WhatsApp number is properly configured
 * @returns boolean
 */
export function isWhatsAppConfigured(): boolean {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return !!phoneNumber && phoneNumber.length > 0;
} 