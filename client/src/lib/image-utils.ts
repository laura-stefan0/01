/**
 * Utility functions for image handling with category-specific fallbacks
 */

// Standard fallback images for each category - high quality Unsplash images
export const categoryFallbackImages = {
  'environment': 'https://images.unsplash.com/photo-1573160813959-c9157b3f8e7c?w=800&h=600&fit=crop&auto=format',
  'lgbtq+': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&auto=format',
  'women\'s rights': 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&auto=format',
  'labor': 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=800&h=600&fit=crop&auto=format',
  'racial & social justice': 'https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=800&h=600&fit=crop&auto=format',
  'civil & human rights': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&auto=format',
  'healthcare & education': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop&auto=format',
  'peace & anti-war': 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&h=600&fit=crop&auto=format',
  'transparency & anti-corruption': 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&h=600&fit=crop&auto=format',
  'other': 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800&h=600&fit=crop&auto=format'
} as const;

export const categoryColors = {
  'environment': 'bg-green-600',
  'lgbtq+': 'bg-rose-500',
  'women\'s rights': 'bg-pink-700',
  'labor': 'bg-amber-600',
  'racial & social justice': 'bg-violet-700',
  'civil & human rights': 'bg-blue-600',
  'healthcare & education': 'bg-cyan-600',
  'peace & anti-war': 'bg-sky-400',
  'transparency & anti-corruption': 'bg-gray-600',
  'other': 'bg-indigo-600'
} as const;

export const mapColors = {
  'environment': '#059669',
  'lgbtq+': '#f43f5e',
  'women\'s rights': '#be185d',
  'labor': '#d97706',
  'racial & social justice': '#7c3aed',
  'civil & human rights': '#2563eb',
  'healthcare & education': '#0891b2',
  'peace & anti-war': '#0ea5e9',
  'transparency & anti-corruption': '#4b5563',
  'other': '#4f46e5'
} as const;

/**
 * Get fallback image for a category
 */
export function getCategoryFallbackImage(category: string): string {
  const normalizedCategory = category.toLowerCase() as keyof typeof categoryFallbackImages;
  return categoryFallbackImages[normalizedCategory] || categoryFallbackImages.other;
}

/**
 * Get category color class
 */
export function getCategoryColor(category: string): string {
  if (!category) return categoryColors.other;
  const normalizedCategory = category.toLowerCase() as keyof typeof categoryColors;
  return categoryColors[normalizedCategory] || categoryColors.other;
}

/**
 * Get map marker color
 */
export function getMapColor(category: string): string {
  const normalizedCategory = category.toLowerCase() as keyof typeof mapColors;
  return mapColors[normalizedCategory] || mapColors.other;
}

/**
 * Get the best image URL with fallback logic
 * Returns original image URL or category fallback
 */
export function getImageUrl(imageUrl: string | null | undefined, category: string): string {
  // If we have a valid image URL, use it directly (CSS backgrounds bypass CORS)
  if (imageUrl && imageUrl.trim() !== '') {
    return imageUrl;
  }
  
  // Only use fallback images if we don't have any image URL
  return getCategoryFallbackImage(category);
}



/**
 * Create image error handler for a specific category
 */
export function createImageErrorHandler(category: string) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const fallbackUrl = getCategoryFallbackImage(category);
    
    // Prevent infinite loops if fallback also fails
    if (target.src !== fallbackUrl) {
      const wasScraped = isScrapedImage(target.src);
      // Only log for debugging if needed - reduce console noise
      if (process.env.NODE_ENV === 'development') {
        console.log(`Image failed, using fallback for ${category}`, { 
          originalSrc: target.src, 
          wasScraped 
        });
      }
      target.src = fallbackUrl;
    }
  };
}