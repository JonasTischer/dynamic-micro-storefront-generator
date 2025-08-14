import { TrendingUp } from 'lucide-react';

export function Header() {
  return (
    <div className="border-b p-4 h-16 flex items-center justify-between bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <TrendingUp className="text-pink-500 w-4 h-4" />
        </div>
        <h1 className="text-xl font-bold text-white">TrendPop</h1>
      </div>
      <div className="text-xs text-pink-100">AI-Powered Trend Stores in 60s</div>
    </div>
  );
}