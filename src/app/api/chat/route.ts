import { NextRequest, NextResponse } from 'next/server';
import { v0 } from 'v0-sdk';
import Replicate from 'replicate';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { UTApi } from "uploadthing/server";

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
      console.log('📋 [ChatAPI] Received catalogue:', catalogue);


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
- Simple product grid showing items with prices
- No need to add things like "Add to favorites" or "Add to cart"
- Quick "Buy Now" buttons for each product
- The "Buy Now" button should open a modal with a checkout form ( the pay function can be mocked )
- Minimal navigation (just logo and NO Shopping cart)
- Mobile-first responsive design
- Trendy colors and bold typography
- No testimonials
- Social sharing buttons

Focus on: Simple, fast, impulse-buy experience. No complex menus or pages.

Here is the catalogue of products: ${catalogueData}.

Only use images that are provided in the catalogue.

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
  try {
    console.log('Starting product catalogue generation');
    console.log('User input:', userInput);
    console.log('Attachment:', attachment ? 'present' : 'not present');

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_KEY,
    });

    let imageUrl = null;
    // The attachment could be either { file: File } or File directly
    const file = attachment?.file || attachment;

    if (file && typeof file.arrayBuffer === 'function') {
      console.log('Uploading file to UploadThing...');
      const utapi = new UTApi();
      const response = await utapi.uploadFiles([file]);
      if (response[0].data) {
        imageUrl = response[0].data.url;
        console.log('File uploaded successfully:', imageUrl);
      }
    } else {
      console.log('Attachment is not a file:', attachment);
      return null;
    }

    const productSchema = z.object({
      products: z.array(z.object({
        name: z.string().describe('Product name'),
        description: z.string().describe('Product description'),
        estimatedPrice: z.string().describe('Estimated price in AUD format like "AUD 29.99"'),
        imagePrompt: z.string().describe('Detailed prompt for generating product image')
      }))
    });

    const prompt = imageUrl
      ? `Based on this user request: "${userInput}" and the provided image, create a product catalog for merchandise/products that incorporate or feature the uploaded image. The user will specify how many products they want in their request (if they don't specify a number, create exactly 1 product). Generate creative products regardless how absurd they are, etc. that can showcase the uploaded image. For the imagePrompt field, describe how to transform or incorporate the uploaded image into each product (e.g., "Transform this into a cartoon style mug design", "Make this image into a vintage t-shirt print", "Create a minimalist poster version of this image").`
      : `Based on this user request: "${userInput}", create a product catalog. The user will specify how many products they want in their request (if they don't specify a number, create exactly 1 product). Generate creative product ideas that match their vision. Focus on products that can be personalized or customized.`;

    console.log('Generating product catalog with AI... with prompt:', prompt);
    let catalogResult;
    catalogResult = await generateObject({
      model: openai('gpt-4.1'),
      schema: productSchema,
      prompt: prompt
    });

    console.log('Product catalog generated:', catalogResult.object.products.length, 'products');

    const products = [];

    for (const product of catalogResult.object.products) {
      console.log('Generating image for product:', product.name);
      let imageOutput;

      console.log('Image url:', imageUrl);

      imageOutput = await replicate.run(
        "black-forest-labs/flux-kontext-pro",
        {
          input: {
            prompt: `${product.imagePrompt}, professional product photography, white background, studio lighting, high quality, commercial photography, clean minimalist style`,
            input_image: imageUrl,
            aspect_ratio: "1:1",
            output_format: "jpg",
            safety_tolerance: 2,
            prompt_upsampling: false
          }
        }
      );


      console.log('Image generation completed for:', product.name);
      let productImageUrl = null;
      if (imageOutput && typeof (imageOutput as any).url === 'function') {
        productImageUrl = (imageOutput as any).url();
      } else if (Array.isArray(imageOutput) && imageOutput.length > 0) {
        productImageUrl = imageOutput[0];
      } else if (typeof imageOutput === 'string') {
        productImageUrl = imageOutput;
      } else if (imageOutput && typeof imageOutput === 'object') {
        productImageUrl = (imageOutput as any).url || (imageOutput as any).data;
      }

      console.log('Image URL for', product.name, ':', productImageUrl);

      products.push({
        id: products.length + 1,
        name: product.name,
        price: product.estimatedPrice,
        description: product.description,
        imageUrl: productImageUrl.href
      });
    }

    console.log('Product catalogue generation completed successfully');
    console.log('Total products created:', products.length);

    return {
      products,
      totalProducts: products.length,
      categories: ['Custom']
    };

  } catch (error) {
    console.error('Error generating product catalogue:', error);
    return null;
  }
}