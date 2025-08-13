'use client';

import { useState } from 'react';

import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation';
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
} from '@/components/ai-elements/web-preview';
import { Loader } from '@/components/ai-elements/loader';
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion';
import { Maximize2, RotateCcw, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"


interface Chat {
  id: string;
  demo: string;
}


export default function Home() {
  const [message, setMessage] = useState('');
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{
      type: 'user' | 'assistant';
      content: string;
    }>
  >([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    setChatHistory((prev) => [...prev, { type: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          chatId: currentChat?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const chat: Chat = await response.json();
      setCurrentChat(chat);

      setChatHistory((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: '🎉 Your store is ready! Take a look at the preview panel to see your new storefront in action.',
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setChatHistory((prev) => [
        ...prev,
        {
          type: 'assistant',
          content:
            '😔 Oops! There was an issue creating your store. Please try again with a different description.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isFullscreen && currentChat?.demo) {
    return (
      <div className="h-screen w-screen fixed inset-0 z-50 bg-white">
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex-1 mx-4">
            <div className="bg-gray-100 rounded px-3 py-1 text-sm text-gray-600">
              {currentChat.demo}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        <iframe
          src={currentChat.demo}
          className="w-full h-[calc(100vh-60px)]"
          frameBorder="0"
        />
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Chat Panel */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="flex flex-col h-full border-r">
        {/* Header */}
        <div className="border-b p-4 h-16 flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-bold text-sm">🏪</span>
            </div>
            <h1 className="text-xl font-bold text-white">StoreCraft AI</h1>
          </div>
          <div className="text-xs text-purple-100">Dynamic Store Generator</div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatHistory.length === 0 ? (
            <div className="text-center mt-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-6">
                <span className="text-3xl">🛒</span>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                Build Your Perfect Store
              </h2>
              <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed mb-8">
                From concept to launch in minutes. AI-powered e-commerce that grows with your vision.
              </p>

              {/* Store Categories */}
              <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
                <div className="text-center p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
                     onClick={() => setMessage('Create a trendy fashion boutique with Instagram-worthy design')}>
                  <div className="text-2xl mb-2">👗</div>
                  <div className="text-sm font-medium text-purple-700">Fashion</div>
                  <div className="text-xs text-purple-600">Clothing & Accessories</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                     onClick={() => setMessage('Build a cutting-edge tech store with product comparisons')}>
                  <div className="text-2xl mb-2">📱</div>
                  <div className="text-sm font-medium text-blue-700">Tech</div>
                  <div className="text-xs text-blue-600">Gadgets & Electronics</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
                     onClick={() => setMessage('Design a gourmet food marketplace with artisan products')}>
                  <div className="text-2xl mb-2">🍯</div>
                  <div className="text-sm font-medium text-green-700">Food</div>
                  <div className="text-xs text-green-600">Gourmet & Artisan</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                     onClick={() => setMessage('Create an urban plant nursery with care guides')}>
                  <div className="text-2xl mb-2">🌱</div>
                  <div className="text-sm font-medium text-emerald-700">Plants</div>
                  <div className="text-xs text-emerald-600">Home & Garden</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Conversation>
                <ConversationContent>
                  {chatHistory.map((msg, index) => (
                    <Message from={msg.type} key={index}>
                      <MessageContent>{msg.content}</MessageContent>
                    </Message>
                  ))}
                </ConversationContent>
              </Conversation>
              {isLoading && (
                <Message from="assistant">
                  <MessageContent>
                    <div className="flex items-center gap-2">
                      <Loader />
                      <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-medium">
                        Crafting your store experience...
                      </span>
                    </div>
                  </MessageContent>
                </Message>
              )}
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          {!currentChat && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">✨ Popular Store Ideas</h3>
              <Suggestions>
                <Suggestion
                  onClick={() =>
                    setMessage('Create a minimalist boutique clothing store with product filters, wishlist, and size guide')
                  }
                  suggestion="🧥 Fashion Boutique - Minimalist clothing store with filters and size guide"
                />
                <Suggestion
                  onClick={() => setMessage('Build a gourmet food marketplace with recipe suggestions and subscription boxes')}
                  suggestion="🍯 Gourmet Food - Artisan marketplace with recipes and subscriptions"
                />
                <Suggestion
                  onClick={() =>
                    setMessage('Design a tech gadget store with comparison tools, reviews, and warranty tracking')
                  }
                  suggestion="📱 Tech Store - Gadgets with comparison tools and reviews"
                />
                <Suggestion
                  onClick={() =>
                    setMessage('Create a plant nursery with care guides, plant finder quiz, and delivery zones')
                  }
                  suggestion="🌱 Plant Nursery - Care guides, plant quiz, and delivery zones"
                />
                <Suggestion
                  onClick={() =>
                    setMessage('Build a handmade jewelry store with custom sizing, engraving, and gift wrapping')
                  }
                  suggestion="💍 Jewelry Store - Custom sizing, engraving, and gift options"
                />
                <Suggestion
                  onClick={() =>
                    setMessage('Design a vintage book store with condition ratings, author search, and reading recommendations')
                  }
                  suggestion="📚 Book Store - Vintage books with ratings and recommendations"
                />
              </Suggestions>
            </div>
          )}
          <div className="flex gap-2">
            <PromptInput
              onSubmit={handleSendMessage}
              className="mt-4 w-full max-w-2xl mx-auto relative"
            >
              <PromptInputTextarea
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                placeholder="Describe your dream store... (e.g., 'A cozy coffee shop with loyalty program and barista recommendations')"
                className="pr-12 min-h-[60px]"
              />
              <PromptInputSubmit
                className="absolute bottom-1 right-1"
                disabled={!message}
                status={isLoading ? 'streaming' : 'ready'}
              />
            </PromptInput>
          </div>
        </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Preview Panel */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="flex flex-col h-full">
        <WebPreview>
          <WebPreviewNavigation>
            <WebPreviewUrl
              readOnly
              placeholder="Your store preview will appear here..."
              value={currentChat?.demo}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </WebPreviewNavigation>
          <WebPreviewBody src={currentChat?.demo} />
        </WebPreview>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}