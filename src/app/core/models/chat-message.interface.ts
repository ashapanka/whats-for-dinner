/**
 * Interface representing a message in a chat conversation with an LLM
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}