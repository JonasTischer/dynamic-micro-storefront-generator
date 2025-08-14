import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeployConfig {
  stripePublishableKey: string;
  stripeSecretKey: string;
  customDomain: string;
  storeName: string;
}

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  deployConfig: DeployConfig;
  setDeployConfig: (config: DeployConfig) => void;
  onDeploy: () => void;
}

export function DeployModal({ 
  isOpen, 
  onClose, 
  deployConfig, 
  setDeployConfig, 
  onDeploy 
}: DeployModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
            🚀 Deploy Your Store
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
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
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onDeploy}
            className="flex-1 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Deploy Live
          </Button>
        </div>
      </div>
    </div>
  );
}