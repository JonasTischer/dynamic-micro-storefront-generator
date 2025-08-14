'use client';

import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { Header } from '@/components/Header';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { DeployModal } from '@/components/DeployModal';
import { ChatInput } from '@/components/ChatInput';
import { ChatMessages } from '@/components/ChatMessages';
import { PreviewPanel } from '@/components/PreviewPanel';
import { SuggestedPrompts } from '@/components/SuggestedPrompts';
import { DeploySection } from '@/components/DeploySection';

interface Attachment {
  url: string;
  name: string;
  contentType: string;
}

interface ChatFile {
  path?: string;
  content?: string;
  source?: string;
  meta?: {
    file?: string;
    url?: string;
  };
  lang?: string;
}

interface Chat {
  id: string;
  demo: string;
  files?: ChatFile[];
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
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [deployConfig, setDeployConfig] = useState({
    stripePublishableKey: '',
    stripeSecretKey: '',
    customDomain: '',
    storeName: ''
  });

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!message.trim() && attachments.length === 0) || isLoading) return;

    const userMessage = message.trim() || 'Generated with attached images';
    setMessage('');
    setIsLoading(true);

    setChatHistory((prev) => [...prev, { type: 'user', content: userMessage }]);

    try {
      const requestBody = {
        message: userMessage,
        chatId: currentChat?.id,
        attachments: attachments
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const chat: Chat = await response.json();
      setCurrentChat(chat);

      console.log('Full chat response:', chat);
      if (chat.files && chat.files.length > 0) {
        console.log('Generated files found:', chat.files);
        const firstValidFile = chat.files.find(f => f?.path || f?.meta?.file);
        if (firstValidFile) {
          const filePath = firstValidFile.path || firstValidFile.meta?.file;
          if (filePath) {
            setSelectedFile(filePath);
          }
        }
      }

      setChatHistory((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: '💥 Your viral pop-up store is live! Check the preview to see your trend-capturing storefront ready for customers.',
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setChatHistory((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: '💔 Trend generation failed! The moment might have passed. Try a different viral topic or trend.',
        },
      ]);
    } finally {
      setIsLoading(false);
      setAttachments([]);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDeploy = async () => {
    if (!currentChat?.demo || !deployConfig.stripePublishableKey || !deployConfig.stripeSecretKey || !deployConfig.customDomain) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      alert(`🚀 Deploying to ${deployConfig.customDomain} with Stripe integration...`);
      setShowDeployModal(false);
    } catch (error) {
      console.error('Deployment failed:', error);
      alert('❌ Deployment failed. Please try again.');
    }
  };

  // Fullscreen view
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
          className="w-full h-[calc(100vh-60px)] border-0"
        />
      </div>
    );
  }

  // Initial centered Google-like layout (no chat history yet)
  if (chatHistory.length === 0) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <Header />

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl space-y-8">
            <WelcomeScreen onCategoryClick={setMessage} />

            <div className="space-y-6">
              <SuggestedPrompts onPromptClick={setMessage} />

              <ChatInput
                message={message}
                setMessage={setMessage}
                onSubmit={handleSendMessage}
                isLoading={isLoading}
                attachments={attachments}
                setAttachments={setAttachments}
                placeholder="What's trending? (e.g., 'House of the Dragon finale merch' or attach images for inspiration)"
              />
            </div>
          </div>
        </div>

        <DeployModal
          isOpen={showDeployModal}
          onClose={() => setShowDeployModal(false)}
          deployConfig={deployConfig}
          setDeployConfig={setDeployConfig}
          onDeploy={handleDeploy}
        />
      </div>
    );
  }

  // Chat layout with resizable panels (after first message)
  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Chat Panel */}
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="flex flex-col h-full border-r">
            <Header />

            <ChatMessages messages={chatHistory} isLoading={isLoading} />

            {currentChat && !isLoading && (
              <div className="px-6">
                <DeploySection
                  files={currentChat.files}
                  onDeployClick={() => setShowDeployModal(true)}
                />
              </div>
            )}

            {/* Chat Input */}
            <div className="border-t p-4">
              <ChatInput
                message={message}
                setMessage={setMessage}
                onSubmit={handleSendMessage}
                isLoading={isLoading}
                attachments={attachments}
                setAttachments={setAttachments}
                className="max-w-2xl mx-auto"
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Preview Panel */}
        <ResizablePanel defaultSize={70} minSize={30}>
          <PreviewPanel
            demoUrl={currentChat?.demo}
            files={currentChat?.files}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onToggleFullscreen={toggleFullscreen}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      <DeployModal
        isOpen={showDeployModal}
        onClose={() => setShowDeployModal(false)}
        deployConfig={deployConfig}
        setDeployConfig={setDeployConfig}
        onDeploy={handleDeploy}
      />
    </div>
  );
}