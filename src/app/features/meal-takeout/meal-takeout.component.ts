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

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private geolocationService: GeolocationService,
    private restaurantService: RestaurantService,
    public sharedDataService: SharedDataService,
  ) {
    this.locationForm = this.formBuilder.group({
      manualLocation: ['', [Validators.required, Validators.minLength(2)]]
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

    this.geolocationService.getCurrentPosition().subscribe({
      next: (position) => {
        this.loadingMessage = 'Finding nearby restaurants...';
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        this.restaurantService.findNearbyRestaurants(latitude, longitude).subscribe({
          next: (response) => {
            console.log('Restaurant search response:', response);
            this.isLoading = false;
            this.restaurants = response.restaurants;
            console.log('Found restaurants:', this.restaurants);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = 'Failed to find restaurants. Please try again.';
            console.error('Restaurant search error:', error);
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.showManualLocationInput = true;
        this.errorMessage = 'We need your location to find nearby restaurants. Please enter your location manually or enable location permissions.';
        console.error('Geolocation error:', error);
      }
    });
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
          this.errorMessage = 'Failed to find restaurants at that location. Please try a different location.';
          console.error('Location search error:', error);
        }
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
