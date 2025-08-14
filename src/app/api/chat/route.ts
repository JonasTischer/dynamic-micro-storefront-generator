import { NextRequest, NextResponse } from 'next/server';
import { v0 } from 'v0-sdk';

export async function POST(request: NextRequest) {
  try {
    const { message, chatId, attachments = [] } = await request.json();

    if (!message && attachments.length === 0) {
      return NextResponse.json(
        { error: 'Message or attachments are required' },
        { status: 400 },
      );
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

Now, create the store for: ${message}.`;

    let userMessage = `

    Create a store for the following message: ${message}.`;

    // Add attachment information to the message if attachments exist
    if (attachments.length > 0) {
      const attachmentInfo = attachments.map((att: any) => `- ${att.name} (${att.contentType}): ${att.url}`).join('\n');
      userMessage += `\n\nAttached images for inspiration:\n${attachmentInfo}\n\nPlease use these images as inspiration for the store design and product selection.`;
    }

    let chat;

    if (chatId) {
      // continue existing chat
      chat = await v0.chats.sendMessage({
        chatId: chatId,
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