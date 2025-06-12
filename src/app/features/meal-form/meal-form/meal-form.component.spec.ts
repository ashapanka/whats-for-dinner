import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { MealFormComponent } from './meal-form.component';

describe('MealFormComponent', () => {
  let component: MealFormComponent;
  let fixture: ComponentFixture<MealFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MealFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

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

    // Spy on the router navigate method
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    // Simulate form submission
    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/meal-result']);
  });

  it('should display meal-result component after submission', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.callThrough();

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
