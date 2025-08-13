interface ProductSuggestion {
  name: string;
  category: string;
  description: string;
  price: string;
  features: string[];
  keywords: string[];
}

interface StoreTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  sampleProducts: ProductSuggestion[];
  colorScheme: string;
  targetAudience: string;
}

export const STORE_TEMPLATES: StoreTemplate[] = [
  {
    id: 'fashion-boutique',
    name: 'Fashion Boutique',
    category: 'Fashion & Clothing',
    description: 'Curated fashion for style-conscious shoppers',
    features: ['Size guides', 'Wishlist', 'Style recommendations', 'Seasonal collections'],
    sampleProducts: [
      {
        name: 'Minimalist Cashmere Sweater',
        category: 'clothing',
        description: 'Luxuriously soft cashmere sweater in neutral tones, perfect for layering',
        price: '$189',
        features: ['100% cashmere', 'Machine washable', 'Available in 6 colors'],
        keywords: ['cashmere', 'sweater', 'luxury', 'minimalist']
      },
      {
        name: 'High-Waisted Denim Jeans',
        category: 'clothing', 
        description: 'Classic high-waisted jeans with a flattering fit and sustainable fabric',
        price: '$89',
        features: ['Organic cotton', 'High-waisted', 'Stretchy comfort'],
        keywords: ['jeans', 'denim', 'sustainable', 'high-waisted']
      }
    ],
    colorScheme: 'neutral tones with black accents',
    targetAudience: 'fashion-forward millennials and Gen Z'
  },
  {
    id: 'gourmet-food',
    name: 'Gourmet Food Marketplace', 
    category: 'Food & Beverages',
    description: 'Artisan foods and culinary experiences',
    features: ['Recipe suggestions', 'Subscription boxes', 'Cooking tips', 'Chef recommendations'],
    sampleProducts: [
      {
        name: 'Single-Origin Coffee Beans',
        category: 'coffee',
        description: 'Hand-roasted coffee beans from Ethiopian highlands, notes of chocolate and citrus',
        price: '$24',
        features: ['Single-origin', 'Small batch roasted', 'Tasting notes included'],
        keywords: ['coffee', 'ethiopia', 'single-origin', 'artisan']
      },
      {
        name: 'Truffle Honey Selection',
        category: 'food',
        description: 'Gourmet honey infused with real truffle pieces, perfect for cheese boards',
        price: '$45',
        features: ['Real truffle pieces', 'Locally sourced honey', 'Gift packaging'],
        keywords: ['truffle', 'honey', 'gourmet', 'artisan']
      }
    ],
    colorScheme: 'warm earth tones with gold accents',
    targetAudience: 'food enthusiasts and home chefs'
  },
  {
    id: 'tech-gadgets',
    name: 'Tech Innovation Hub',
    category: 'Technology & Electronics',
    description: 'Latest gadgets and smart home solutions',
    features: ['Product comparisons', 'Tech reviews', 'Warranty tracking', 'Expert recommendations'],
    sampleProducts: [
      {
        name: 'Wireless Charging Stand',
        category: 'electronics',
        description: 'Fast wireless charging stand with adjustable angle and LED status indicator',
        price: '$49',
        features: ['15W fast charging', 'Adjustable angle', 'Case compatible'],
        keywords: ['wireless', 'charging', 'fast', 'adjustable']
      },
      {
        name: 'Smart Home Security Camera',
        category: 'tech',
        description: '4K security camera with night vision and AI motion detection',
        price: '$199',
        features: ['4K resolution', 'Night vision', 'AI detection', 'Cloud storage'],
        keywords: ['security', 'camera', '4k', 'smart home']
      }
    ],
    colorScheme: 'modern blues and grays with tech accents',
    targetAudience: 'tech enthusiasts and early adopters'
  },
  {
    id: 'plant-nursery',
    name: 'Urban Plant Nursery',
    category: 'Home & Garden',
    description: 'Indoor plants and gardening essentials',
    features: ['Plant care guides', 'Plant finder quiz', 'Delivery zones', 'Care reminders'],
    sampleProducts: [
      {
        name: 'Monstera Deliciosa',
        category: 'plants',
        description: 'Popular houseplant with distinctive split leaves, perfect for bright indirect light',
        price: '$45',
        features: ['Easy care', 'Air purifying', 'Includes care guide'],
        keywords: ['monstera', 'houseplant', 'indoor', 'tropical']
      },
      {
        name: 'Plant Care Starter Kit',
        category: 'home',
        description: 'Everything needed for plant care: watering can, fertilizer, and soil meter',
        price: '$29',
        features: ['3-piece kit', 'Beginner friendly', 'Includes instructions'],
        keywords: ['plant care', 'starter kit', 'watering', 'fertilizer']
      }
    ],
    colorScheme: 'natural greens with earth tones',
    targetAudience: 'urban dwellers and plant parents'
  }
];

