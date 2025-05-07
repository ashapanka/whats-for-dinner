import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MealDataService } from '../../../core/services/meal-data.service';

// Import Material modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-meal-result',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, // This includes mat-card-subtitle
    MatButtonModule,
  ],
  templateUrl: './meal-result.component.html',
  styleUrl: './meal-result.component.scss',
})
export class MealResultComponent {
  constructor(
    private router: Router,
    public mealData: MealDataService,
  ) {}

  backToForm() {
    this.router.navigate(['/meal-form']);
  }
}
