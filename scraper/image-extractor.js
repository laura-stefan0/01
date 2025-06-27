
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Extract the best image from a webpage
 */
export async function extractImageFromUrl(url, title, category) {
  try {
    console.log(`🖼️ Extracting image from: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const images = [];

    // Look for images in order of preference
    const selectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'img[class*="hero"]',
      'img[class*="featured"]',
      'img[class*="main"]',
      'img[class*="banner"]',
      'article img',
      '.content img',
      '.post img',
      'img[src*="protest"]',
      'img[src*="demonstration"]',
      'img[src*="march"]',
      'img'
    ];

    for (const selector of selectors) {
      if (selector.startsWith('meta')) {
        const content = $(selector).attr('content');
        if (content && isValidImageUrl(content)) {
          images.push({
            url: content,
            priority: 10,
            source: 'meta'
          });
        }
      } else {
        $(selector).each((i, elem) => {
          const src = $(elem).attr('src');
          const alt = $(elem).attr('alt') || '';
          
          if (src && isValidImageUrl(src)) {
            let priority = 1;
            
            // Higher priority for images with relevant alt text
            if (alt.toLowerCase().includes('protest') || 
                alt.toLowerCase().includes('demonstration') || 
                alt.toLowerCase().includes('march')) {
              priority += 5;
            }
            
            // Higher priority for larger images
            const width = parseInt($(elem).attr('width')) || 0;
            const height = parseInt($(elem).attr('height')) || 0;
            if (width > 300 && height > 200) {
              priority += 3;
            }
            
            images.push({
              url: makeAbsoluteUrl(src, url),
              priority,
              source: selector,
              alt
            });
          }
        });
      }
      
      if (images.length > 0) break;
    }

    // Sort by priority and validate
    images.sort((a, b) => b.priority - a.priority);
    
    for (const image of images.slice(0, 5)) {
      const isValid = await validateImageUrl(image.url);
      if (isValid) {
        console.log(`✅ Found valid image: ${image.url}`);
        return image.url;
      }
    }

    console.log(`❌ No valid images found on page: ${url}`);
    return null;

  } catch (error) {
    console.log(`❌ Error extracting image from ${url}:`, error.message);
    return null;
  }
}

/**
 * Check if URL looks like a valid image
 */
function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const lowerUrl = url.toLowerCase();
  
  return imageExtensions.some(ext => lowerUrl.includes(ext)) ||
         lowerUrl.includes('image') ||
         lowerUrl.includes('photo') ||
         url.includes('og:image') ||
         url.includes('twitter:image');
}

/**
 * Convert relative URL to absolute
 */
function makeAbsoluteUrl(src, baseUrl) {
  if (src.startsWith('http')) return src;
  if (src.startsWith('//')) return 'https:' + src;
  
  try {
    const base = new URL(baseUrl);
    return new URL(src, base.origin).href;
  } catch {
    return src;
  }
}

/**
 * Validate if image URL is accessible
 */
async function validateImageUrl(url) {
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const contentType = response.headers['content-type'];
    const contentLength = parseInt(response.headers['content-length']) || 0;
    
    return contentType && 
           contentType.startsWith('image/') && 
           contentLength > 1000; // At least 1KB
  } catch {
    return false;
  }
}
