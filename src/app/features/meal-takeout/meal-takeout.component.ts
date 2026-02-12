import { Component } from '@angular/core';
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

/**
 * Component for finding nearby restaurants based on meal preferences.
 */
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
export class MealTakeoutComponent {
  isLoading = false;
  loadingMessage = '';
  errorMessage: string | null = null;
  showManualLocationInput = false;
  suggestions: any[] = [];
  restaurants: Restaurant[] = [];
  locationForm: FormGroup;
  hasSearched = false; // Track if user has performed a search

  /**
   * Constructor for MealTakeoutComponent.
   * @param router The router service.
   * @param formBuilder The form builder service.
   * @param geolocationService The geolocation service.
   * @param restaurantService The restaurant service.
   * @param sharedDataService The shared data service.
   */
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

  /**
   * Finds nearby restaurants based on the user's current location.
   */
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

        this.restaurantService
          .findNearbyRestaurants(latitude, longitude, 5000, preferences)
          .subscribe({
            next: (response) => {
              this.isLoading = false;
              this.restaurants = response.restaurants;
            },
            error: (error) => {
              this.isLoading = false;
              this.errorMessage = 'Failed to find restaurants. Please try again.';
            },
          });
      },
      error: (error) => {
        this.isLoading = false;
        this.showManualLocationInput = true;
        this.errorMessage =
          'We need your location to find nearby restaurants. Please enter your location manually or enable location permissions.';
      },
    });
  }

  /**
   * Extracts preferences from the meal form data.
   * @returns An array of preferences.
   */
  private extractPreferences(): string[] {
    const preferences: string[] = [];

    if (this.sharedDataService.mealFormData) {
      // Extract cuisine preferences first
      const cuisinePrefs = this.sharedDataService.mealFormData.cuisinePreferences;
      if (cuisinePrefs && cuisinePrefs.length > 0) {
        preferences.push(...cuisinePrefs);
      }

      // Extract dietary restrictions (NOT ingredients)
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

  /**
   * Returns the ingredients from the meal form data.
   * @returns A string of ingredients.
   */
  getIngredientsDisplay(): string {
    if (this.sharedDataService.mealFormData && this.sharedDataService.mealFormData.ingredients) {
      return this.sharedDataService.mealFormData.ingredients;
    }
    return '';
  }

  /**
   * Returns the cuisine preferences from the meal form data.
   * @returns An array of cuisine preferences.
   */
  getCuisinePreferencesDisplay(): string[] {
    if (
      this.sharedDataService.mealFormData &&
      this.sharedDataService.mealFormData.cuisinePreferences
    ) {
      return this.sharedDataService.mealFormData.cuisinePreferences;
    }
    return [];
  }

  /**
   * Returns the dietary restrictions from the meal form data.
   * @returns An array of dietary restrictions.
   */
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

  /**
   * Searches for restaurants by manual location input.
   */
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
