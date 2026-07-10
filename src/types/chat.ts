export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export interface ChatRequest {
  messages: { role: string; content: string }[];
  sessionId: string;
}

export type MessageRole = 'user' | 'assistant';