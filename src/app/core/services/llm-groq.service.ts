import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { LlmResponse } from '../models/llm-response.model';
import { MealSuggestion } from '../models/meal-suggestion.interface';
import { environment } from '../../../environments/environment';
import { ChatMessage } from '../models/chat-message.interface';
import { GroqRequestOptions } from '../models/groq-request-options.interface';

/**
 * Service for interacting with Groq LLM API
 */
@Injectable({ providedIn: 'root' })
export class LLMGROQService {
  private readonly apiUrl = environment.groqApiUrl;
  private readonly model = environment.groqModel;
  private readonly apiKey = environment.groqApiKey;

  // Default system prompt
  private readonly systemPrompt =
    'You are a helpful dinner assistant for busy parents. Always respond with valid JSON.';

  /**
   * Creates an instance of LLMGROQService.
   * @param http The Angular HttpClient for making HTTP requests
   */
  constructor(private http: HttpClient) {}

  /**
   * Get meal suggestions based on user prompt
   * @param prompt User's meal request prompt
   * @param options Optional configuration for the request
   * @param options.temperature Temperature setting for response randomness (0-2, default 0.7)
   * @param options.maxTokens Maximum tokens in the response (default 1000)
   * @param options.systemPrompt Custom system prompt to override default
   * @returns Observable of MealSuggestion
   */
  getMealSuggestions(
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    },
  ): Observable<MealSuggestion> {
    const headers = this.getAuthHeaders();
    const body = this.createRequestBody(prompt, options);

    return this.http.post<LlmResponse>(this.apiUrl, body, { headers }).pipe(
      map((res) => this.parseResponse(res)),
      catchError((error) => this.handleError(error)),
    );
  }

  /**
   * Create authentication headers for Groq API
   * @returns HttpHeaders with authorization and content type
   */
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    });
  }

  /**
   * Create request body for Groq API
   * @param prompt User's meal request prompt
   * @param options Optional configuration for the request
   * @param options.temperature Temperature setting for response randomness (0-2, default 0.7)
   * @param options.maxTokens Maximum tokens in the response (default 1000)
   * @param options.systemPrompt Custom system prompt to override default
   * @returns GroqRequestOptions
   */
  private createRequestBody(
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    },
  ): GroqRequestOptions {
    return {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: options?.systemPrompt || this.systemPrompt,
        },
        { role: 'user', content: prompt },
      ],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 1000,
    };
  }

  /**
   * Parse LLM response into MealSuggestion
   * @param res LlmResponse from Groq API
   * @returns MealSuggestion
   */
  private parseResponse(res: LlmResponse): MealSuggestion {
    const content = res.choices?.[0]?.message?.content ?? '{}';
    try {
      // Extract JSON from the response (in case the LLM adds extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      return JSON.parse(jsonString) as MealSuggestion;
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      // Return a fallback object with the raw content
      return {
        name: 'Parsing Error',
        description: 'Could not parse the recipe data.',
        ingredients: [],
        preparationSteps: [],
        cookingTime: '',
        rawResponse: content,
      } as MealSuggestion;
    }
  }

  /**
   * Handle HTTP errors from Groq API
   * @param error HttpErrorResponse from Groq API
   * @returns Observable of Error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Failed to get meal suggestions. Please try again.';

    if (error.status === 401 || error.status === 403) {
      errorMessage = 'Authentication error. Please check your API key.';
    } else if (error.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again later.';
    } else if (error.status >= 500) {
      errorMessage = 'Groq service is currently unavailable. Please try again later.';
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
