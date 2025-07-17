/**
 * Utility functions for handling minimum age requirements in the application
 */

/**
 * Generate array of age options from 1 to 20 years
 */
export function getAgeOptions(): Array<{ value: string; label: string }> {
  const options = [{ value: '', label: 'Любой возраст' }];

  for (let age = 1; age <= 20; age++) {
    options.push({
      value: `${age}+`,
      label: `${age}+ лет`,
    });
  }

  return options;
}

/**
 * Convert old age range format to new minimum age format
 * @param ageRange - Old format like "6-8 лет" or "13+ лет"
 * @returns New format like "6+" or original if already in new format
 */
export function convertToMinimumAge(ageRange: string): string {
  if (!ageRange) return '';

  // Remove "лет" and extra whitespace
  const cleaned = ageRange.replace(/лет/gi, '').trim();

  // If already in correct format (number+), return as is
  const plusMatch = cleaned.match(/^(\d+)\+$/);
  if (plusMatch) {
    return cleaned;
  }

  // Convert range format "6-8" to minimum age "6+"
  const rangeMatch = cleaned.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    return `${rangeMatch[1]}+`;
  }

  // Convert single number to minimum age format
  const numberMatch = cleaned.match(/^(\d+)$/);
  if (numberMatch) {
    return `${numberMatch[1]}+`;
  }

  // Return original if no pattern matches
  return ageRange;
}

/**
 * Format minimum age for display
 * @param minimumAge - Minimum age string like "3+" or "6+"
 * @returns Formatted display string like "3+ лет"
 */
export function formatAgeForDisplay(minimumAge: string): string {
  if (!minimumAge) return '';

  // Convert old format if needed
  const converted = convertToMinimumAge(minimumAge);

  // If already has "лет", return as is
  if (converted.includes('лет')) {
    return converted;
  }

  // Add "лет" if it's in correct format
  const match = converted.match(/^(\d+)\+$/);
  if (match) {
    return `${converted} лет`;
  }

  // Fallback
  return minimumAge;
}

/**
 * Check if a product is suitable for a child of given age
 * @param productMinAge - Product minimum age like "6+"
 * @param childAge - Child's age as number
 * @returns True if product is suitable for child
 */
export function isProductSuitableForAge(
  productMinAge: string,
  childAge: number
): boolean {
  if (!productMinAge || !childAge) return true;

  // Convert old format if needed
  const converted = convertToMinimumAge(productMinAge);

  // Extract minimum age number
  const match = converted.match(/^(\d+)\+$/);
  if (!match) return true; // If format is unclear, allow it

  const minAge = parseInt(match[1]);
  return childAge >= minAge;
}

/**
 * Filter products based on child's age
 * @param products - Array of products with ageRange property
 * @param childAge - Child's age as number (optional)
 * @returns Filtered products suitable for the child's age
 */
export function filterProductsByAge<T extends { ageRange?: string }>(
  products: T[],
  childAge?: number
): T[] {
  if (!childAge) return products;

  return products.filter(product =>
    isProductSuitableForAge(product.ageRange || '', childAge)
  );
}

/**
 * Parse age from string (handles various formats)
 * @param ageString - Age string like "5", "5+", "5 лет"
 * @returns Age as number or null if invalid
 */
export function parseAge(ageString: string): number | null {
  if (!ageString) return null;

  const cleaned = ageString.replace(/[^\d]/g, '');
  const age = parseInt(cleaned);

  return isNaN(age) ? null : age;
}

/**
 * Validate minimum age format
 * @param ageString - Age string to validate
 * @returns True if valid format (like "3+" or "3+ лет")
 */
export function isValidMinimumAge(ageString: string): boolean {
  if (!ageString) return true; // Empty is valid (no age restriction)

  const cleaned = ageString.replace(/лет/gi, '').trim();
  const match = cleaned.match(/^(\d+)\+$/);

  if (!match) return false;

  const age = parseInt(match[1]);
  return age >= 1 && age <= 20;
}

// =============================================================================
// BACKWARD COMPATIBILITY FUNCTIONS
// =============================================================================

/**
 * @deprecated Use formatAgeForDisplay instead
 * Legacy function for backward compatibility
 */
export function formatAgeRangeForDisplay(ageRange: string): string {
  return formatAgeForDisplay(ageRange);
}

/**
 * @deprecated Use convertToMinimumAge instead
 * Legacy function for backward compatibility
 */
export function normalizeAgeRange(ageRange: string): string {
  return convertToMinimumAge(ageRange);
}

/**
 * @deprecated Use filterProductsByAge and child age selection instead
 * Legacy age range options for backward compatibility
 */
export const AGE_RANGE_OPTIONS = [
  { value: '', label: 'Любой возраст' },
  { value: '3+', label: '3+ лет' },
  { value: '6+', label: '6+ лет' },
  { value: '9+', label: '9+ лет' },
  { value: '13+', label: '13+ лет' },
] as const;

/**
 * @deprecated Use isProductSuitableForAge instead
 * Legacy function for backward compatibility
 */
export function ageRangeMatchesFilter(
  productAgeRange: string,
  filterAgeRange: string
): boolean {
  if (!filterAgeRange) return true;
  if (!productAgeRange) return false;

  const productConverted = convertToMinimumAge(productAgeRange);
  const filterConverted = convertToMinimumAge(filterAgeRange);

  return productConverted === filterConverted;
}
