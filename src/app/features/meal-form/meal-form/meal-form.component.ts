import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-meal-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './meal-form.component.html',
  styleUrl: './meal-form.component.scss',
})
export class MealFormComponent {
  mealForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.mealForm = this.fb.group({
      timeAvailable: [''],
      ingredients: [''],
      dietaryRestrictions: this.fb.group({
        glutenFree: [false],
        dairyFree: [false],
        vegetarian: [false],
        peanutAllergy: [false],
        other: [false],
      }),
      otherRestriction: [''],
      pickyEaters: [false],
    });
  }

  onSubmit() {
    // Process form data here
    // Then navigate to results
    this.router.navigate(['/meal-result']);
  }
}
