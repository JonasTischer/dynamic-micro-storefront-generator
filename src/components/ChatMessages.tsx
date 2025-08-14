import { Message, MessageContent } from '@/components/ai-elements/message';
import { Conversation, ConversationContent } from '@/components/ai-elements/conversation';
import { Loader } from '@/components/ai-elements/loader';

interface ChatMessage {
  type: 'user' | 'assistant';
  content: string;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <Conversation>
        <ConversationContent>
          {messages.map((msg, index) => (
            <Message from={msg.type} key={index}>
              <MessageContent>{msg.content}</MessageContent>
            </Message>
          ))}
        </ConversationContent>
      </Conversation>
      
      {isLoading && (
        <Message from="assistant">
          <MessageContent>
            <div className="flex items-center gap-2">
              <Loader />
              <span className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent font-medium">
                🚀 Generating viral pop-up store...
              </span>
            </div>
          </MessageContent>
        </Message>
      )}
    </div>
  );
}