import { NextRequest, NextResponse } from 'next/server';
import { v0 } from 'v0-sdk';
import Replicate from 'replicate';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let message: string | null = null;
    let chatId: string | null = null;
    let attachments: any[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      message = (formData.get('message') as string) || '';
      chatId = (formData.get('chatId') as string) || null;
      const files = formData.getAll('files') as File[];
      attachments = files.map((file) => ({ file }));
    } else {
      const body = await request.json();
      message = body.message;
      chatId = body.chatId || null;
      attachments = body.attachments || [];
    }

    if (!message && attachments.length === 0) {
      return NextResponse.json(
        { error: 'Message or attachments are required' },
        { status: 400 },
      );
    }

    let catalogueData = null;

    // Add attachment information and generate products if attachments exist
    if (attachments.length > 0) {
      const firstAttachment = attachments[0];
      const input = firstAttachment?.file || firstAttachment;
      const catalogue = await generateProductCatalogueFromImage(message!, input);

      if (catalogue) {
        // Transform catalogue to the desired format and create a readable string for LLM
        catalogueData = `<PRODUCT_CATALOGUE>
${catalogue.products.map((product: any, index: number) =>
          `<PRODUCT id="${index + 1}">
<NAME>${product.name}</NAME>
<DESCRIPTION>${product.description}</DESCRIPTION>
<IMAGE_URL>${product.imageUrl || 'No image available'}</IMAGE_URL>
</PRODUCT>`
        ).join('\n')}
</PRODUCT_CATALOGUE>`;
      }
    }

    const ENHANCED_USER_PROMPT = `You are a Shopify expert. Create a viral pop-up store landing page.

Build a single-page Next.js store with:
- Eye-catching hero section with trend-themed design
- Simple product grid showing 4-6 items with prices
- No need to add things like "Add to favorites" or "Add to cart"
- Quick "Buy Now" buttons for each product
- The "Buy Now" button should open a modal with a checkout form ( the pay function can be mocked )
- Minimal navigation (just logo and NO Shopping cart)
- Mobile-first responsive design
- Trendy colors and bold typography
- No testimonials
- Social sharing buttons
- Images are important, make sure to create all the images you need and don't use placeholder images

Focus on: Simple, fast, impulse-buy experience. No complex menus or pages.

Here is the catalogue of products: ${catalogueData}.

Now, create the store for: ${message}.`;

    let chat;

    const userMessage: string = message ?? '';

    if (chatId) {
      // continue existing chat
      chat = await v0.chats.sendMessage({
        chatId: chatId as string,
        message: userMessage,
        modelConfiguration: {
          modelId: 'v0-gpt-5',
          imageGenerations: false,
          thinking: false,
        },
      });
    } else {
      // create new chat
      chat = await v0.chats.create({
        system: 'You are an expert in creating viral pop-up stores.',
        message: ENHANCED_USER_PROMPT,
        modelConfiguration: {
          modelId: 'v0-gpt-5',
          imageGenerations: false,
          thinking: false,
        },
      });
    }

    return NextResponse.json({
      id: chat.id,
      demo: chat.demo,
      files: chat.files || [],
    });
  } catch (error) {
    console.error('V0 API Error:', error);

    // Provide more specific error information
    let errorMessage = 'Failed to process request';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 },
    );
  }
}


