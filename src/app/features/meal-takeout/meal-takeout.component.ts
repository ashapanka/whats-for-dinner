import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { SharedDataService } from '../../core/services/shared-data.service';
import { GeolocationService } from '../../core/services/geolocation.service';
import { RestaurantService, Restaurant } from '../../core/services/restaurant.service';

@Component({
  selector: 'app-meal-takeout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './meal-takeout.component.html',
  styleUrl: './meal-takeout.component.scss',
})
export class MealTakeoutComponent implements OnInit {
  isLoading = false;
  loadingMessage = '';
  errorMessage: string | null = null;
  showManualLocationInput = false;
  suggestions: any[] = [];
  restaurants: Restaurant[] = [];
  locationForm: FormGroup;
  hasSearched = false; // Track if user has performed a search

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private geolocationService: GeolocationService,
    private restaurantService: RestaurantService,
    public sharedDataService: SharedDataService,
  ) {
    this.locationForm = this.formBuilder.group({
      manualLocation: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit() {
    // Component initialized, waiting for user action
  }

  findNearbyRestaurants() {
    this.isLoading = true;
    this.loadingMessage = 'Requesting location permission...';
    this.errorMessage = null;
    this.showManualLocationInput = false;
    this.hasSearched = true; // Mark that a search has been initiated

    this.geolocationService.getCurrentPosition().subscribe({
      next: (position) => {
        this.loadingMessage = 'Finding nearby restaurants...';
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Extract preferences from form data
        const preferences = this.extractPreferences();

        console.log('Searching at coordinates:', { latitude, longitude, preferences });

        this.restaurantService
          .findNearbyRestaurants(latitude, longitude, 5000, preferences)
          .subscribe({
            next: (response) => {
              console.log('Restaurant search response:', response);
              this.isLoading = false;
              this.restaurants = response.restaurants;
              console.log('Found restaurants:', this.restaurants);

              // Log if no results to help debug
              if (this.restaurants.length === 0) {
                console.warn('No restaurants found. This could mean:');
                console.warn('1. No restaurants in 5km radius');
                console.warn('2. Overpass API returned no data');
                console.warn('3. All restaurants were filtered out by preferences:', preferences);
              }
            },
            error: (error) => {
              this.isLoading = false;
              this.errorMessage = 'Failed to find restaurants. Please try again.';
              console.error('Restaurant search error:', error);
            },
          });
      },
      error: (error) => {
        this.isLoading = false;
        this.showManualLocationInput = true;
        this.errorMessage =
          'We need your location to find nearby restaurants. Please enter your location manually or enable location permissions.';
        console.error('Geolocation error:', error);
      },
    });
  }

  private extractPreferences(): string[] {
    const preferences: string[] = [];

    if (this.sharedDataService.mealFormData) {
      // Only extract dietary restrictions (NOT ingredients)
      // Dietary restrictions are critical filters (health/safety/ethics)
      // Ingredients are context, not filters (too restrictive)
      const restrictions = this.sharedDataService.mealFormData.dietaryRestrictions;
      if (restrictions) {
        if (restrictions.vegetarian) {
          preferences.push('vegetarian');
        }
        if (restrictions.glutenFree) {
          preferences.push('gluten-free');
        }
        if (restrictions.dairyFree) {
          preferences.push('dairy-free');
        }
        if (restrictions.peanutAllergy) {
          preferences.push('no-peanuts');
        }
        if (restrictions.other && restrictions.otherRestriction) {
          preferences.push(restrictions.otherRestriction);
        }
      }
    }

    return preferences;
  }

  getIngredientsDisplay(): string {
    if (this.sharedDataService.mealFormData && this.sharedDataService.mealFormData.ingredients) {
      return this.sharedDataService.mealFormData.ingredients;
    }
    return '';
  }

  getDietaryRestrictionsDisplay(): string[] {
    const restrictions: string[] = [];

    if (this.sharedDataService.mealFormData) {
      const r = this.sharedDataService.mealFormData.dietaryRestrictions;
      if (r) {
        if (r.vegetarian) {
          restrictions.push('Vegetarian');
        }
        if (r.glutenFree) {
          restrictions.push('Gluten-Free');
        }
        if (r.dairyFree) {
          restrictions.push('Dairy-Free');
        }
        if (r.peanutAllergy) {
          restrictions.push('No Peanuts');
        }
        if (r.other && r.otherRestriction) {
          restrictions.push(r.otherRestriction);
        }
      }
    }

    return restrictions;
  }

  searchByManualLocation() {
    if (this.locationForm.valid) {
      this.isLoading = true;
      this.loadingMessage = 'Searching restaurants...';
      this.errorMessage = null;

      const location = this.locationForm.value.manualLocation;

      this.restaurantService.searchRestaurantsByLocation(location).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.restaurants = response.restaurants;
          this.showManualLocationInput = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage =
            'Failed to find restaurants at that location. Please try a different location.';
          console.error('Location search error:', error);
        },
      });
    }
  }

  /**
   * Navigates back to the meal form.
   */
  backToForm() {
    this.router.navigate(['/meal-form']);
  }
}
