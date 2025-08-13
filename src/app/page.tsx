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
import { CodeBlock, CodeBlockCopyButton } from '@/components/ai-elements/code-block';
import { Maximize2, Rocket, Zap, TrendingUp, ExternalLink, X, Code2, ChevronRight, File, Folder, Eye, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";


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

      // Log files if they exist
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
        // Auto-select first valid file for preview
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
      // TODO: Implement actual deployment logic
      alert(`🚀 Deploying to ${deployConfig.customDomain} with Stripe integration...`);
      setShowDeployModal(false);
    } catch (error) {
      console.error('Deployment failed:', error);
      alert('❌ Deployment failed. Please try again.');
    }
  };

  // Helper function to build file tree from flat file list
  const buildFileTree = (files: ChatFile[]) => {
    const tree: any = {};
    if (!files || !Array.isArray(files)) {
      return tree;
    }

    files.forEach(file => {
      if (!file || typeof file !== 'object') {
        console.warn('Invalid file object:', file);
        return;
      }

      // Extract file path from either path property or meta.file
      const filePath = file.path || file.meta?.file;
      if (!filePath || typeof filePath !== 'string') {
        console.warn('No valid file path found:', file);
        return;
      }

      // Extract content from either content or source property
      const content = file.content || file.source || '';

      const parts = filePath.split('/').filter(part => part.length > 0);
      let current = tree;

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // This is a file
          current[part] = {
            type: 'file',
            content: content,
            path: filePath,
            lang: file.lang || 'text'
          };
        } else {
          // This is a directory
          if (!current[part]) {
            current[part] = { type: 'directory', children: {} };
          }
          current = current[part].children;
        }
      });
    });
    return tree;
  };

  // Helper function to check if file is an image
  const isImageFile = (fileName: string): boolean => {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  // Component for rendering file tree
  const FileTree = ({ name, item, level = 0 }: { name: string; item: any; level?: number }) => {
    const [isOpen, setIsOpen] = useState(level < 2); // Auto-open first two levels

    if (item.type === 'file') {
      const isImage = isImageFile(name);
      return (
        <button
          onClick={() => setSelectedFile(item.path)}
          className={`flex items-center gap-2 px-2 py-1 w-full text-left text-sm hover:bg-gray-100 rounded ${
            selectedFile === item.path ? 'bg-pink-100 text-pink-700' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${(level * 16) + 8}px` }}
        >
          {isImage ? <Image className="w-4 h-4 flex-shrink-0" /> : <File className="w-4 h-4 flex-shrink-0" />}
          {name}
        </button>
      );
    }

    return (
      <div>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <button
              className="flex items-center gap-2 px-2 py-1 w-full text-left text-sm hover:bg-gray-100 rounded text-gray-700"
              style={{ paddingLeft: `${(level * 16) + 8}px` }}
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              <Folder className="w-4 h-4 flex-shrink-0" />
              {name}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {Object.entries(item.children).map(([childName, childItem]) => (
              <FileTree key={childName} name={childName} item={childItem} level={level + 1} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
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
        {/* Header */}
        <div className="border-b p-4 h-16 flex items-center justify-between bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <TrendingUp className="text-pink-500 w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white">TrendPop</h1>
          </div>
          <div className="text-xs text-pink-100">AI-Powered Trend Stores in 60s</div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatHistory.length === 0 ? (
            <div className="text-center mt-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 rounded-full mb-6">
                <Zap className="text-white w-10 h-10" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent mb-4">
                Turn Trends Into Cash
              </h2>
              <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed mb-8">
                Cultural moments move fast. TrendPop moves faster.
                <strong className="text-pink-600"> Deploy viral pop-up stores in under 60 seconds.</strong>
              </p>

              {/* Trend Categories */}
              <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
                <div className="text-center p-4 rounded-lg bg-pink-50 hover:bg-pink-100 transition-colors cursor-pointer border border-pink-200"
                     onClick={() => setMessage('Create a Succession finale luxury merch store with ties, watches, and whiskey accessories')}>
                  <div className="text-2xl mb-2">👔</div>
                  <div className="text-sm font-medium text-pink-700">TV Finale</div>
                  <div className="text-xs text-pink-600">Succession merch</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors cursor-pointer border border-yellow-200"
                     onClick={() => setMessage('Build a Barbenheimer pop-up store with pink movie merch and atomic-themed accessories')}>
                  <div className="text-2xl mb-2">🎬</div>
                  <div className="text-sm font-medium text-yellow-700">Movie Moment</div>
                  <div className="text-xs text-yellow-600">Barbenheimer hype</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-pointer border border-red-200"
                     onClick={() => setMessage('Design a Taylor Swift Eras Tour merch store with friendship bracelets, tour posters, and vinyl')}>
                  <div className="text-2xl mb-2">🎤</div>
                  <div className="text-sm font-medium text-red-700">Music Drop</div>
                  <div className="text-xs text-red-600">Eras Tour fever</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer border border-orange-200"
                     onClick={() => setMessage('Create a viral TikTok trend store with Stanley cups, phone accessories, and trendy stickers')}>
                  <div className="text-2xl mb-2">📱</div>
                  <div className="text-sm font-medium text-orange-700">Social Viral</div>
                  <div className="text-xs text-orange-600">TikTok trending</div>
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
                      <span className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent font-medium">
                        🚀 Generating viral pop-up store...
                      </span>
                    </div>
                  </MessageContent>
                </Message>
              )}

              {/* Deploy Button */}
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

                  {/* Files info */}
                  {currentChat?.files && currentChat.files.length > 0 && (
                    <div className="pt-3 border-t border-pink-200">
                      <span className="text-xs text-pink-600">
                        {currentChat.files.length} files generated • Click "Code" in preview to view
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
              currentChat?.files && currentChat.files.length > 0 ? (
                // Code View with File Tree
                <div className="flex h-full">
                {/* File Tree Sidebar */}
                <div className="w-64 border-r bg-gray-50 flex flex-col">
                  <div className="p-3 border-b bg-white">
                    <h3 className="font-medium text-gray-700 text-sm">Project Files</h3>
                    <p className="text-xs text-gray-500 mt-1">{currentChat.files.length} files generated</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                    {(() => {
                      if (!currentChat?.files || !Array.isArray(currentChat.files)) {
                        return <div className="text-xs text-gray-500 p-2">No files to display</div>;
                      }

                      console.log('Building tree for files:', currentChat.files);
                      const tree = buildFileTree(currentChat.files);
                      console.log('Built tree:', tree);
                      const entries = Object.entries(tree);
                      console.log('Tree entries:', entries);

                      if (entries.length === 0) {
                        return (
                          <div className="text-xs text-gray-500 p-2">
                            <div>No valid files found</div>
                            <div className="mt-2 text-[10px] bg-gray-100 p-2 rounded">
                              Debug: {currentChat.files.length} raw files
                              <br />
                              Valid paths: {currentChat.files.filter(f => f?.path).length}
                            </div>
                          </div>
                        );
                      }

                      return entries.map(([name, item]) => (
                        <FileTree key={name} name={name} item={item} />
                      ));
                    })()}
                  </div>
                </div>

                {/* Code Preview */}
                <div className="flex-1 flex flex-col">
                  <div className="p-3 border-b bg-white">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">
                        {selectedFile || 'Select a file to preview'}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCodeView(false)}
                        className="h-8 px-3"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {selectedFile && (() => {
                      const file = currentChat.files.find(f =>
                        (f.path === selectedFile) || (f.meta?.file === selectedFile)
                      );

                      if (!file) {
                        return <div className="p-4 text-gray-500 text-center">File not found</div>;
                      }

                      // Check if this is an image file
                      const fileName = selectedFile.split('/').pop() || '';
                      const isImage = isImageFile(fileName);

                      if (isImage && file.meta?.url) {
                        // Show image preview
                        return (
                          <div className="p-4">
                            <div className="text-center">
                              <img
                                src={file.meta.url}
                                alt={fileName}
                                className="max-w-full max-h-96 object-contain mx-auto rounded-lg shadow-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  const parent = (e.target as HTMLElement).parentElement;
                                  if (parent) {
                                    parent.innerHTML = `<div class="text-gray-500 text-center p-8">
                                      <div class="text-4xl mb-2">🖼️</div>
                                      <div>Image preview not available</div>
                                      <div class="text-xs text-gray-400 mt-1">${fileName}</div>
                                    </div>`;
                                  }
                                }}
                              />
                              <div className="mt-3 text-sm text-gray-600">
                                <strong>{fileName}</strong>
                              </div>
                              <div className="mt-2 text-xs text-gray-400">
                                {file.meta.url}
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        // Show code block
                        return (
                          <CodeBlock code={file.content || file.source || ''} language={file.lang || 'jsx'}>
                            <CodeBlockCopyButton
                              onCopy={() => console.log(`Copied ${selectedFile} to clipboard`)}
                              onError={() => console.error(`Failed to copy ${selectedFile} to clipboard`)}
                            />
                          </CodeBlock>
                        );
                      }
                    })()}
                    {!selectedFile && (
                      <div className="p-4 text-gray-500 text-center">
                        Select a file from the tree to view its contents
                      </div>
                    )}
                  </div>
                </div>
                </div>
              ) : (
                // No files available fallback
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center p-8">
                    <Code2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Code Files Available</h3>
                    <p className="text-gray-500 max-w-md">
                      Code files might not be available yet, or this v0 generation doesn't include source files.
                      Try generating a new store.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setShowCodeView(false)}
                    >
                      Back to Preview
                    </Button>
                  </div>
                </div>
              )
            ) : (
              // Preview View
              <WebPreview>
                <WebPreviewNavigation>
                  <WebPreviewUrl
                    readOnly
                    placeholder="Your store preview will appear here..."
                    value={currentChat?.demo}
                  />
                  <div className="flex items-center gap-2">
                    {/* Code View Toggle Button */}
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

      {/* Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
                🚀 Deploy Your Store
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeployModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Enter your Stripe keys and domain to deploy your viral store with payment processing.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="My Viral Store"
                  value={deployConfig.storeName}
                  onChange={(e) => setDeployConfig({...deployConfig, storeName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Domain
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="my-viral-store.com"
                  value={deployConfig.customDomain}
                  onChange={(e) => setDeployConfig({...deployConfig, customDomain: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stripe Publishable Key
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="pk_live_..."
                  value={deployConfig.stripePublishableKey}
                  onChange={(e) => setDeployConfig({...deployConfig, stripePublishableKey: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stripe Secret Key
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="sk_live_..."
                  value={deployConfig.stripeSecretKey}
                  onChange={(e) => setDeployConfig({...deployConfig, stripeSecretKey: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowDeployModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeploy}
                className="flex-1 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Deploy Live
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}