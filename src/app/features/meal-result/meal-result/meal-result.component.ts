import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LLMGROQService } from '../../../core/services/llm-groq.service';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { MealSuggestion } from '../../../core/models/meal-suggestion.interface';

// Import Material modules
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Component for displaying meal suggestions based on user input.
 */
@Component({
  selector: 'app-meal-result',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatListModule, MatProgressSpinnerModule],
  templateUrl: './meal-result.component.html',
  styleUrl: './meal-result.component.scss',
})
export class MealResultComponent implements OnInit {
  isLoading = false;
  errorMessage: string | null = null;
  suggestion: MealSuggestion | null = null;

  /**
   * Creates an instance of MealResultComponent.
   * @param router The Angular router for navigation
   * @param llmGroqService The service for interacting with the LLM API
   * @param sharedDataService The service for sharing data between components
   */
  constructor(
    private router: Router,
    public llmGroqService: LLMGROQService,
    public sharedDataService: SharedDataService,
  ) {}

  /**
   * Initializes the component by fetching meal suggestions based on the prompt from the shared data service.
   */
  ngOnInit() {
    // Check if we have a prompt from the form
    if (this.sharedDataService.mealPrompt) {
      this.getSuggestions(this.sharedDataService.mealPrompt);
    } else {
      // For testing or direct navigation to this page
      this.getSuggestions('Suggest a quick dinner recipe for a family of four.');
    }
  }

  /**
   * Fetches meal suggestions from the LLM service based on the provided prompt.
   * @param prompt The user's meal request prompt
   */
  getSuggestions(prompt: string) {
    this.isLoading = true;
    this.errorMessage = null;
    this.suggestion = null;

    this.llmGroqService.getMealSuggestions(prompt).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.suggestion = response;
        console.log('Received suggestion:', response);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to get meal suggestions. Please try again.';
      },
    });
  }

  /**
   * Navigates back to the meal form.
   */
  backToForm() {
    this.router.navigate(['/meal-form']);
  }
}
