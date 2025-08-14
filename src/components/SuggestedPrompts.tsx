import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion';

interface SuggestedPromptsProps {
  onPromptClick: (prompt: string) => void;
}

export function SuggestedPrompts({ onPromptClick }: SuggestedPromptsProps) {
  const prompts = [
    {
      id: 'drake-album',
      text: 'Create a Drake surprise album drop merch store with hoodies, phone cases, and vinyl records',
      display: '🎵 Drake Album Drop - Limited edition merch and vinyl'
    },
    {
      id: 'wednesday-viral',
      text: 'Build a Wednesday Addams viral trend store with gothic accessories, dance props, and dark academia items',
      display: '🖤 Wednesday Viral - Gothic accessories and dark academia'
    },
    {
      id: 'world-cup',
      text: 'Design a World Cup fever store with team jerseys, scarves, and supporter accessories',
      display: '⚽ World Cup Hype - Team gear and supporter merch'
    },
    {
      id: 'marvel-premiere',
      text: 'Create a Marvel movie premiere pop-up with superhero merch, collectibles, and themed accessories',
      display: '🦸 Marvel Premiere - Superhero merch and collectibles'
    },
    {
      id: 'meme-culture',
      text: 'Build a trending meme store with viral stickers, funny t-shirts, and internet culture items',
      display: '😂 Meme Culture - Viral stickers and internet culture'
    },
    {
      id: 'royal-event',
      text: 'Design a royal event commemorative store with royal wedding items, memorabilia, and British-themed goods',
      display: '👑 Royal Event - Commemorative items and memorabilia'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">🔥 Trending Now</h3>
      <Suggestions>
        {prompts.map((prompt) => (
          <Suggestion
            key={prompt.id}
            onClick={() => onPromptClick(prompt.text)}
            suggestion={prompt.display}
          />
        ))}
      </Suggestions>
    </div>
  );
}