async function generateProductCatalogueFromImage(userInput: string, attachment: any): Promise<any | null> {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY,
  });

  try {
    // Convert file to base64 if it's a File object
    let imageData = attachment;
    if (attachment?.file && typeof attachment.file.arrayBuffer === 'function') {
      const buffer = await attachment.file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      imageData = `data:${attachment.file.type};base64,${base64}`;
    }

    // Extract product information from image using vision model
    const productAnalysis = await replicate.run(
      "salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746",
      {
        input: {
          image: imageData,
          task: "image_captioning",
          question: `Analyze this image and identify any products visible. For each product, provide: name, description, estimated price in AUD, and category. Format as JSON with products array.`
        }
      }
    );

    // Generate product images using Replicate's image generation model
    const products = [];
    
    // Parse the analysis result or use fallback
    let productList = [];
    try {
      if (typeof productAnalysis === 'string' && productAnalysis.includes('{')) {
        const parsed = JSON.parse(productAnalysis);
        productList = parsed.products || [];
      }
    } catch {
      // Fallback to analyzing the user input for product ideas
      productList = [
        { name: 'Featured Product 1', description: 'High-quality item from the collection', category: 'Featured' },
        { name: 'Featured Product 2', description: 'Premium selection for modern lifestyle', category: 'Featured' },
        { name: 'Featured Product 3', description: 'Trendy and stylish product', category: 'Featured' }
      ];
    }

    // Generate images for each product using Replicate
    for (let i = 0; i < Math.min(productList.length, 6); i++) {
      const product = productList[i];
      
      try {
        // Generate product image using SDXL model
        const imageOutput = await replicate.run(
          "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          {
            input: {
              prompt: `Professional product photography of ${product.name || `product ${i + 1}`}: ${product.description || 'modern stylish item'}, white background, studio lighting, high quality, commercial photography, clean minimalist style`
            }
          }
        );

        const imageUrl = Array.isArray(imageOutput) ? imageOutput[0] : imageOutput;

        products.push({
          id: (i + 1).toString(),
          name: product.name || `Product ${i + 1}`,
          price: product.price || `AUD ${(Math.random() * 100 + 20).toFixed(2)}`,
          description: product.description || 'High-quality product with modern design',
          category: product.category || 'Featured',
          imageUrl: imageUrl || '/placeholder-product.jpg'
        });
      } catch (imageError) {
        console.warn(`Failed to generate image for product ${i + 1}:`, imageError);
        
        products.push({
          id: (i + 1).toString(),
          name: product.name || `Product ${i + 1}`,
          price: product.price || `AUD ${(Math.random() * 100 + 20).toFixed(2)}`,
          description: product.description || 'High-quality product with modern design',
          category: product.category || 'Featured',
          imageUrl: '/placeholder-product.jpg'
        });
      }
    }

    return {
      products,
      totalProducts: products.length,
      categories: [...new Set(products.map(p => p.category))]
    };

  } catch (error) {
    console.error('Error generating product catalogue:', error);
    
    // Fallback to mock data with generated images
    const fallbackProducts = [
      { name: 'Premium Sneakers', description: 'High-quality athletic footwear with modern design', category: 'Footwear' },
      { name: 'Vintage Jacket', description: 'Stylish vintage-inspired outerwear', category: 'Clothing' },
      { name: 'Smart Watch', description: 'Advanced fitness tracking and notifications', category: 'Electronics' }
    ];

    const products = [];
    
    for (let i = 0; i < fallbackProducts.length; i++) {
      const product = fallbackProducts[i];
      
      try {
        const imageOutput = await replicate.run(
          "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          {
            input: {
              prompt: `Professional product photography of ${product.name}: ${product.description}, white background, studio lighting, high quality, commercial photography`
            }
          }
        );

        const imageUrl = Array.isArray(imageOutput) ? imageOutput[0] : imageOutput;

        products.push({
          id: (i + 1).toString(),
          name: product.name,
          price: (Math.random() * 100 + 50).toFixed(2),
          description: product.description,
          category: product.category,
          imageUrl: imageUrl
        });
      } catch {
        products.push({
          id: (i + 1).toString(),
          name: product.name,
          price: (Math.random() * 100 + 50).toFixed(2),
          description: product.description,
          category: product.category,
          imageUrl: '/mock-product.jpg'
        });
      }
    }

    return {
      products,
      totalProducts: products.length,
      categories: ['Footwear', 'Clothing', 'Electronics']
    };
  }
}