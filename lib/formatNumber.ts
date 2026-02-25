/**
 * Форматирует число с разделением разрядов пробелами
 * Пример: 1630 -> "1 630", 1000000 -> "1 000 000"
 */
export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';

  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Форматирует число с указанием валюты (₸)
 */
export function formatPrice(value: number | string): string {
  return `${formatNumber(value)} ₸`;
}

/**
 * Форматирует число бонусов
 */
export function formatBonus(value: number | string): string {
  const formatted = formatNumber(value);
  const num = typeof value === 'string' ? parseFloat(value) : value;

  // Правильное склонение слова "бонус"
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${formatted} бонусов`;
  } else if (lastDigit === 1) {
    return `${formatted} бонус`;
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return `${formatted} бонуса`;
  } else {
    return `${formatted} бонусов`;
  }
}
