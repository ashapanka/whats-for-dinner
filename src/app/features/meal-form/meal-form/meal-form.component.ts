import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-meal-form',
  standalone: true,
  imports: [],
  templateUrl: './meal-form.component.html',
  styleUrl: './meal-form.component.scss'
})
export class MealFormComponent {
  constructor(private router: Router) {}
  
  onSubmit() {
    // Process form data here
    // Then navigate to results
    this.router.navigate(['/meal-result']);
  }
}
