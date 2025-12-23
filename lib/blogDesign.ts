export type BlogDesign = 'default' | 'magazine';

export function getBlogDesign(): BlogDesign {
  const design = process.env.NEXT_PUBLIC_BLOG_DESIGN;
  if (design === 'magazine') {
    return 'magazine';
  }
  return 'default';
}
