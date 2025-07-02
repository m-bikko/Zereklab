/**
 * Utility functions for handling age ranges in the application
 */

/**
 * Normalize age range to standard format
 * @param ageRange - Raw age range string from database
 * @returns Normalized age range string
 */
export function normalizeAgeRange(ageRange: string): string {
  if (!ageRange) return '';
  
  // Remove any extra whitespace and convert to lowercase for processing
  const cleaned = ageRange.trim().toLowerCase();
  
  // Handle pure numbers (convert to 13+ if >= 13)
  const numberMatch = cleaned.match(/^(\d+)$/);
  if (numberMatch) {
    const age = parseInt(numberMatch[1]);
    if (age >= 13) return '13+';
    if (age >= 9) return '9-12';
    if (age >= 6) return '6-8';
    return ageRange; // Keep original if below 6
  }
  
  // Handle ranges like "14+" or "20+"
  const plusMatch = cleaned.match(/^(\d+)\+/);
  if (plusMatch) {
    const age = parseInt(plusMatch[1]);
    if (age >= 13) return '13+';
    return ageRange; // Keep original if below 13
  }
  
  // Handle ranges like "6-8", "9-12", etc.
  const rangeMatch = cleaned.match(/^(\d+)-(\d+)/);
  if (rangeMatch) {
    const startAge = parseInt(rangeMatch[1]);
    const endAge = parseInt(rangeMatch[2]);
    
    // Categorize based on the range
    if (startAge >= 13 || endAge >= 13) return '13+';
    if (startAge >= 9 || (endAge >= 9 && endAge <= 12)) return '9-12';
    if (startAge >= 6 || (endAge >= 6 && endAge <= 8)) return '6-8';
  }
  
  // Return original if no pattern matches
  return ageRange;
}

/**
 * Format age range for display
 * @param ageRange - Age range string
 * @returns Formatted display string
 */
export function formatAgeRangeForDisplay(ageRange: string): string {
  if (!ageRange) return '';
  
  const normalized = normalizeAgeRange(ageRange);
  
  switch (normalized) {
    case '6-8':
      return '6-8 лет';
    case '9-12':
      return '9-12 лет';
    case '13+':
      return '13+ лет';
    default:
      // For non-standard formats, try to add "лет" if it's missing
      return ageRange.includes('лет') ? ageRange : `${ageRange} лет`;
  }
}

/**
 * Get all available age range options for filters/forms
 */
export const AGE_RANGE_OPTIONS = [
  { value: '', label: 'Любой возраст' },
  { value: '6-8', label: '6-8 лет' },
  { value: '9-12', label: '9-12 лет' },
  { value: '13+', label: '13+ лет' },
] as const;

/**
 * Check if an age range matches a filter
 * @param productAgeRange - Age range from product
 * @param filterAgeRange - Age range from filter
 * @returns True if the product matches the filter
 */
export function ageRangeMatchesFilter(productAgeRange: string, filterAgeRange: string): boolean {
  if (!filterAgeRange) return true; // No filter means show all
  if (!productAgeRange) return false; // Product has no age range
  
  const normalizedProduct = normalizeAgeRange(productAgeRange);
  const normalizedFilter = normalizeAgeRange(filterAgeRange);
  
  return normalizedProduct === normalizedFilter;
} 