export function getStoreTemplate(templateId: string): StoreTemplate | undefined {
  return STORE_TEMPLATES.find(template => template.id === templateId);
}

export function generateProductDescription(productName: string, category: string, features?: string[]): string {
  const templates = {
    clothing: 'Discover our {name} - a perfect blend of style and comfort. {features} Made with attention to detail and quality materials.',
    electronics: 'The {name} combines cutting-edge technology with user-friendly design. {features} Built for performance and reliability.',
    food: 'Indulge in our {name} - carefully crafted for the finest taste experience. {features} Perfect for food lovers who appreciate quality.',
    home: 'Transform your space with our {name}. {features} Designed to enhance your daily life with style and functionality.',
    beauty: 'Elevate your beauty routine with our {name}. {features} Formulated with premium ingredients for exceptional results.',
    books: 'Dive into our {name} - a captivating addition to any library. {features} Perfect for readers who love quality literature.',
    jewelry: 'Adorn yourself with our stunning {name}. {features} Each piece is crafted with precision and attention to detail.',
    plants: 'Bring nature indoors with our {name}. {features} Perfect for creating a green, vibrant living space.',
  };

  const template = templates[category as keyof typeof templates] || templates.home;
  const featureText = features ? features.join(', ') + '.' : 'High quality and great value.';
  
  return template
    .replace('{name}', productName)
    .replace('{features}', featureText);
}

export function generateStorePromptEnhancement(userMessage: string): string {
  // Extract keywords from user message to suggest relevant template
  const message = userMessage.toLowerCase();
  
  let suggestedTemplate: StoreTemplate | undefined;
  
  if (message.includes('fashion') || message.includes('clothing') || message.includes('boutique')) {
    suggestedTemplate = getStoreTemplate('fashion-boutique');
  } else if (message.includes('food') || message.includes('gourmet') || message.includes('restaurant') || message.includes('coffee')) {
    suggestedTemplate = getStoreTemplate('gourmet-food');
  } else if (message.includes('tech') || message.includes('gadget') || message.includes('electronic') || message.includes('smart')) {
    suggestedTemplate = getStoreTemplate('tech-gadgets');
  } else if (message.includes('plant') || message.includes('garden') || message.includes('nursery')) {
    suggestedTemplate = getStoreTemplate('plant-nursery');
  }

  if (suggestedTemplate) {
    const sampleProductsText = suggestedTemplate.sampleProducts
      .map(p => `- ${p.name}: ${p.description} (${p.price})`)
      .join('\n');

    return `
SUGGESTED STORE TEMPLATE: ${suggestedTemplate.name}
Target Audience: ${suggestedTemplate.targetAudience}
Color Scheme: ${suggestedTemplate.colorScheme}
Key Features: ${suggestedTemplate.features.join(', ')}

SAMPLE PRODUCTS:
${sampleProductsText}

Use this template as inspiration but customize it based on the user's specific request: "${userMessage}"`;
  }

  return '';
}

export interface ImageGenerationRequest {
  products: Array<{
    name: string;
    category: string;
    description?: string;
  }>;
  storeStyle?: string;
}

export async function generateProductImages(request: ImageGenerationRequest): Promise<any> {
  try {
    const response = await fetch('/api/generate-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to generate images');
    }

    return await response.json();
  } catch (error) {
    console.error('Image generation failed:', error);
    return { images: [], status: 'error' };
  }
}