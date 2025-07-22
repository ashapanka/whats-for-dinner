import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LLMGROQService } from '../../../core/services/llm-groq.service';
import { SharedDataService } from '../../../core/services/shared-data.service';
import { MealSuggestion } from '../../../core/models/meal-suggestion.interface';

// Import Material modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-meal-result',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatListModule, MatProgressSpinnerModule],
  templateUrl: './meal-result.component.html',
  styleUrl: './meal-result.component.scss',
})
export class MealResultComponent implements OnInit {
  isLoading = false;
  errorMessage: string | null = null;
  suggestion: MealSuggestion | null = null;

  constructor(
    private router: Router,
    public llmGroqService: LLMGROQService,
    public sharedDataService: SharedDataService,
  ) {}

  ngOnInit() {
    // Check if we have a prompt from the form
    if (this.sharedDataService.mealPrompt) {
      this.getSuggestions(this.sharedDataService.mealPrompt);
    } else {
      // For testing or direct navigation to this page
      this.getSuggestions('Suggest a quick dinner recipe for a family of four.');
    }
  }

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

  backToForm() {
    this.router.navigate(['/meal-form']);
  }

  
}
