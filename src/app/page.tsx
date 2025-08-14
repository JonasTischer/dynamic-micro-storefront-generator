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
import { Maximize2, Rocket, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Header } from '@/components/Header';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { DeployModal } from '@/components/DeployModal';
import { CodeView } from '@/components/CodeView';


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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showCodeView, setShowCodeView] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [deployConfig, setDeployConfig] = useState({
    stripePublishableKey: '',
    stripeSecretKey: '',
    customDomain: '',
    storeName: ''
  });

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

      console.log('Full chat response:', chat);
      if (chat.files && chat.files.length > 0) {
        console.log('Generated files found:', chat.files);
        console.log('File structure check:', chat.files.map(f => ({ path: f?.path, hasContent: !!f?.content })));
        chat.files.forEach((file, index) => {
          console.log(`File ${index}:`, file);
          if (file && typeof file === 'object') {
            console.log(`  Path: ${file.path}`);
            console.log(`  Content length: ${file.content?.length || 0}`);
            console.log(`  Content preview:`, file.content?.substring(0, 100));
          }
        });
        const firstValidFile = chat.files.find(f => f?.path || f?.meta?.file);
        if (firstValidFile) {
          const filePath = firstValidFile.path || firstValidFile.meta?.file;
          if (filePath) {
            setSelectedFile(filePath);
          }
        }
      } else {
        console.log('No files found in chat response');
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
          content:
            '💔 Trend generation failed! The moment might have passed. Try a different viral topic or trend.',
        },
      ]);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Chat Panel */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="flex flex-col h-full border-r">
            <Header />

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatHistory.length === 0 ? (
                <WelcomeScreen onCategoryClick={setMessage} />
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
                          <span className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent font-medium">
                            🚀 Generating viral pop-up store...
                          </span>
                        </div>
                      </MessageContent>
                    </Message>
                  )}

                  {currentChat && !isLoading && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-yellow-50 rounded-lg border border-pink-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-pink-700">Ready to Go Live? 🚀</h3>
                          <p className="text-sm text-pink-600">Deploy your viral store with payment processing in 60 seconds</p>
                        </div>
                        <Button
                          onClick={() => setShowDeployModal(true)}
                          className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 text-white"
                        >
                          <Rocket className="w-4 h-4 mr-2" />
                          Deploy Store
                        </Button>
                      </div>

                      {currentChat?.files && currentChat.files.length > 0 && (
                        <div className="pt-3 border-t border-pink-200">
                          <span className="text-xs text-pink-600">
                            {currentChat.files.length} files generated • Click &quot;Code&quot; in preview to view
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t p-4">
              {!currentChat && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">🔥 Trending Now</h3>
                  <Suggestions>
                    <Suggestion
                      onClick={() =>
                        setMessage('Create a Drake surprise album drop merch store with hoodies, phone cases, and vinyl records')
                      }
                      suggestion="🎵 Drake Album Drop - Limited edition merch and vinyl"
                    />
                    <Suggestion
                      onClick={() => setMessage('Build a Wednesday Addams viral trend store with gothic accessories, dance props, and dark academia items')}
                      suggestion="🖤 Wednesday Viral - Gothic accessories and dark academia"
                    />
                    <Suggestion
                      onClick={() =>
                        setMessage('Design a World Cup fever store with team jerseys, scarves, and supporter accessories')
                      }
                      suggestion="⚽ World Cup Hype - Team gear and supporter merch"
                    />
                    <Suggestion
                      onClick={() =>
                        setMessage('Create a Marvel movie premiere pop-up with superhero merch, collectibles, and themed accessories')
                      }
                      suggestion="🦸 Marvel Premiere - Superhero merch and collectibles"
                    />
                    <Suggestion
                      onClick={() =>
                        setMessage('Build a trending meme store with viral stickers, funny t-shirts, and internet culture items')
                      }
                      suggestion="😂 Meme Culture - Viral stickers and internet culture"
                    />
                    <Suggestion
                      onClick={() =>
                        setMessage('Design a royal event commemorative store with royal wedding items, memorabilia, and British-themed goods')
                      }
                      suggestion="👑 Royal Event - Commemorative items and memorabilia"
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
                    placeholder="What's trending? (e.g., 'House of the Dragon finale merch' or 'Viral TikTok dance challenge gear')"
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
            {showCodeView ? (
              <CodeView 
                files={currentChat?.files || []} 
                selectedFile={selectedFile}
                onFileSelect={setSelectedFile}
                onToggleCodeView={() => setShowCodeView(false)}
              />
            ) : (
              <WebPreview>
                <WebPreviewNavigation>
                  <WebPreviewUrl
                    readOnly
                    placeholder="Your store preview will appear here..."
                    value={currentChat?.demo}
                  />
                  <div className="flex items-center gap-2">
                    {currentChat?.files && currentChat.files.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCodeView(!showCodeView)}
                        className="h-8 px-3"
                      >
                        <Code2 className="w-4 h-4 mr-1" />
                        Code
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="h-8 w-8 p-0"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </WebPreviewNavigation>
                <WebPreviewBody src={currentChat?.demo} />
              </WebPreview>
            )}
          </div>
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