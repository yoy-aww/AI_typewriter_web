import { Bot, Eraser } from 'lucide-react';

interface ChatHeaderProps {
  messageCount: number;
  onClear: () => void;
  isLoading: boolean;
}

export default function ChatHeader({ messageCount, onClear, isLoading }: ChatHeaderProps) {
  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[16px] font-semibold text-gray-800 leading-tight">
              AI 打字机
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-gray-400">
                {isLoading ? '正在回复...' : '在线'}
              </span>
            </div>
          </div>
        </div>
        {messageCount > 0 && (
          <button
            onClick={onClear}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Eraser size={15} />
            清空对话
          </button>
        )}
      </div>
    </header>
  );
}