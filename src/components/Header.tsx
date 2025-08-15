import Image from 'next/image';

export function Header() {
  return (
    <div className="border-b p-4 h-16 flex items-center justify-between bg-gradient-to-r from-orange-400 via-red-400 to-pink-400">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
          <Image 
            src="/poply-logo.svg" 
            alt="PopLy" 
            width={24} 
            height={24}
            className="w-full h-full"
          />
        </div>
        <h1 className="text-xl font-bold text-white">PopLy</h1>
      </div>
      <div className="text-xs text-orange-100">AI-Powered Pop-Up Stores in 60s</div>
    </div>
  );
}