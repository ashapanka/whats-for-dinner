import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedDataService {
  readonly title = "What's for dinner?";
  readonly description = 'A simple app to help you decide what to eat for dinner.';
  
  // Add properties to store form data and prompt
  mealFormData: any = null;
  mealPrompt: string = '';
}
