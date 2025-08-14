import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface DepploySectionProps {
  files?: ChatFile[];
  onDeployClick: () => void;
}

export function DeploySection({ files = [], onDeployClick }: DepploySectionProps) {
  return (
    <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-yellow-50 rounded-lg border border-pink-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-pink-700">Ready to Go Live? 🚀</h3>
          <p className="text-sm text-pink-600">
            Deploy your viral store with payment processing in 60 seconds
          </p>
        </div>
        <Button
          onClick={onDeployClick}
          className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 text-white"
        >
          <Rocket className="w-4 h-4 mr-2" />
          Deploy Store
        </Button>
      </div>

      {files.length > 0 && (
        <div className="pt-3 border-t border-pink-200">
          <span className="text-xs text-pink-600">
            {files.length} files generated • Click &quot;Code&quot; in preview to view
          </span>
        </div>
      )}
    </div>
  );
}