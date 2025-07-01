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

    //for testing
    this.mealForm.valueChanges.subscribe((value) => {
      console.log(value);
    });
  }

  onSubmit() {
    if (this.mealForm.valid) {
      // Store the form data
      this.sharedDataService.mealFormData = this.mealForm.value;
      
      // Create a prompt based on the form data
      this.createMealPrompt();
      
      // Navigate to results page
      this.router.navigate(['/meal-result']);
    }
  }

  private createMealPrompt() {
    const formData = this.mealForm.value;
    
    // Build dietary restrictions string
    let dietaryRestrictions = '';
    if (formData.dietaryRestrictions) {
      if (formData.dietaryRestrictions.glutenFree) dietaryRestrictions += 'gluten-free, ';
      if (formData.dietaryRestrictions.dairyFree) dietaryRestrictions += 'dairy-free, ';
      if (formData.dietaryRestrictions.vegetarian) dietaryRestrictions += 'vegetarian, ';
      if (formData.dietaryRestrictions.peanutAllergy) dietaryRestrictions += 'no peanuts, ';
      if (formData.dietaryRestrictions.other && formData.dietaryRestrictions.otherRestriction.trim()) {
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
  }
}
