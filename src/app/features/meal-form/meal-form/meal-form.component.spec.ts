import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MealFormComponent } from './meal-form.component';
import { SharedDataService } from '../../../core/services/shared-data.service';

describe('MealFormComponent', () => {
  let component: MealFormComponent;
  let fixture: ComponentFixture<MealFormComponent>;
  let router: jasmine.SpyObj<Router>;
  let sharedDataService: SharedDataService;

  beforeEach(async () => {
    // Create a spy object for Router with a navigate spy method
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [MealFormComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [SharedDataService, { provide: Router, useValue: routerSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(MealFormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    sharedDataService = TestBed.inject(SharedDataService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display form', () => {
    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
  });

  it('should display time available dropdown', () => {
    expect(
      fixture.nativeElement.querySelector('mat-select[formControlName="timeAvailable"]'),
    ).toBeTruthy();
  });

  // Add tests for accessibility helper methods
  describe('Accessibility Helper Methods', () => {
    it('should return true for invalid touched field', () => {
      const timeControl = component.mealForm.get('timeAvailable');
      timeControl?.markAsTouched();
      timeControl?.setErrors({ required: true });

      expect(component.isFieldInvalid('timeAvailable')).toBe(true);
    });

    it('should return false for valid field', () => {
      const timeControl = component.mealForm.get('timeAvailable');
      timeControl?.setValue('30');

      expect(component.isFieldInvalid('timeAvailable')).toBe(false);
    });

    it('should return false for invalid untouched field', () => {
      const timeControl = component.mealForm.get('timeAvailable');
      timeControl?.setErrors({ required: true });

      expect(component.isFieldInvalid('timeAvailable')).toBe(false);
    });

    it('should return correct checkbox description', () => {
      component.mealForm.get('dietaryRestrictions.glutenFree')?.setValue(true);
      expect(component.getCheckboxDescription('glutenFree')).toBe('glutenFree-desc');

      component.mealForm.get('dietaryRestrictions.glutenFree')?.setValue(false);
      expect(component.getCheckboxDescription('glutenFree')).toBe(null);
    });

    it('should validate other restriction when other is checked', () => {
      component.mealForm.get('dietaryRestrictions.other')?.setValue(true);
      component.mealForm.get('dietaryRestrictions.otherRestriction')?.markAsTouched();

      expect(component.isOtherRestrictionInvalid()).toBe(true);

      component.mealForm.get('dietaryRestrictions.otherRestriction')?.setValue('eggs');
      expect(component.isOtherRestrictionInvalid()).toBe(false);
    });
  });

  it('should display # of people input', () => {
    expect(
      fixture.nativeElement.querySelector('input[formControlName="numberOfPeople"]'),
    ).toBeTruthy();
  });

  it('should display ingredients textarea', () => {
    expect(
      fixture.nativeElement.querySelector('textarea[formControlName="ingredients"]'),
    ).toBeTruthy();
  });

  it('should display dietary restrictions checkboxes', () => {
    const dietaryRestrictions = fixture.nativeElement.querySelectorAll(
      'mat-checkbox[formControlName="glutenFree"], ' +
        'mat-checkbox[formControlName="dairyFree"], ' +
        'mat-checkbox[formControlName="vegetarian"], ' +
        'mat-checkbox[formControlName="peanutAllergy"], ' +
        'mat-checkbox[formControlName="other"]',
    );
    expect(dietaryRestrictions.length).toBeGreaterThan(0);
  });

  it('should display picky eaters checkbox', () => {
    expect(
      fixture.nativeElement.querySelector('mat-checkbox[formControlName="pickyEaters"]'),
    ).toBeTruthy();
  });

  it('should display submit button', () => {
    expect(fixture.nativeElement.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('should not submit if form is invalid (i.e. required fields are empty)', () => {
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBeTrue();

    // Try to submit the form
    component.onSubmit();

    // Expect the form to not navigate since it is invalid
    expect(router.navigate).not.toHaveBeenCalled();

    // Check that the submit button is still disabled
    fixture.detectChanges();
    expect(submitButton.disabled).toBeTrue();
  });

  it('should submit if form is valid', () => {
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');

    // Fill out the form with valid data
    component.mealForm.patchValue({
      timeAvailable: '30 minutes',
      numberOfPeople: 2,
      ingredients: 'chicken, rice',
      dietaryRestrictions: {
        glutenFree: false,
        dairyFree: false,
        vegetarian: false,
        peanutAllergy: false,
        other: false,
      },
      pickyEaters: false,
    });

    fixture.detectChanges();
    expect(submitButton.disabled).toBeFalse();

    // Simulate form submission
    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/meal-result']);
  });

  it('should display meal-result component after submission', () => {
    // Fill out the form with valid data
    component.mealForm.patchValue({
      timeAvailable: '30 minutes',
      numberOfPeople: 2,
      ingredients: 'chicken, rice',
      dietaryRestrictions: {
        glutenFree: false,
        dairyFree: false,
        vegetarian: false,
        peanutAllergy: false,
        other: false,
      },
      pickyEaters: false,
    });

    fixture.detectChanges();

    // Simulate form submission
    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/meal-result']);
  });

  describe('createMealPrompt', () => {
    it('should create a basic prompt with required fields', () => {
      // Arrange
      component.mealForm.patchValue({
        timeAvailable: '30',
        numberOfPeople: 4,
        ingredients: 'chicken, rice, broccoli',
        dietaryRestrictions: {
          glutenFree: false,
          dairyFree: false,
          vegetarian: false,
          peanutAllergy: false,
          other: false,
        },
        pickyEaters: false,
      });

      // Act
      component.onSubmit();

      // Assert
      expect(sharedDataService.mealPrompt).toContain('Takes about 30 minutes');
      expect(sharedDataService.mealPrompt).toContain('Serves 4 people');
      expect(sharedDataService.mealPrompt).toContain('chicken, rice, broccoli');
      expect(sharedDataService.mealPrompt).toContain('JSON format');
      expect(sharedDataService.mealPrompt).not.toContain('dietary restrictions');
      expect(sharedDataService.mealPrompt).not.toContain('picky eaters');
    });

    it('should include dietary restrictions when selected', () => {
      // Arrange
      component.mealForm.patchValue({
        timeAvailable: '30',
        numberOfPeople: 4,
        ingredients: 'chicken, rice, broccoli',
        dietaryRestrictions: {
          glutenFree: true,
          dairyFree: true,
          vegetarian: false,
          peanutAllergy: false,
          other: false,
        },
        pickyEaters: false,
      });

      // Act
      component.onSubmit();

      // Assert
      expect(sharedDataService.mealPrompt).toContain('dietary restrictions');
      expect(sharedDataService.mealPrompt).toContain('gluten-free');
      expect(sharedDataService.mealPrompt).toContain('dairy-free');
    });

    it('should include picky eater tips when selected', () => {
      // Arrange
      component.mealForm.patchValue({
        timeAvailable: '30',
        numberOfPeople: 4,
        ingredients: 'chicken, rice, broccoli',
        dietaryRestrictions: {
          glutenFree: false,
          dairyFree: false,
          vegetarian: false,
          peanutAllergy: false,
          other: false,
        },
        pickyEaters: true,
      });

      // Act
      component.onSubmit();

      // Assert
      expect(sharedDataService.mealPrompt).toContain('picky eaters');
      expect(sharedDataService.mealPrompt).toContain('"pickyEaterTips"');
    });

    it('should include other dietary restrictions when specified', () => {
      // Arrange
      component.mealForm.patchValue({
        timeAvailable: '30',
        numberOfPeople: 4,
        ingredients: 'chicken, rice, broccoli',
        dietaryRestrictions: {
          glutenFree: false,
          dairyFree: false,
          vegetarian: false,
          peanutAllergy: false,
          other: true,
          otherRestriction: 'shellfish allergy', // Updated to match new structure
        },
        pickyEaters: false,
      });

      // Act
      component.onSubmit();

      // Assert
      expect(sharedDataService.mealPrompt).toContain('dietary restrictions');
      expect(sharedDataService.mealPrompt).toContain('no shellfish allergy'); // Updated to match new format
    });

    it('should include other dietary restrictions with "no" prefix when specified', () => {
      // Arrange
      component.mealForm.patchValue({
        timeAvailable: '30',
        numberOfPeople: 4,
        ingredients: 'chicken, rice, broccoli',
        dietaryRestrictions: {
          glutenFree: false,
          dairyFree: false,
          vegetarian: false,
          peanutAllergy: false,
          other: true,
          otherRestriction: 'eggs',
        },
        pickyEaters: false,
      });

      // Act
      component.onSubmit();

      // Assert
      expect(sharedDataService.mealPrompt).toContain('dietary restrictions');
      expect(sharedDataService.mealPrompt).toContain('no eggs');
      expect(sharedDataService.mealPrompt).toContain(
        'IMPORTANT: If "no eggs" or similar restriction is specified',
      );
    });

    it('should include explicit warning about excluded ingredients', () => {
      // Arrange
      component.mealForm.patchValue({
        timeAvailable: '30',
        numberOfPeople: 4,
        ingredients: 'chicken, rice, broccoli',
        dietaryRestrictions: {
          glutenFree: false,
          dairyFree: false,
          vegetarian: false,
          peanutAllergy: false,
          other: true,
          otherRestriction: 'shellfish',
        },
        pickyEaters: false,
      });

      // Act
      component.onSubmit();

      // Assert
      expect(sharedDataService.mealPrompt).toContain('IMPORTANT:');
      expect(sharedDataService.mealPrompt).toContain('DO NOT include');
      expect(sharedDataService.mealPrompt).toContain('no shellfish');
    });

    it('should include cuisine preferences when selected', () => {
      // Arrange
      component.mealForm.patchValue({
        timeAvailable: '30',
        numberOfPeople: 4,
        ingredients: 'chicken, rice',
        cuisinePreferences: ['Italian', 'Mexican'],
        dietaryRestrictions: {
          glutenFree: false,
          dairyFree: false,
          vegetarian: false,
          peanutAllergy: false,
          other: false,
        },
        pickyEaters: false,
      });

      // Act
      component.onSubmit();

      // Assert
      expect(sharedDataService.mealPrompt).toContain('Focuses on these cuisines');
      expect(sharedDataService.mealPrompt).toContain('Italian, Mexican');
    });

    it('should not include cuisine preferences line when none are selected', () => {
      // Arrange
      component.mealForm.patchValue({
        timeAvailable: '30',
        numberOfPeople: 4,
        ingredients: 'chicken, rice',
        cuisinePreferences: [],
        dietaryRestrictions: {
          glutenFree: false,
          dairyFree: false,
          vegetarian: false,
          peanutAllergy: false,
          other: false,
        },
        pickyEaters: false,
      });

      // Act
      component.onSubmit();

      // Assert
      expect(sharedDataService.mealPrompt).not.toContain('Focuses on these cuisines');
    });

    it('should include both cuisine preferences and dietary restrictions', () => {
      // Arrange
      component.mealForm.patchValue({
        timeAvailable: '45',
        numberOfPeople: 2,
        ingredients: 'pasta, tomatoes',
        cuisinePreferences: ['Italian'],
        dietaryRestrictions: {
          glutenFree: false,
          dairyFree: false,
          vegetarian: true,
          peanutAllergy: false,
          other: false,
        },
        pickyEaters: false,
      });

      // Act
      component.onSubmit();

      // Assert
      expect(sharedDataService.mealPrompt).toContain('Focuses on these cuisines: Italian');
      expect(sharedDataService.mealPrompt).toContain('dietary restrictions: vegetarian');
    });

    it('should handle multiple cuisine preferences correctly', () => {
      // Arrange
      component.mealForm.patchValue({
        timeAvailable: '60',
        numberOfPeople: 6,
        ingredients: 'beef, vegetables',
        cuisinePreferences: ['Chinese', 'Thai', 'Vietnamese'],
        dietaryRestrictions: {
          glutenFree: false,
          dairyFree: false,
          vegetarian: false,
          peanutAllergy: false,
          other: false,
        },
        pickyEaters: false,
      });

      // Act
      component.onSubmit();

      // Assert
      expect(sharedDataService.mealPrompt).toContain('Focuses on these cuisines');
      expect(sharedDataService.mealPrompt).toContain('Chinese, Thai, Vietnamese');
    });

    it('should include cuisine preferences with picky eaters option', () => {
      // Arrange
      component.mealForm.patchValue({
        timeAvailable: '30',
        numberOfPeople: 3,
        ingredients: 'chicken',
        cuisinePreferences: ['American'],
        dietaryRestrictions: {
          glutenFree: false,
          dairyFree: false,
          vegetarian: false,
          peanutAllergy: false,
          other: false,
        },
        pickyEaters: true,
      });

      // Act
      component.onSubmit();

      // Assert
      expect(sharedDataService.mealPrompt).toContain('Focuses on these cuisines: American');
      expect(sharedDataService.mealPrompt).toContain('picky eaters');
    });
  });

  it('should navigate to meal-result on valid form submission', () => {
    // Arrange
    component.mealForm.patchValue({
      timeAvailable: '30',
      numberOfPeople: 4,
      ingredients: 'chicken, rice, broccoli',
      dietaryRestrictions: {
        glutenFree: false,
        dairyFree: false,
        vegetarian: false,
        peanutAllergy: false,
        other: false,
      },
      pickyEaters: false,
    });

    // Act
    component.onSubmit();

    // Assert
    expect(router.navigate).toHaveBeenCalledWith(['/meal-result']);
  });

  it('should not navigate on invalid form submission', () => {
    // Arrange - form is invalid by default

    // Act
    component.onSubmit();

    // Assert
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to meal-takeout when time is 5 minutes', () => {
    // Arrange
    component.mealForm.patchValue({
      timeAvailable: '5',
      numberOfPeople: 4,
      ingredients: 'chicken, rice, broccoli',
      dietaryRestrictions: {
        glutenFree: false,
        dairyFree: false,
        vegetarian: false,
        peanutAllergy: false,
        other: false,
      },
      pickyEaters: false,
    });

    // Act
    component.onSubmit();

    // Assert
    expect(router.navigate).toHaveBeenCalledWith(['/meal-takeout']);
  });

  it('should not navigate to meal-takeout when time is not 5 minutes', () => {
    // Arrange
    component.mealForm.patchValue({
      timeAvailable: '30',
      numberOfPeople: 4,
      ingredients: 'chicken, rice, broccoli',
      dietaryRestrictions: {
        glutenFree: false,
        dairyFree: false,
        vegetarian: false,
        peanutAllergy: false,
        other: false,
      },
      pickyEaters: false,
    });

    // Act
    component.onSubmit();

    // Assert
    expect(router.navigate).not.toHaveBeenCalledWith(['/meal-takeout']);
  });

  // Cuisine Preferences Tests
  describe('Cuisine Preferences', () => {
    it('should have cuisinePreferences form control', () => {
      expect(component.mealForm.get('cuisinePreferences')).toBeTruthy();
    });

    it('should initialize cuisinePreferences as empty array', () => {
      expect(component.mealForm.get('cuisinePreferences')?.value).toEqual([]);
    });

    it('should have availableCuisines array with common cuisines', () => {
      expect(component.availableCuisines).toBeDefined();
      expect(component.availableCuisines.length).toBeGreaterThan(0);
      expect(component.availableCuisines).toContain('Italian');
      expect(component.availableCuisines).toContain('Mexican');
      expect(component.availableCuisines).toContain('Chinese');
      expect(component.availableCuisines).toContain('Thai');
      expect(component.availableCuisines).toContain('Japanese');
      expect(component.availableCuisines).toContain('Indian');
    });

    it('should display cuisine preferences section in template', () => {
      const cuisineSection = fixture.nativeElement.querySelector('.cuisine-preferences');
      expect(cuisineSection).toBeTruthy();
    });

    it('should display mat-chip-listbox for cuisine selection', () => {
      const chipListbox = fixture.nativeElement.querySelector(
        'mat-chip-listbox[formControlName="cuisinePreferences"]',
      );
      expect(chipListbox).toBeTruthy();
    });

    it('should display all available cuisines as chips', () => {
      const chips = fixture.nativeElement.querySelectorAll('mat-chip-option');
      expect(chips.length).toBeGreaterThanOrEqual(component.availableCuisines.length);
    });

    it('should toggle cuisine selection when chip is clicked', () => {
      // Arrange
      const initialValue = component.mealForm.get('cuisinePreferences')?.value || [];
      expect(initialValue).toEqual([]);

      // Act - Select Italian using patchValue (simulates Angular Material chip selection)
      component.mealForm.patchValue({ cuisinePreferences: ['Italian'] });

      // Assert
      expect(component.mealForm.get('cuisinePreferences')?.value).toContain('Italian');
    });

    it('should remove cuisine when toggled again', () => {
      // Arrange - First add Italian
      component.mealForm.patchValue({ cuisinePreferences: ['Italian'] });
      expect(component.mealForm.get('cuisinePreferences')?.value).toContain('Italian');

      // Act - Toggle Italian again to remove (simulates deselecting chip)
      component.mealForm.patchValue({ cuisinePreferences: [] });

      // Assert
      expect(component.mealForm.get('cuisinePreferences')?.value).not.toContain('Italian');
    });

    it('should allow multiple cuisine selections', () => {
      // Act - Select multiple cuisines using patchValue
      component.mealForm.patchValue({ cuisinePreferences: ['Italian', 'Mexican', 'Chinese'] });

      // Assert
      const selected = component.mealForm.get('cuisinePreferences')?.value;
      expect(selected).toContain('Italian');
      expect(selected).toContain('Mexican');
      expect(selected).toContain('Chinese');
      expect(selected.length).toBe(3);
    });

    it('should include cuisinePreferences in form data when submitting', () => {
      // Arrange
      component.mealForm.patchValue({
        timeAvailable: '5',
        numberOfPeople: 2,
        ingredients: 'pasta, tomatoes',
        cuisinePreferences: ['Italian', 'Mexican'],
        dietaryRestrictions: {
          vegetarian: true,
        },
      });

      // Act
      component.onSubmit();

      // Assert
      expect(sharedDataService.mealFormData.cuisinePreferences).toEqual(['Italian', 'Mexican']);
    });

    it('should handle empty cuisine preferences when submitting', () => {
      // Arrange
      component.mealForm.patchValue({
        timeAvailable: '5',
        numberOfPeople: 2,
        ingredients: 'pasta',
      });

      // Act
      component.onSubmit();

      // Assert
      expect(sharedDataService.mealFormData.cuisinePreferences).toEqual([]);
    });

    it('should navigate to meal-takeout with cuisine preferences', () => {
      // Arrange
      component.mealForm.patchValue({
        timeAvailable: '5',
        numberOfPeople: 2,
        ingredients: 'tacos',
        cuisinePreferences: ['Mexican'],
      });

      // Act
      component.onSubmit();

      // Assert
      expect(router.navigate).toHaveBeenCalledWith(['/meal-takeout']);
      expect(sharedDataService.mealFormData.cuisinePreferences).toEqual(['Mexican']);
    });
  });
});
