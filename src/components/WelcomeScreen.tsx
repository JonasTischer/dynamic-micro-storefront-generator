import { Zap } from 'lucide-react';
import { TrendCategories } from './TrendCategories';

interface WelcomeScreenProps {
  onCategoryClick: (message: string) => void;
}

export function WelcomeScreen({ onCategoryClick }: WelcomeScreenProps) {
  return (
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

      <TrendCategories onCategoryClick={onCategoryClick} />
    </div>
  );
}