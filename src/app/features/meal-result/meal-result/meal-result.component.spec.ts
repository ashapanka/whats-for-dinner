import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { MealResultComponent } from './meal-result.component';
import { LLMGROQService } from '../../../core/services/llm-groq.service';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { MealSuggestion } from '../../../core/models/meal-suggestion.interface';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';

describe('MealResultComponent', () => {
  let component: MealResultComponent;
  let fixture: ComponentFixture<MealResultComponent>;
  let llmGroqServiceSpy: jasmine.SpyObj<LLMGROQService>;
  let sharedDataService: SharedDataService;
  let router: Router;

  // Mock meal suggestion data
  const mockMealSuggestion: MealSuggestion = {
    name: 'Test Recipe',
    description: 'A delicious test recipe',
    ingredients: ['ingredient 1', 'ingredient 2'],
    preparationSteps: ['step 1', 'step 2'],
    cookingTime: '30 minutes',
    pickyEaterTips: 'Tips for picky eaters',
  };

  beforeEach(async () => {
    // Create spy for LLMGROQService
    const spy = jasmine.createSpyObj('LLMGROQService', ['getMealSuggestions']);

    await TestBed.configureTestingModule({
      imports: [
        MealResultComponent,
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatListModule,
        NoopAnimationsModule,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        SharedDataService,
        { provide: LLMGROQService, useValue: spy },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MealResultComponent);
    component = fixture.componentInstance;
    llmGroqServiceSpy = TestBed.inject(LLMGROQService) as jasmine.SpyObj<LLMGROQService>;
    sharedDataService = TestBed.inject(SharedDataService);
    router = TestBed.inject(Router);

    // Setup default spy behavior
    llmGroqServiceSpy.getMealSuggestions.and.returnValue(of(mockMealSuggestion));
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call getMealSuggestions on init with prompt from shared service', () => {
    // Arrange
    sharedDataService.mealPrompt = 'Test prompt';

    // Act
    fixture.detectChanges();

    // Assert
    expect(llmGroqServiceSpy.getMealSuggestions).toHaveBeenCalledWith('Test prompt');
  });

  it('should call getMealSuggestions with default prompt if no prompt in shared service', () => {
    // Arrange
    sharedDataService.mealPrompt = '';

    // Act
    fixture.detectChanges();

    // Assert
    expect(llmGroqServiceSpy.getMealSuggestions).toHaveBeenCalledWith(jasmine.any(String));
  });

  it('should display loading spinner while getting suggestions', () => {
    // Arrange - don't resolve the observable yet
    llmGroqServiceSpy.getMealSuggestions.and.returnValue(new Observable((observer) => {}));

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.isLoading).toBeTrue();
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should display error message when API call fails', () => {
    // Arrange
    llmGroqServiceSpy.getMealSuggestions.and.returnValue(throwError(() => new Error('API Error')));

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.errorMessage).toBeTruthy();
    const errorElement = fixture.nativeElement.querySelector('.error-message');
    expect(errorElement).toBeTruthy();
  });

  it('should display meal name', () => {
    // Act
    fixture.detectChanges();

    // Wait for async operations to complete
    component.suggestion = mockMealSuggestion;
    fixture.detectChanges();

    // Assert
    const mealName = fixture.nativeElement.querySelector('h2.name');
    expect(mealName).toBeTruthy();
    expect(mealName.textContent).toContain('Test Recipe');
  });

  it('should display short description of meal', () => {
    // Act
    fixture.detectChanges();

    // Wait for async operations to complete
    component.suggestion = mockMealSuggestion;
    fixture.detectChanges();

    // Assert
    const mealDescription = fixture.nativeElement.querySelector('p.description');
    expect(mealDescription).toBeTruthy();
    expect(mealDescription.textContent).toContain('A delicious test recipe');
  });

  it('should display ingredients list', () => {
    // Act
    fixture.detectChanges();

    // Wait for async operations to complete
    component.suggestion = mockMealSuggestion;
    fixture.detectChanges();

    // Assert
    const ingredientsList = fixture.nativeElement.querySelector('ul.ingredients');
    expect(ingredientsList).toBeTruthy();
    const ingredients = fixture.nativeElement.querySelectorAll('ul.ingredients li');
    expect(ingredients.length).toBe(2);
  });

  it('should display preparation steps', () => {
    // Act
    fixture.detectChanges();

    // Wait for async operations to complete
    component.suggestion = mockMealSuggestion;
    fixture.detectChanges();

    // Assert
    const prepSteps = fixture.nativeElement.querySelector('ol.preparation-steps');
    expect(prepSteps).toBeTruthy();
    const steps = fixture.nativeElement.querySelectorAll('ol.preparation-steps li');
    expect(steps.length).toBe(2);
  });

  it('should display cooking time', () => {
    // Act
    fixture.detectChanges();

    // Wait for async operations to complete
    component.suggestion = mockMealSuggestion;
    fixture.detectChanges();

    // Assert
    const cookTime = fixture.nativeElement.querySelector('p.cookingTime');
    expect(cookTime).toBeTruthy();
    expect(cookTime.textContent).toContain('30 minutes');
  });

  it('should display picky eater tip if present in response', () => {
    // Act
    fixture.detectChanges();

    // Wait for async operations to complete
    component.suggestion = mockMealSuggestion;
    fixture.detectChanges();

    // Assert
    const pickyEaterTip = fixture.nativeElement.querySelector('p.pickyEaterTip');
    expect(pickyEaterTip).toBeTruthy();
    expect(pickyEaterTip.textContent).toContain('Tips for picky eaters');
  });

  it('should not display picky eater tip if not present in response', () => {
    // Arrange
    const suggestionWithoutTips = { ...mockMealSuggestion };
    delete suggestionWithoutTips.pickyEaterTips;

    // Act
    fixture.detectChanges();

    // Wait for async operations to complete
    component.suggestion = suggestionWithoutTips;
    fixture.detectChanges();

    // Assert
    const pickyEaterSection = fixture.nativeElement.querySelector('.picky-eater-section');
    expect(pickyEaterSection).toBeFalsy();
  });

  it('should navigate back to form when back button is clicked', () => {
    // Act
    fixture.detectChanges();

    // Wait for async operations to complete
    component.suggestion = mockMealSuggestion;
    fixture.detectChanges();

    const backButton = fixture.nativeElement.querySelector('button:first-of-type');
    backButton.click();

    // Assert
    expect(router.navigate).toHaveBeenCalledWith(['/meal-form']);
  });
});
