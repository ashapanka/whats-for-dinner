import { Injectable } from '@angular/core';

/**
 * Service for sharing data between components
 */
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
