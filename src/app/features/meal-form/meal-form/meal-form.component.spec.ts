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
      imports: [
        MealFormComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        SharedDataService,
        { provide: Router, useValue: routerSpy }
      ]
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
          other: false
        },
        pickyEaters: false
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
          other: false
        },
        pickyEaters: false
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
          other: false
        },
        pickyEaters: true
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
          other: true
        },
        otherRestriction: 'shellfish allergy',
        pickyEaters: false
      });

      // Act
      component.onSubmit();

      // Assert
      expect(sharedDataService.mealPrompt).toContain('dietary restrictions');
      expect(sharedDataService.mealPrompt).toContain('shellfish allergy');
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
        other: false
      },
      pickyEaters: false
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
});
