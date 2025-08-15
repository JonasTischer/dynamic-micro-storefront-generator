import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion';

interface SuggestedPromptsProps {
  onPromptClick: (prompt: string) => void;
}

export function SuggestedPrompts({ onPromptClick }: SuggestedPromptsProps) {
  const prompts = [
    {
      id: 'taylor-swift',
      text: 'Create a trendy pop-up store for Taylor Swift themed mugs and accessories',
      display: '💜 Taylor Swift Merch ✨'
    },
    {
      id: 'oppenheimer',
      text: 'Build a viral Oppenheimer movie merchandise store with vintage atomic aesthetics',
      display: '💥 Oppenheimer Merch 🎬'
    },
    {
      id: 'viral-tees',
      text: 'Design a pop-up store for trending meme t-shirts and streetwear',
      display: '🔥 Viral Tees 👕'
    },
    {
      id: 'aesthetic-candles',
      text: 'Create a trendy candle store with aesthetic packaging and TikTok vibes',
      display: '🕯️ Aesthetic Candles 🌙'
    }
  ];

  return (
    <div className="flex justify-center">
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