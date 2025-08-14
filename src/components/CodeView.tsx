import { Eye, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeBlock, CodeBlockCopyButton } from '@/components/ai-elements/code-block';
import { FileTree } from './FileTree';

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

interface CodeViewProps {
  files: ChatFile[];
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  onToggleCodeView: () => void;
}

const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

export function CodeView({ files, selectedFile, onFileSelect, onToggleCodeView }: CodeViewProps) {
  if (!files || files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center p-8">
          <Code2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Code Files Available</h3>
          <p className="text-gray-500 max-w-md">
            Code files might not be available yet, or this v0 generation doesn&apos;t include source files.
            Try generating a new store.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={onToggleCodeView}
          >
            Back to Preview
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* File Tree Sidebar */}
      <div className="w-64 border-r bg-gray-50 flex flex-col">
        <div className="p-3 border-b bg-white">
          <h3 className="font-medium text-gray-700 text-sm">Project Files</h3>
          <p className="text-xs text-gray-500 mt-1">{files.length} files generated</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <FileTree 
            files={files} 
            selectedFile={selectedFile} 
            onFileSelect={onFileSelect} 
          />
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
              onClick={onToggleCodeView}
              className="h-8 px-3"
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {selectedFile ? (
            (() => {
              const file = files.find(f =>
                (f.path === selectedFile) || (f.meta?.file === selectedFile)
              );

              if (!file) {
                return <div className="p-4 text-gray-500 text-center">File not found</div>;
              }

              const fileName = selectedFile.split('/').pop() || '';
              const isImage = isImageFile(fileName);

              if (isImage && file.meta?.url) {
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
                return (
                  <CodeBlock code={file.content || file.source || ''} language={file.lang || 'jsx'} showLineNumbers={true}>
                    <CodeBlockCopyButton
                      onCopy={() => console.log(`Copied ${selectedFile} to clipboard`)}
                      onError={() => console.error(`Failed to copy ${selectedFile} to clipboard`)}
                    />
                  </CodeBlock>
                );
              }
            })()
          ) : (
            <div className="p-4 text-gray-500 text-center">
              Select a file from the tree to view its contents
            </div>
          )}
        </div>
      </div>
    </div>
  );
}