import { NextRequest, NextResponse } from 'next/server';
import { v0 } from 'v0-sdk';

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
      const catalogue = await generateProductCatalogueFromImage(input);

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
- No social sharing buttons or testimonials
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


async function generateProductCatalogueFromImage(_attachment: any): Promise<any | null> {
  // Mock data for now
  return {
    products: [
      {
        id: '1',
        name: 'Premium Sneakers',
        price: 129.99,
        description: 'High-quality athletic footwear with modern design',
        category: 'Footwear',
        imageUrl: '/mock-sneaker.jpg'
      },
      {
        id: '2',
        name: 'Vintage Jacket',
        price: 89.99,
        description: 'Stylish vintage-inspired outerwear',
        category: 'Clothing',
        imageUrl: '/mock-jacket.jpg'
      },
      {
        id: '3',
        name: 'Smart Watch',
        price: 199.99,
        description: 'Advanced fitness tracking and notifications',
        category: 'Electronics',
        imageUrl: '/mock-watch.jpg'
      }
    ],
    totalProducts: 3,
    categories: ['Footwear', 'Clothing', 'Electronics']
  };
}