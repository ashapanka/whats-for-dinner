import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-meal-result',
  standalone: true,
  imports: [],
  templateUrl: './meal-result.component.html',
  styleUrl: './meal-result.component.scss'
})
export class MealResultComponent {
  constructor(private router: Router) {}
  
  backToForm() {
    this.router.navigate(['/meal-form']);
  }
}
