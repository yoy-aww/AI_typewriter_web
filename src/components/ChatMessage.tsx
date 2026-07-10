import type { Message } from '../types/chat';

interface ChatMessageProps {
  message: Message;
}

function formatContent(text: string): string {
  return text;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 message-enter`}>
      <div className="flex items-start gap-3 max-w-[80%]">
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium shadow-sm">
            AI
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-3 leading-relaxed text-[15px] ${
            isUser
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
              : 'bg-white border border-gray-100 text-gray-800 shadow-sm'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">
            {message.content || (message.isStreaming ? '' : '...')}
            {message.isStreaming && (
              <span className="typewriter-cursor" />
            )}
          </p>
        </div>
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white text-xs font-medium shadow-sm">
            我
          </div>
        )}
      </div>
    </div>
  );
}