import { useState } from 'react';
import { ChevronRight, Folder, File, Image } from 'lucide-react';
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

interface FileTreeNode {
  type: 'file' | 'directory';
  content?: string;
  path?: string;
  lang?: string;
  children?: { [key: string]: FileTreeNode };
}

interface FileTreeProps {
  files: ChatFile[];
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
}

interface FileTreeItemProps {
  name: string;
  item: FileTreeNode;
  level?: number;
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
}

const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

const buildFileTree = (files: ChatFile[]) => {
  const tree: { [key: string]: FileTreeNode } = {};
  if (!files || !Array.isArray(files)) {
    return tree;
  }

  files.forEach(file => {
    if (!file || typeof file !== 'object') {
      console.warn('Invalid file object:', file);
      return;
    }

    const filePath = file.path || file.meta?.file;
    if (!filePath || typeof filePath !== 'string') {
      console.warn('No valid file path found:', file);
      return;
    }

    const content = file.content || file.source || '';
    const parts = filePath.split('/').filter(part => part.length > 0);
    let current = tree;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = {
          type: 'file',
          content: content,
          path: filePath,
          lang: file.lang || 'text'
        };
      } else {
        if (!current[part]) {
          current[part] = { type: 'directory', children: {} };
        }
        current = current[part].children!;
      }
    });
  });
  return tree;
};

function FileTreeItem({ name, item, level = 0, selectedFile, onFileSelect }: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(level < 2);

  if (item.type === 'file') {
    const isImage = isImageFile(name);
    return (
      <button
        onClick={() => item.path && onFileSelect(item.path)}
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
          {item.children && Object.entries(item.children).map(([childName, childItem]) => (
            <FileTreeItem 
              key={childName} 
              name={childName} 
              item={childItem} 
              level={level + 1}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function FileTree({ files, selectedFile, onFileSelect }: FileTreeProps) {
  if (!files || !Array.isArray(files)) {
    return <div className="text-xs text-gray-500 p-2">No files to display</div>;
  }

  const tree = buildFileTree(files);
  const entries = Object.entries(tree);

  if (entries.length === 0) {
    return (
      <div className="text-xs text-gray-500 p-2">
        <div>No valid files found</div>
        <div className="mt-2 text-[10px] bg-gray-100 p-2 rounded">
          Debug: {files.length} raw files
          <br />
          Valid paths: {files.filter(f => f?.path).length}
        </div>
      </div>
    );
  }

  return (
    <div>
      {entries.map(([name, item]) => (
        <FileTreeItem 
          key={name} 
          name={name} 
          item={item}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  );
}