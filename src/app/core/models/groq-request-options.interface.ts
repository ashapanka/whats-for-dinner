import { ChatMessage } from './chat-message.interface';

/**
 * Interface for Groq API request options
 */
export interface GroqRequestOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}