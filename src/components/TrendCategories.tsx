interface TrendCategoriesProps {
  onCategoryClick: (message: string) => void;
}

export function TrendCategories({ onCategoryClick }: TrendCategoriesProps) {
  return (
    <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
      <div 
        className="text-center p-4 rounded-lg bg-pink-50 hover:bg-pink-100 transition-colors cursor-pointer border border-pink-200"
        onClick={() => onCategoryClick('Create a Succession finale luxury merch store with ties, watches, and whiskey accessories')}
      >
        <div className="text-2xl mb-2">👔</div>
        <div className="text-sm font-medium text-pink-700">TV Finale</div>
        <div className="text-xs text-pink-600">Succession merch</div>
      </div>
      <div 
        className="text-center p-4 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors cursor-pointer border border-yellow-200"
        onClick={() => onCategoryClick('Build a Barbenheimer pop-up store with pink movie merch and atomic-themed accessories')}
      >
        <div className="text-2xl mb-2">🎬</div>
        <div className="text-sm font-medium text-yellow-700">Movie Moment</div>
        <div className="text-xs text-yellow-600">Barbenheimer hype</div>
      </div>
      <div 
        className="text-center p-4 rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-pointer border border-red-200"
        onClick={() => onCategoryClick('Design a Taylor Swift Eras Tour merch store with friendship bracelets, tour posters, and vinyl')}
      >
        <div className="text-2xl mb-2">🎤</div>
        <div className="text-sm font-medium text-red-700">Music Drop</div>
        <div className="text-xs text-red-600">Eras Tour fever</div>
      </div>
      <div 
        className="text-center p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer border border-orange-200"
        onClick={() => onCategoryClick('Create a viral TikTok trend store with Stanley cups, phone accessories, and trendy stickers')}
      >
        <div className="text-2xl mb-2">📱</div>
        <div className="text-sm font-medium text-orange-700">Social Viral</div>
        <div className="text-xs text-orange-600">TikTok trending</div>
      </div>
    </div>
  );
}