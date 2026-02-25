// Phone number formatting utility
export function formatPhoneNumber(input: string): string {
  // Remove all non-digit characters
  const digits = input.replace(/\D/g, '');

  // Handle different input formats
  let cleanDigits = digits;

  // If starts with 8, replace with 7
  if (cleanDigits.startsWith('8') && cleanDigits.length === 11) {
    cleanDigits = '7' + cleanDigits.slice(1);
  }

  // If starts with 7 and has 11 digits, use as is
  if (cleanDigits.startsWith('7') && cleanDigits.length === 11) {
    const formatted = `+7 (${cleanDigits.slice(1, 4)}) ${cleanDigits.slice(4, 7)}-${cleanDigits.slice(7, 9)}-${cleanDigits.slice(9, 11)}`;
    return formatted;
  }

  // If has 10 digits, assume it's without country code
  if (cleanDigits.length === 10) {
    const formatted = `+7 (${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6, 8)}-${cleanDigits.slice(8, 10)}`;
    return formatted;
  }

  // Return original input if can't format
  return input;
}

export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
  return phoneRegex.test(phone);
}

/**
 * Извлекает только цифры из номера телефона для поиска
 * Пример: "+7 (777) 123-45-67" -> "77771234567"
 */
export function extractPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Проверяет совпадение телефонов по цифрам, игнорируя форматирование
 */
export function phonesMatch(phone1: string, phone2: string): boolean {
  return extractPhoneDigits(phone1) === extractPhoneDigits(phone2);
}

export function cleanPhoneInput(input: string): string {
  // Keep only digits and format progressively
  const digits = input.replace(/\D/g, '');

  if (digits.length === 0) return '';
  if (digits.length <= 1) return `+7 (${digits}`;
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7)
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9)
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  if (digits.length <= 11)
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;

  // Limit to 11 digits
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}
