import { useState, useEffect } from 'react';
import { Maximize2, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
} from '@/components/ai-elements/web-preview';
import { CodeView } from '@/components/CodeView';
import { RocketLoader } from '@/components/RocketLoader';

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
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  useEffect(() => {
    setIsIframeLoaded(false);
  }, [demoUrl]);

  if (!demoUrl) {
    return (
      <div className="relative flex items-center justify-center h-full bg-gray-50">
        <RocketLoader />
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
        <div className="relative flex-1">
          <WebPreview className="h-full">
            <WebPreviewNavigation>
              <WebPreviewUrl
                readOnly
                placeholder="Your store preview will appear here..."
                value={demoUrl}
              />
              <div className="flex items-center gap-2">
                {demoUrl && (
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
            <WebPreviewBody
              src={demoUrl}
              onLoad={() => setIsIframeLoaded(true)}
              className="relative z-0"
            />
          </WebPreview>

          {!isIframeLoaded && <RocketLoader />}
        </div>
      )}
    </div>
  );
}