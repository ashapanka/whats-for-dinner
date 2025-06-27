// src/app/models/llm-response.model.ts
export interface LlmMessage {
  role: string;
  content: string;
}

export interface LlmChoice {
  index: number;
  message: LlmMessage;
  finish_reason: string;
}

export interface LlmResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: LlmChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
