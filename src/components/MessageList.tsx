import { useEffect, useRef } from 'react';
import type { Message } from '../types/chat';
import ChatMessage from './ChatMessage';
import { MessageCircle } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MessageCircle size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            AI 打字机
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            开始一段智能对话吧。AI 将以打字机风格逐字回复，带来沉浸式交流体验。
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['你好', '今天天气怎么样', '帮我写一篇文章'].map((q) => (
              <span
                key={q}
                className="px-3 py-1.5 bg-gray-100 text-gray-500 text-sm rounded-full cursor-default"
              >
                {q}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}