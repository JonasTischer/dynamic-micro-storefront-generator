import { useState } from 'react';
import { Maximize2, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
} from '@/components/ai-elements/web-preview';
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

interface PreviewPanelProps {
  demoUrl?: string;
  files?: ChatFile[];
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  onToggleFullscreen: () => void;
}

export function PreviewPanel({
  demoUrl,
  files = [],
  selectedFile,
  onFileSelect,
  onToggleFullscreen,
}: PreviewPanelProps) {
  const [showCodeView, setShowCodeView] = useState(false);

  if (!demoUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Preview will appear here
          </h3>
          <p className="text-gray-500 max-w-md">
            Generate your first viral store to see the preview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {showCodeView ? (
        <CodeView 
          files={files} 
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
          onToggleCodeView={() => setShowCodeView(false)}
        />
      ) : (
        <WebPreview>
          <WebPreviewNavigation>
            <WebPreviewUrl
              readOnly
              placeholder="Your store preview will appear here..."
              value={demoUrl}
            />
            <div className="flex items-center gap-2">
              {files.length > 0 && (
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
                onClick={onToggleFullscreen}
                className="h-8 w-8 p-0"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </WebPreviewNavigation>
          <WebPreviewBody src={demoUrl} />
        </WebPreview>
      )}
    </div>
  );
}