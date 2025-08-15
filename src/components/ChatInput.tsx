import { useState, useRef, useCallback } from 'react';
import { PaperclipIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromptInput, PromptInputSubmit, PromptInputTextarea } from '@/components/ai-elements/prompt-input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Attachment {
  url: string;
  name: string;
  contentType: string;
  file?: File;
}

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  attachments: Attachment[];
  setAttachments: (attachments: Attachment[]) => void;
  placeholder?: string;
  className?: string;
}

export function ChatInput({
  message,
  setMessage,
  onSubmit,
  isLoading,
  attachments,
  setAttachments,
  placeholder = "What's trending?",
  className = ""
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const processFileInMemory = async (file: File): Promise<Attachment | null> => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      return {
        url: dataUrl,
        name: file.name,
        contentType: file.type,
        file,
      };
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Failed to process file');
      return null;
    }
  };

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      // Filter for images only
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      if (imageFiles.length !== files.length) {
        toast.error('Only image files are supported');
      }

      if (imageFiles.length === 0) return;

      setUploadQueue(imageFiles.map(file => file.name));

      try {
        const uploadPromises = imageFiles.map(processFileInMemory);
        const results = await Promise.all(uploadPromises);
        const successfulUploads = results.filter((result): result is Attachment => result !== null);

        setAttachments([...attachments, ...successfulUploads]);
      } catch (error) {
        console.error('Error uploading files:', error);
        toast.error('Some files failed to process');
      } finally {
        setUploadQueue([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [attachments, setAttachments]
  );

  const removeAttachment = (urlToRemove: string) => {
    setAttachments(attachments.filter(attachment => attachment.url !== urlToRemove));
  };

  return (
    <div className={`w-full ${className}`}>
      {/* File input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Attachments preview */}
      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.url}
              className="relative group bg-gray-100 rounded-lg p-2 flex items-center gap-2 max-w-xs"
            >
              {attachment.contentType.startsWith('image/') && (
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <span className="text-sm text-gray-700 truncate flex-1">
                {attachment.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeAttachment(attachment.url)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {uploadQueue.map((filename) => (
            <div
              key={filename}
              className="bg-gray-100 rounded-lg p-2 flex items-center gap-2 max-w-xs opacity-50"
            >
              <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
              <span className="text-sm text-gray-500 truncate flex-1">
                Uploading {filename}...
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Input form */}
      <PromptInput onSubmit={onSubmit} className={cn("relative", className)}>
        <PromptInputTextarea
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          placeholder={placeholder}
          className="pr-20 min-h-[60px] text-lg"
          minHeight={60}
        />

        <div className="absolute bottom-1 right-1 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <PaperclipIcon className="h-4 w-4" />
          </Button>

          <PromptInputSubmit
            className="h-8 w-8 p-0"
            disabled={!message.trim() && attachments.length === 0}
            status={isLoading ? 'streaming' : 'ready'}
          />
        </div>
      </PromptInput>
    </div>
  );
}