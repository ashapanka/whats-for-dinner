import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MealDataService } from '../../../core/services/meal-data.service';

// Import Material modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';

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
    public mealData: MealDataService,
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
      }),
      otherRestriction: [''],
      pickyEaters: [false],
    });

    //for testing
    this.mealForm.valueChanges.subscribe((value) => {
      console.log(value);
    });
  }

  onSubmit() {
    // Process form data here
    // Then navigate to results
    this.router.navigate(['/meal-result']);
  }
}
