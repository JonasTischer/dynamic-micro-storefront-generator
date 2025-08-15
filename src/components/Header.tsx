import Image from 'next/image';

export function Header() {
  return (
    <div className="border-b p-4 h-16 flex items-center justify-between bg-gradient-to-r from-orange-400 via-red-400 to-pink-400">
      <div className="flex items-center space-x-3">
        <div className="w-32 h-32 rounded-lg flex items-center justify-center p-1">
          <Image
            src="/logo2.png"
            alt="PopLy"
            width={64}
            height={64}
            className="w-full h-full"
          />
        </div>
      </div>
      <div className="text-xs text-orange-100">AI-Powered Pop-Up Stores in 60s</div>
    </div>
  );
}