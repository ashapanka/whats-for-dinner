import { Routes } from '@angular/router';
import { MealFormComponent } from './features/meal-form/meal-form/meal-form.component';
import { MealResultComponent } from './features/meal-result/meal-result/meal-result.component';

export const routes: Routes = [
  { path: '', redirectTo: 'meal-form', pathMatch: 'full' },
  { path: 'meal-form', component: MealFormComponent },
  { path: 'meal-result', component: MealResultComponent },
  { path: '**', redirectTo: 'meal-form' } // Catch any unfound routes
];
