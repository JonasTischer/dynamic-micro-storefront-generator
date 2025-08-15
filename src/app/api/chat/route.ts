import { NextRequest, NextResponse } from 'next/server';
import { v0 } from 'v0-sdk';
import Replicate from 'replicate';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

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
      console.log('📎 [ChatAPI] Processing', attachments.length, 'attachments');
      const firstAttachment = attachments[0];
      const input = firstAttachment?.file || firstAttachment;
      console.log('🔄 [ChatAPI] Calling generateProductCatalogueFromImage...');
      
      const catalogue = await generateProductCatalogueFromImage(message!, input);
      console.log('📋 [ChatAPI] Received catalogue:', catalogue ? 'SUCCESS' : 'NULL');





      if (catalogue && catalogue.products && catalogue.products.length > 0) {
        console.log('✅ [ChatAPI] Transforming catalogue with', catalogue.products.length, 'products');
        
        // Transform catalogue to the desired format and create a readable string for LLM
        catalogueData = `<PRODUCT_CATALOGUE>
${catalogue.products.map((product: any, index: number) =>
          `<PRODUCT id="${index + 1}">
<NAME>${product.name}</NAME>
<DESCRIPTION>${product.description}</DESCRIPTION>
<IMAGE_URL>${product.imageUrl || 'No image available'}</IMAGE_URL>
<PRICE>${product.price || 'Contact for pricing'}</PRICE>
<CATEGORY>${product.category || 'General'}</CATEGORY>
</PRODUCT>`
        ).join('\n')}
</PRODUCT_CATALOGUE>`;
        
        console.log('📄 [ChatAPI] Catalogue data prepared for LLM (', catalogueData.length, 'chars)');
      } else {
        console.warn('⚠️ [ChatAPI] No valid catalogue received - proceeding without product data');
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
  console.log('🏪 [ProductCatalogue] Starting product catalogue generation');
  console.log('📝 [ProductCatalogue] User input:', userInput);
  console.log('📎 [ProductCatalogue] Attachment type:', typeof attachment, attachment?.constructor?.name);

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY,
  });

  try {
    // Convert file to base64 if it's a File object
    let imageData = null;
    if (attachment?.file && typeof attachment.file.arrayBuffer === 'function') {
      console.log('🖼️ [ProductCatalogue] Converting file to base64, type:', attachment.file.type);
      const buffer = await attachment.file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      imageData = `data:${attachment.file.type};base64,${base64}`;
      console.log('✅ [ProductCatalogue] File converted to base64, size:', base64.length, 'chars');
    }

    // Use GPT-5 to generate product catalog based on user prompt and image
    console.log('🤖 [ProductCatalogue] Using GPT-5 to generate product catalog...');
    
    const productSchema = z.object({
      products: z.array(z.object({
        name: z.string().describe('Product name'),
        description: z.string().describe('Product description'),
        estimatedPrice: z.string().describe('Estimated price in AUD format like "AUD 29.99"'),
        imagePrompt: z.string().describe('Detailed prompt for generating product image')
      }))
    });

    const prompt = imageData 
      ? `Based on this user request: "${userInput}" and the provided image, create a product catalog. The user will specify how many products they want in their request (if they don't specify a number, create exactly 1 product). Generate creative product ideas that match their vision. Focus on products that can be personalized or customized.`
      : `Based on this user request: "${userInput}", create a product catalog. The user will specify how many products they want in their request (if they don't specify a number, create exactly 1 product). Generate creative product ideas that match their vision. Focus on products that can be personalized or customized.`;

    let catalogResult;
    if (imageData) {
      catalogResult = await generateObject({
        model: openai('gpt-5'),
        schema: productSchema,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt }
            ]
          }
        ]
      });
    } else {
      catalogResult = await generateObject({
        model: openai('gpt-5'),
        schema: productSchema,
        prompt
      });
    }

    console.log('✅ [ProductCatalogue] GPT-5 generated', catalogResult.object.products.length, 'products');

    const products = [];
    
    console.log('🛍️ [ProductCatalogue] Processing', catalogResult.object.products.length, 'products for image generation');

    // Generate images for each product using Replicate with FLUX-kontext-pro
    for (let i = 0; i < catalogResult.object.products.length; i++) {
      const product = catalogResult.object.products[i];
      console.log(`🎨 [ProductCatalogue] Generating image ${i + 1}/${catalogResult.object.products.length} for:`, product.name);
      
      try {
        // Generate product image using FLUX-kontext-pro model
        const imageOutput = await replicate.run(
          "fofr/flux-kontext-pro",
          {
            input: {
              prompt: `${product.imagePrompt}, professional product photography, white background, studio lighting, high quality, commercial photography, clean minimalist style`,
              num_outputs: 1,
              aspect_ratio: "1:1",
              output_format: "webp",
              output_quality: 90
            }
          }
        );

        // Extract URL from the response
        let imageUrl = '/placeholder-product.jpg';
        if (Array.isArray(imageOutput) && imageOutput.length > 0) {
          imageUrl = imageOutput[0];
        } else if (typeof imageOutput === 'string') {
          imageUrl = imageOutput;
        } else if (imageOutput && typeof imageOutput === 'object') {
          imageUrl = (imageOutput as any).url || (imageOutput as any).data || '/placeholder-product.jpg';
        }
        
        console.log(`✅ [ProductCatalogue] Image generated successfully for ${product.name}:`, typeof imageUrl, imageUrl?.substring?.(0, 100));

        products.push({
          id: (i + 1).toString(),
          name: product.name,
          price: product.estimatedPrice,
          description: product.description,
          imageUrl: imageUrl
        });
      } catch (imageError) {
        console.error(`❌ [ProductCatalogue] Failed to generate image for product ${i + 1}:`, imageError);
        
        products.push({
          id: (i + 1).toString(),
          name: product.name,
          price: product.estimatedPrice,
          description: product.description,
          imageUrl: '/placeholder-product.jpg'
        });
      }
    }

    const catalogue = {
      products,
      totalProducts: products.length,
      categories: ['Custom'] // Single category since we're removing categories
    };

    console.log('🎉 [ProductCatalogue] Successfully generated product catalogue:');
    console.log('📦 [ProductCatalogue] Total products:', catalogue.totalProducts);
    console.log('📋 [ProductCatalogue] Product names:', products.map(p => p.name));

    return catalogue;

  } catch (error) {
    console.error('💥 [ProductCatalogue] Error generating product catalogue:', error);
    
    // Fallback to mock data with generated images (default to 1 product)
    console.log('🔄 [ProductCatalogue] Using fallback data with image generation...');
    const fallbackProducts = [
      { name: 'Custom Product', description: 'Personalized item based on your request', estimatedPrice: 'AUD 49.99' }
    ];

    const products = [];
    
    for (let i = 0; i < fallbackProducts.length; i++) {
      const product = fallbackProducts[i];
      console.log(`🎨 [ProductCatalogue] [Fallback] Generating image for ${product.name}...`);
      
      try {
        const imageOutput = await replicate.run(
          "fofr/flux-kontext-pro",
          {
            input: {
              prompt: `Professional product photography of ${product.name}: ${product.description}, white background, studio lighting, high quality, commercial photography`,
              num_outputs: 1,
              aspect_ratio: "1:1",
              output_format: "webp",
              output_quality: 90
            }
          }
        );

        // Extract URL from the response
        let imageUrl = '/mock-product.jpg';
        if (Array.isArray(imageOutput) && imageOutput.length > 0) {
          imageUrl = imageOutput[0];
        } else if (typeof imageOutput === 'string') {
          imageUrl = imageOutput;
        } else if (imageOutput && typeof imageOutput === 'object') {
          imageUrl = (imageOutput as any).url || (imageOutput as any).data || '/mock-product.jpg';
        }
        
        console.log(`✅ [ProductCatalogue] [Fallback] Image generated for ${product.name}:`, typeof imageUrl, imageUrl?.substring?.(0, 100));

        products.push({
          id: (i + 1).toString(),
          name: product.name,
          price: product.estimatedPrice,
          description: product.description,
          imageUrl: imageUrl
        });
      } catch (fallbackError) {
        console.error(`❌ [ProductCatalogue] [Fallback] Failed to generate image for ${product.name}:`, fallbackError);
        
        products.push({
          id: (i + 1).toString(),
          name: product.name,
          price: product.estimatedPrice,
          description: product.description,
          imageUrl: '/mock-product.jpg'
        });
      }
    }

    const fallbackCatalogue = {
      products,
      totalProducts: products.length,
      categories: ['Custom']
    };

    console.log('🆘 [ProductCatalogue] Fallback catalogue generated:');
    console.log('📦 [ProductCatalogue] Total products:', fallbackCatalogue.totalProducts);

    return fallbackCatalogue;
  }
}