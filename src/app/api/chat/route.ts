import { NextRequest, NextResponse } from 'next/server';
import { v0 } from 'v0-sdk';

const STORE_SYSTEM_PROMPT = `Create a viral pop-up store landing page.

Build a single-page Next.js store with:
- Eye-catching hero section with trend-themed design
- Simple product grid showing 4-6 items with prices
- No need to add things like "Add to favorites" or "Add to cart"
- Quick "Buy Now" buttons for each product
- The "Buy Now" button should open and link to a checkout page
- Minimal navigation (just logo and cart)
- Mobile-first responsive design
- Trendy colors and bold typography
- Social sharing buttons

Focus on: Simple, fast, impulse-buy experience. No complex menus or pages.`;


export async function POST(request: NextRequest) {
  try {
    const { message, chatId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 },
      );
    }

    const enhancedMessage = `${STORE_SYSTEM_PROMPT}

Create a ${message}. Use Tailwind CSS and modern React components.`;

    let chat;

    if (chatId) {
      // continue existing chat
      chat = await v0.chats.sendMessage({
        chatId: chatId,
        message: enhancedMessage,
      });
    } else {
      // create new chat
      chat = await v0.chats.create({
        message: enhancedMessage,
        modelConfiguration: {
        modelId: 'v0-1.5-sm',
        imageGenerations: true,
        thinking: false,
      },
      });
    }

    return NextResponse.json({
      id: chat.id,
      demo: chat.demo,
    });
  } catch (error) {
    console.error('V0 API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
}