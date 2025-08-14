import { NextRequest, NextResponse } from 'next/server';
import { v0 } from 'v0-sdk';

export async function POST(req: NextRequest) {
  try {
    const { chatId, filePath, prompt, size = '1024x1024', format = 'png' } = await req.json();

    if (!chatId || !filePath || !prompt) {
      return NextResponse.json(
        { error: 'chatId, filePath, and prompt are required' },
        { status: 400 },
      );
    }

    const message = [
      'Regenerate ONE image asset only.',
      `Target path: ${filePath}`,
      `Image requirements: ${size}, format: ${format}`,
      'Keep the same file name and path.',
      'Do not modify or delete any other files.',
      `Prompt: ${prompt}`,
    ].join('\n');

    const chat = await v0.chats.sendMessage({
      chatId,
      message,
      modelConfiguration: {
        modelId: 'v0-gpt-5',
        imageGenerations: true,
        thinking: false,
      },
    });

    return NextResponse.json({
      id: chat.id,
      demo: chat.demo,
      files: chat.files || [],
    });
  } catch (error) {
    console.error('Regenerate image error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate image' },
      { status: 500 },
    );
  }
}


