import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LLMGROQService } from './llm-groq.service';
import { environment } from '../../../environments/environment';
import { LlmResponse } from '../models/llm-response.model';
import { MealSuggestion } from '../models/meal-suggestion.interface';

describe('LLMGROQService', () => {
  let service: LLMGROQService;
  let httpMock: HttpTestingController;

  const mockLlmResponse: LlmResponse = {
    id: 'test-id',
    object: 'chat.completion',
    created: 1234567890,
    model: 'llama3-8b-8192',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content:
            '{"name":"Test Recipe","description":"A test recipe","ingredients":["ingredient1","ingredient2"],"preparationSteps":["step1","step2"],"cookingTime":"30 minutes"}',
        },
        finish_reason: 'stop',
      },
    ],
  };

  const expectedMealSuggestion: MealSuggestion = {
    name: 'Test Recipe',
    description: 'A test recipe',
    ingredients: ['ingredient1', 'ingredient2'],
    preparationSteps: ['step1', 'step2'],
    cookingTime: '30 minutes',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LLMGROQService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(LLMGROQService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMealSuggestions', () => {
    it('should return meal suggestions on successful API call', () => {
      const testPrompt = 'Suggest a dinner recipe';

      service.getMealSuggestions(testPrompt).subscribe((result) => {
        expect(result).toEqual(expectedMealSuggestion);
      });

      const req = httpMock.expectOne(environment.groqApiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${environment.groqApiKey}`);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');

      req.flush(mockLlmResponse);
    });

    it('should send correct request body with default options', () => {
      const testPrompt = 'Test prompt';

      service.getMealSuggestions(testPrompt).subscribe();

      const req = httpMock.expectOne(environment.groqApiUrl);
      expect(req.request.body).toEqual({
        model: environment.groqModel,
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful dinner assistant for busy parents. Always respond with valid JSON.',
          },
          { role: 'user', content: testPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      req.flush(mockLlmResponse);
    });

    it('should send correct request body with custom options', () => {
      const testPrompt = 'Test prompt';
      const options = {
        temperature: 0.5,
        maxTokens: 500,
        systemPrompt: 'Custom system prompt',
      };

      service.getMealSuggestions(testPrompt, options).subscribe();

      const req = httpMock.expectOne(environment.groqApiUrl);
      expect(req.request.body).toEqual({
        model: environment.groqModel,
        messages: [
          { role: 'system', content: 'Custom system prompt' },
          { role: 'user', content: testPrompt },
        ],
        temperature: 0.5,
        max_tokens: 500,
      });

      req.flush(mockLlmResponse);
    });

    it('should handle JSON parsing errors gracefully', () => {
      const invalidJsonResponse: LlmResponse = {
        ...mockLlmResponse,
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'Invalid JSON response' },
            finish_reason: 'stop',
          },
        ],
      };

      service.getMealSuggestions('test').subscribe((result) => {
        expect(result.name).toBe('Parsing Error');
        expect(result.description).toBe('Could not parse the recipe data.');
        expect(result.ingredients).toEqual([]);
        expect(result.preparationSteps).toEqual([]);
        expect(result.cookingTime).toBe('');
        expect(result.rawResponse).toBe('Invalid JSON response');
      });

      const req = httpMock.expectOne(environment.groqApiUrl);
      req.flush(invalidJsonResponse);
    });

    it('should extract JSON from response with extra text', () => {
      const responseWithExtraText: LlmResponse = {
        ...mockLlmResponse,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content:
                'Here is your recipe: {"name":"Test Recipe","description":"A test recipe","ingredients":["ingredient1"],"preparationSteps":["step1"],"cookingTime":"30 minutes"} Hope you enjoy!',
            },
            finish_reason: 'stop',
          },
        ],
      };

      service.getMealSuggestions('test').subscribe((result) => {
        expect(result.name).toBe('Test Recipe');
        expect(result.description).toBe('A test recipe');
      });

      const req = httpMock.expectOne(environment.groqApiUrl);
      req.flush(responseWithExtraText);
    });

    it('should handle 401 authentication error', () => {
      service.getMealSuggestions('test').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe('Authentication error. Please check your API key.');
        },
      });

      const req = httpMock.expectOne(environment.groqApiUrl);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 429 rate limit error', () => {
      service.getMealSuggestions('test').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe('Rate limit exceeded. Please try again later.');
        },
      });

      const req = httpMock.expectOne(environment.groqApiUrl);
      req.flush('Rate Limited', { status: 429, statusText: 'Too Many Requests' });
    });

    it('should handle 500 server error', () => {
      service.getMealSuggestions('test').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe(
            'Groq service is currently unavailable. Please try again later.',
          );
        },
      });

      const req = httpMock.expectOne(environment.groqApiUrl);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle generic errors', () => {
      service.getMealSuggestions('test').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe('Failed to get meal suggestions. Please try again.');
        },
      });

      const req = httpMock.expectOne(environment.groqApiUrl);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle empty response choices', () => {
      const emptyChoicesResponse: LlmResponse = {
        ...mockLlmResponse,
        choices: [],
      };

      service.getMealSuggestions('test').subscribe((result) => {
        // When choices is empty, content becomes '{}' which parses to an empty object
        expect(result.name).toBeUndefined();
        expect(result.description).toBeUndefined();
        expect(result.ingredients).toBeUndefined();
        expect(result.preparationSteps).toBeUndefined();
        expect(result.cookingTime).toBeUndefined();
        expect(result.rawResponse).toBeUndefined();
      });

      const req = httpMock.expectOne(environment.groqApiUrl);
      req.flush(emptyChoicesResponse);
    });
  });
});
