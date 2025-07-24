import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SharedDataService } from '../../core/services/shared-data.service';

@Component({
  selector: 'app-meal-takeout',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './meal-takeout.component.html',
  styleUrl: './meal-takeout.component.scss'
})
export class MealTakeoutComponent implements OnInit {
  isLoading = false;
  loadingMessage = '';
  errorMessage: string | null = null;
  suggestions: any[] = [];

  constructor(
    private router: Router,
    public sharedDataService: SharedDataService,
  ) {}

  ngOnInit() {
    // Component initialized, waiting for user action
  }

  findNearbyRestaurants() {
    this.isLoading = true;
    this.loadingMessage = 'Requesting location permission...';
    // TODO: Implement geolocation and restaurant finding logic
  }

  backToForm() {
    this.router.navigate(['/meal-form']);
  }
}
