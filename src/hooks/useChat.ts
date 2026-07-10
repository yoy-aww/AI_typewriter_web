import { useState, useRef, useCallback } from 'react';
import type { Message } from '../types/chat';

const API_URL = '/api/chat/stream';

// 兼容的 UUID 生成函数
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string>(generateUUID());
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(null);

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
    };

    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsLoading(true);

    const chatHistory = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          sessionId: sessionIdRef.current,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('响应体不可读');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      // 追加文本到流式消息
      const appendText = (text: string) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg?.role === 'assistant' && lastMsg.isStreaming) {
            updated[updated.length - 1] = {
              ...lastMsg,
              content: lastMsg.content + text,
            };
          }
          return updated;
        });
      };

      // 从 SSE data 行提取 content，根据 isEnd 判断流是否结束
      const processLine = (line: string, isStreamEnd: { value: boolean }): void => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // 跳过 event: 行，只处理 data: 行（兼容 data: 和 data: 后无空格）
        if (trimmed.startsWith('event:')) return;
        if (!trimmed.startsWith('data')) return;

        // 去掉 "data" 前缀，取后面的内容
        let payload = trimmed.slice(4).trim();
        // 去掉可能的前导冒号
        if (payload.startsWith(':')) payload = payload.slice(1).trim();
        if (!payload || payload === '[DONE]') return;

        // 解析 JSON 取 content，判断 isEnd
        try {
          const parsed = JSON.parse(payload);
          const text = parsed.content;
          if (text) {
            appendText(text);
          }
          // isEnd 为 true 时标记流结束
          if (parsed.isEnd === true) {
            isStreamEnd.value = true;
          }
        } catch {
          // 非 JSON，直接追加
          if (payload) appendText(payload);
        }
      };

      const streamEnd = { value: false };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 按行分割处理
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          processLine(line, streamEnd);
        }

        // 收到 isEnd:true 时提前结束读取
        if (streamEnd.value) break;
      }

      // 处理余量
      if (buffer.trim() && !streamEnd.value) {
        processLine(buffer, streamEnd);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error(err);
      setError(err.message || '请求失败，请重试');
      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.isStreaming) {
          updated[updated.length - 1] = {
            ...lastMsg,
            content: lastMsg.content || '抱歉，发生了错误，请重试。',
            isStreaming: false,
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.isStreaming) {
          updated[updated.length - 1] = {
            ...lastMsg,
            isStreaming: false,
          };
        }
        return updated;
      });
    }
  }, [messages, isLoading]);

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const clearMessages = useCallback(() => {
    if (isLoading) {
      abortControllerRef.current?.abort();
    }
    setMessages([]);
    setError(null);
    sessionIdRef.current = generateUUID();
  }, [isLoading]);

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    stopGeneration,
    clearMessages,
  };
}