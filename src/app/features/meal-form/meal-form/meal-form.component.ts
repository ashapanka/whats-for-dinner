import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Import Material modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { SharedDataService } from '../../../core/services/shared-data.service';

@Component({
  selector: 'app-meal-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  templateUrl: './meal-form.component.html',
  styleUrl: './meal-form.component.scss',
})
export class MealFormComponent {
  mealForm: FormGroup;
  isSubmitting = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public sharedDataService: SharedDataService,
  ) {
    // Initialize the form
    this.mealForm = this.fb.group({
      timeAvailable: ['', Validators.required],
      numberOfPeople: [null, [Validators.required, Validators.min(1)]],
      ingredients: ['', Validators.required],
      dietaryRestrictions: this.fb.group({
        glutenFree: [false],
        dairyFree: [false],
        vegetarian: [false],
        peanutAllergy: [false],
        other: [false],
        otherRestriction: [''],
      }),
      pickyEaters: [false],
    });

    // Add conditional validator for other restriction
    this.mealForm.get('dietaryRestrictions.other')?.valueChanges.subscribe((checked) => {
      const otherRestrictionControl = this.mealForm.get('dietaryRestrictions.otherRestriction');
      if (checked) {
        otherRestrictionControl?.setValidators([Validators.required, Validators.minLength(2)]);
      } else {
        otherRestrictionControl?.clearValidators();
        otherRestrictionControl?.setValue('');
      }
      otherRestrictionControl?.updateValueAndValidity();
    });

    //for testing
    this.mealForm.valueChanges.subscribe((value) => {
      console.log(value);
    });
  }

  // Accessibility helper methods
  /**
   * Checks if a field is invalid and has been interacted with.
   *
   * @param fieldName The name of the field to check.
   * @returns True if the field is invalid and has been interacted with, false otherwise.
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.mealForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Checks if the 'other' dietary restriction is invalid.
   *
   *
   * @returns True if the 'other' dietary restriction is invalid and touched, false otherwise.
   */
  isOtherRestrictionInvalid(): boolean {
    const otherChecked = this.mealForm.get('dietaryRestrictions.other')?.value;
    const otherRestriction = this.mealForm.get('dietaryRestrictions.otherRestriction');
    return !!(
      otherChecked &&
      otherRestriction &&
      otherRestriction.invalid &&
      otherRestriction.touched
    );
  }

  /**
   * Returns the aria-describedby attribute for a checkbox based on its state.
   *
   * @param checkboxName The name of the checkbox to check.
   * @returns The ID of the description element if the checkbox is checked, null otherwise.
   */
  getCheckboxDescription(checkboxName: string): string | null {
    const isChecked = this.mealForm.get(`dietaryRestrictions.${checkboxName}`)?.value;
    return isChecked ? `${checkboxName}-desc` : null;
  }

  /**
   * Handles form submission.
   *
   * If the form is valid, it stores the form data, creates a prompt, and navigates to the results page.
   * If the form is invalid, it marks all fields as touched to show validation errors and focuses on the first invalid field.
   */
  onSubmit() {
    if (this.mealForm.valid) {
      this.isSubmitting = true;

      // Store the form data
      this.sharedDataService.mealFormData = this.mealForm.value;

      // Create a prompt based on the form data
      this.createMealPrompt();

      // Navigate to results page
      this.router.navigate(['/meal-result']);
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.mealForm);

      // Focus first invalid field
      this.focusFirstInvalidField();
    }
  }

  /**
   * Recursively marks all fields in a form group as touched.
   *
   * @param formGroup The form group to mark as touched.
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Focuses on the first invalid field in the form.
   */
  private focusFirstInvalidField(): void {
    const firstInvalidControl = document.querySelector(
      '.mat-form-field-invalid input, .mat-form-field-invalid mat-select',
    );
    if (firstInvalidControl) {
      (firstInvalidControl as HTMLElement).focus();
    }
  }

  /**
   * Creates a prompt based on the form data.
   *
   * The prompt includes details about the meal preferences, dietary restrictions, and other preferences.
   * It also includes a request for the response to be in a specific JSON format.
   */
  private createMealPrompt(): void {
    const formData = this.mealForm.value;

    // Build dietary restrictions string
    let dietaryRestrictions = '';
    if (formData.dietaryRestrictions) {
      if (formData.dietaryRestrictions.glutenFree) dietaryRestrictions += 'gluten-free, ';
      if (formData.dietaryRestrictions.dairyFree) dietaryRestrictions += 'dairy-free, ';
      if (formData.dietaryRestrictions.vegetarian) dietaryRestrictions += 'vegetarian, ';
      if (formData.dietaryRestrictions.peanutAllergy) dietaryRestrictions += 'no peanuts, ';
      if (
        formData.dietaryRestrictions.other &&
        formData.dietaryRestrictions.otherRestriction.trim()
      ) {
        dietaryRestrictions += 'no ' + formData.dietaryRestrictions.otherRestriction.trim() + ', ';
      }
    }

    // Remove trailing comma and space if present
    dietaryRestrictions = dietaryRestrictions.replace(/, $/, '');

    // Create the prompt with JSON structure request
    const prompt = `Suggest a dinner recipe that:
- Takes about ${formData.timeAvailable} minutes to prepare
- Serves ${formData.numberOfPeople} people
- Uses some of these ingredients: ${formData.ingredients}
${dietaryRestrictions ? '- Accommodates these dietary restrictions: ' + dietaryRestrictions : ''}
${formData.pickyEaters ? '- Include tips for picky eaters' : ''}

IMPORTANT: If "no eggs" or similar restriction is specified, DO NOT include eggs or that ingredient in any form in the recipe.

Please return your response in the following JSON format:
{
  "name": "Recipe Name",
  "description": "Brief description of the dish",
  "ingredients": ["ingredient 1", "ingredient 2", "..."],
  "preparationSteps": ["step 1", "step 2", "..."],
  "cookingTime": "Total cooking time",
  ${formData.pickyEaters ? '"pickyEaterTips": "Tips for picky eaters"' : ''}
}`;

    // Store the prompt in the shared service
    this.sharedDataService.mealPrompt = prompt;

    console.log('Created prompt:', prompt);
  }
}
