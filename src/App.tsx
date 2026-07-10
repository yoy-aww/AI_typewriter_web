import { useChat } from './hooks/useChat';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';

function App() {
  const {
    messages,
    sendMessage,
    isLoading,
    error,
    stopGeneration,
    clearMessages,
  } = useChat();

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <ChatHeader
        messageCount={messages.length}
        onClear={clearMessages}
        isLoading={isLoading}
      />

      {error && (
        <div className="bg-red-50 border-b border-red-100 px-4 py-2 text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      <MessageList messages={messages} isLoading={isLoading} />

      <ChatInput
        onSend={sendMessage}
        onStop={stopGeneration}
        disabled={false}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;