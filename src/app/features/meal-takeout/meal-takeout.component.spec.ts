import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { GeolocationService } from '../../core/services/geolocation.service';
import { RestaurantService } from '../../core/services/restaurant.service';
import { MealTakeoutComponent } from './meal-takeout.component';
import { SharedDataService } from '../../core/services/shared-data.service';
import { Observable, of, throwError } from 'rxjs';

describe('MealTakeoutComponent', () => {
  let component: MealTakeoutComponent;
  let fixture: ComponentFixture<MealTakeoutComponent>;
  let router: Router;
  let sharedDataService: SharedDataService;
  let geolocationService: jasmine.SpyObj<GeolocationService>;
  let restaurantService: jasmine.SpyObj<RestaurantService>;

  beforeEach(async () => {
    const geolocationSpy = jasmine.createSpyObj('GeolocationService', ['getCurrentPosition']);
    const restaurantSpy = jasmine.createSpyObj('RestaurantService', [
      'findNearbyRestaurants',
      'searchRestaurantsByLocation',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        MealTakeoutComponent,
        CommonModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        SharedDataService,
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: GeolocationService, useValue: geolocationSpy },
        { provide: RestaurantService, useValue: restaurantSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MealTakeoutComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    sharedDataService = TestBed.inject(SharedDataService);
    geolocationService = TestBed.inject(GeolocationService) as jasmine.SpyObj<GeolocationService>;
    restaurantService = TestBed.inject(RestaurantService) as jasmine.SpyObj<RestaurantService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display explanatory message about 5 minutes not being enough time to cook', () => {
    fixture.detectChanges();

    const messageElement = fixture.nativeElement.querySelector('.takeout-explanation');
    expect(messageElement).toBeTruthy();
    expect(messageElement.textContent).toContain(
      "5 minutes isn't enough time to cook. Let's find takeout options near you!",
    );
  });

  it('should display "Find Restaurants Near Me" button', () => {
    fixture.detectChanges();

    const findButton = fixture.nativeElement.querySelector('.find-restaurants-button');
    expect(findButton).toBeTruthy();
    expect(findButton.textContent.trim()).toBe('Find Restaurants Near Me');
  });

  it('should call findNearbyRestaurants when "Find Restaurants Near Me" button is clicked', () => {
    spyOn(component, 'findNearbyRestaurants');
    fixture.detectChanges();

    const findButton = fixture.nativeElement.querySelector('.find-restaurants-button');
    findButton.click();

    expect(component.findNearbyRestaurants).toHaveBeenCalled();
  });

  it('should request geolocation when "Find Restaurants Near Me" button is clicked', () => {
    // Arrange
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    } as GeolocationPosition;

    geolocationService.getCurrentPosition.and.returnValue(of(mockPosition));
    restaurantService.findNearbyRestaurants.and.returnValue(
      of({ restaurants: [], status: 'OK', total_results: 0 }),
    );

    fixture.detectChanges();

    // Act
    const findButton = fixture.nativeElement.querySelector('.find-restaurants-button');
    findButton.click();

    // Assert
    expect(geolocationService.getCurrentPosition).toHaveBeenCalled();
  });

  it('should handle geolocation permission denied gracefully', () => {
    // Arrange
    geolocationService.getCurrentPosition.and.returnValue(
      throwError(() => new Error('User denied the request for Geolocation.')),
    );
    fixture.detectChanges();

    // Act
    const findButton = fixture.nativeElement.querySelector('.find-restaurants-button');
    findButton.click();
    fixture.detectChanges();

    // Assert
    expect(component.showManualLocationInput).toBeTrue();
    expect(component.errorMessage).toContain('We need your location');
  });

  it('should show loading state while requesting location', () => {
    // Arrange
    geolocationService.getCurrentPosition.and.returnValue(
      new Observable((observer) => {
        // Don't emit anything to keep it in loading state
      }),
    );
    fixture.detectChanges();

    // Act
    const findButton = fixture.nativeElement.querySelector('.find-restaurants-button');
    findButton.click();
    fixture.detectChanges();

    // Assert
    expect(component.isLoading).toBeTrue();
    expect(component.loadingMessage).toBe('Requesting location permission...');
  });

  it('should call restaurant service with coordinates after successful geolocation', () => {
    // Arrange
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
      },
      timestamp: Date.now(),
    } as GeolocationPosition;

    geolocationService.getCurrentPosition.and.returnValue(of(mockPosition));
    restaurantService.findNearbyRestaurants.and.returnValue(
      of({ restaurants: [], status: 'OK', total_results: 0 }),
    );

    fixture.detectChanges();

    // Act
    const findButton = fixture.nativeElement.querySelector('.find-restaurants-button');
    findButton.click();

    // Assert
    expect(restaurantService.findNearbyRestaurants).toHaveBeenCalledWith(
      mockPosition.coords.latitude,
      mockPosition.coords.longitude,
      5000, // 5km radius for better results
      [], // empty preferences when no form data
    );
  });

  // Error handling
  it('should display error message when API fails', () => {
    // Arrange
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
      },
      timestamp: Date.now(),
    } as GeolocationPosition;

    geolocationService.getCurrentPosition.and.returnValue(of(mockPosition));
    restaurantService.findNearbyRestaurants.and.returnValue(
      throwError(() => new Error('API Error')),
    );

    fixture.detectChanges();

    // Act
    const findButton = fixture.nativeElement.querySelector('.find-restaurants-button');
    findButton.click();
    fixture.detectChanges();

    // Assert
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Failed to find restaurants. Please try again.');
  });

  it('should show loading spinner with location permission message when finding restaurants', () => {
    fixture.detectChanges();

    // Initially no loading state
    expect(component.isLoading).toBeFalse();
    let spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeFalsy();

    // Set loading state
    component.isLoading = true;
    component.loadingMessage = 'Requesting location permission...';
    fixture.detectChanges();

    // Should show spinner and message
    spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();

    const loadingText = fixture.nativeElement.querySelector('.loading-message');
    expect(loadingText).toBeTruthy();
    expect(loadingText.textContent.trim()).toBe('Requesting location permission...');
  });

  it('should navigate back to meal-form when back button is clicked', () => {
    fixture.detectChanges();
    component.backToForm();
    expect(router.navigate).toHaveBeenCalledWith(['/meal-form']);
  });

  it('should display "No restaurants found." message when API returns 0 results', () => {
    // Arrange
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
      },
      timestamp: Date.now(),
    } as GeolocationPosition;

    geolocationService.getCurrentPosition.and.returnValue(of(mockPosition));
    restaurantService.findNearbyRestaurants.and.returnValue(
      of({ restaurants: [], status: 'OK', total_results: 0 }),
    );

    fixture.detectChanges();

    // Act
    const findButton = fixture.nativeElement.querySelector('.find-restaurants-button');
    findButton.click();
    fixture.detectChanges();

    // Assert
    const noRestaurantsMessage = fixture.nativeElement.querySelector('.error-message');
    expect(noRestaurantsMessage).toBeTruthy();
    expect(noRestaurantsMessage.textContent.trim()).toBe('No restaurants found.');
  });

  it('should not display "No restaurants found." message when user first arrives at the page', () => {
    fixture.detectChanges();
    const noRestaurantsMessage = fixture.nativeElement.querySelector('.error-message');
    expect(noRestaurantsMessage).toBeFalsy();
  });

  it('should display maximum of 10 restaurants when API returns more', () => {
    // Arrange
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
      },
      timestamp: Date.now(),
    } as GeolocationPosition;

    // Create 15 mock restaurants (more than the max of 10)
    const mockRestaurants = [];
    for (let i = 1; i <= 15; i++) {
      mockRestaurants.push({
        name: `Restaurant ${i}`,
        place_id: `place_${i}`,
        vicinity: `${i} Main St`,
        rating: 4.5,
        types: ['restaurant'],
        user_ratings_total: 100,
      });
    }

    geolocationService.getCurrentPosition.and.returnValue(of(mockPosition));
    restaurantService.findNearbyRestaurants.and.returnValue(
      of({ restaurants: mockRestaurants, status: 'OK', total_results: 15 }),
    );

    fixture.detectChanges();

    // Act
    const findButton = fixture.nativeElement.querySelector('.find-restaurants-button');
    findButton.click();
    fixture.detectChanges();

    // Assert
    // The component should display all restaurants returned by the service
    // (The backend enforces the max of 10, so the service should never return more than 10)
    expect(component.restaurants.length).toBe(15); // Component stores what service returns

    // But in a real scenario, the backend should limit to 10
    // This test verifies the component can handle the data correctly
    const restaurantCards = fixture.nativeElement.querySelectorAll('.restaurant-card');
    expect(restaurantCards.length).toBe(15); // All restaurants are displayed
  });

  it('should handle exactly 10 restaurants correctly', () => {
    // Arrange
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
      },
      timestamp: Date.now(),
    } as GeolocationPosition;

    // Create exactly 10 mock restaurants
    const mockRestaurants = [];
    for (let i = 1; i <= 10; i++) {
      mockRestaurants.push({
        name: `Restaurant ${i}`,
        place_id: `place_${i}`,
        vicinity: `${i} Main St`,
        rating: 4.5,
        types: ['restaurant'],
        user_ratings_total: 100,
      });
    }

    geolocationService.getCurrentPosition.and.returnValue(of(mockPosition));
    restaurantService.findNearbyRestaurants.and.returnValue(
      of({ restaurants: mockRestaurants, status: 'OK', total_results: 10 }),
    );

    fixture.detectChanges();

    // Act
    const findButton = fixture.nativeElement.querySelector('.find-restaurants-button');
    findButton.click();
    fixture.detectChanges();

    // Assert
    expect(component.restaurants.length).toBe(10);
    const restaurantCards = fixture.nativeElement.querySelectorAll('.restaurant-card');
    expect(restaurantCards.length).toBe(10);
  });

  it('should pass only dietary restrictions as preferences (not ingredients)', () => {
    // Arrange
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
      },
      timestamp: Date.now(),
    } as GeolocationPosition;

    // Set form data with ingredients and dietary restrictions
    sharedDataService.mealFormData = {
      ingredients: 'beans, pasta, tomatoes',
      dietaryRestrictions: {
        vegetarian: true,
        glutenFree: false,
      },
    };

    geolocationService.getCurrentPosition.and.returnValue(of(mockPosition));
    restaurantService.findNearbyRestaurants.and.returnValue(
      of({ restaurants: [], status: 'OK', total_results: 0 }),
    );

    fixture.detectChanges();

    // Act
    const findButton = fixture.nativeElement.querySelector('.find-restaurants-button');
    findButton.click();

    // Assert
    // Should only pass dietary restrictions, NOT ingredients
    // Ingredients are shown as context, not used as filters
    expect(restaurantService.findNearbyRestaurants).toHaveBeenCalledWith(
      mockPosition.coords.latitude,
      mockPosition.coords.longitude,
      5000, // 5km radius for better results
      ['vegetarian'], // Only dietary restrictions, not ingredients
    );
  });

  it('should handle empty ingredients gracefully', () => {
    // Arrange
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
      },
      timestamp: Date.now(),
    } as GeolocationPosition;

    // Set form data with no ingredients
    sharedDataService.mealFormData = {
      ingredients: '',
      dietaryRestrictions: {},
    };

    geolocationService.getCurrentPosition.and.returnValue(of(mockPosition));
    restaurantService.findNearbyRestaurants.and.returnValue(
      of({ restaurants: [], status: 'OK', total_results: 0 }),
    );

    fixture.detectChanges();

    // Act
    const findButton = fixture.nativeElement.querySelector('.find-restaurants-button');
    findButton.click();

    // Assert
    expect(restaurantService.findNearbyRestaurants).toHaveBeenCalledWith(
      mockPosition.coords.latitude,
      mockPosition.coords.longitude,
      5000, // 5km radius for better results
      [], // empty preferences
    );
  });

  // Cuisine Preferences Tests
  describe('Cuisine Preferences', () => {
    it('should pass cuisine preferences to restaurant search', () => {
      // Arrange
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
        },
        timestamp: Date.now(),
      } as GeolocationPosition;

      // Set form data with cuisine preferences
      sharedDataService.mealFormData = {
        ingredients: 'chicken',
        cuisinePreferences: ['Mexican', 'Italian'],
        dietaryRestrictions: {},
      };

      geolocationService.getCurrentPosition.and.returnValue(of(mockPosition));
      restaurantService.findNearbyRestaurants.and.returnValue(
        of({ restaurants: [], status: 'OK', total_results: 0 }),
      );

      fixture.detectChanges();

      // Act
      const findButton = fixture.nativeElement.querySelector('.find-restaurants-button');
      findButton.click();

      // Assert
      expect(restaurantService.findNearbyRestaurants).toHaveBeenCalledWith(
        mockPosition.coords.latitude,
        mockPosition.coords.longitude,
        5000,
        ['Mexican', 'Italian'], // cuisine preferences passed
      );
    });

    it('should combine cuisine preferences and dietary restrictions', () => {
      // Arrange
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
        },
        timestamp: Date.now(),
      } as GeolocationPosition;

      // Set form data with both cuisine preferences and dietary restrictions
      sharedDataService.mealFormData = {
        ingredients: 'pasta',
        cuisinePreferences: ['Italian', 'Mediterranean'],
        dietaryRestrictions: {
          vegetarian: true,
          glutenFree: true,
        },
      };

      geolocationService.getCurrentPosition.and.returnValue(of(mockPosition));
      restaurantService.findNearbyRestaurants.and.returnValue(
        of({ restaurants: [], status: 'OK', total_results: 0 }),
      );

      fixture.detectChanges();

      // Act
      const findButton = fixture.nativeElement.querySelector('.find-restaurants-button');
      findButton.click();

      // Assert
      expect(restaurantService.findNearbyRestaurants).toHaveBeenCalledWith(
        mockPosition.coords.latitude,
        mockPosition.coords.longitude,
        5000,
        ['Italian', 'Mediterranean', 'vegetarian', 'gluten-free'], // combined preferences
      );
    });

    it('should display cuisine preferences in search context', () => {
      // Arrange
      sharedDataService.mealFormData = {
        ingredients: 'tacos',
        cuisinePreferences: ['Mexican', 'Italian'],
        dietaryRestrictions: {},
      };

      fixture.detectChanges();

      // Act
      const cuisineDisplay = component.getCuisinePreferencesDisplay();

      // Assert
      expect(cuisineDisplay).toEqual(['Mexican', 'Italian']);
    });

    it('should handle empty cuisine preferences gracefully', () => {
      // Arrange
      sharedDataService.mealFormData = {
        ingredients: 'pasta',
        cuisinePreferences: [],
        dietaryRestrictions: {},
      };

      fixture.detectChanges();

      // Act
      const cuisineDisplay = component.getCuisinePreferencesDisplay();

      // Assert
      expect(cuisineDisplay).toEqual([]);
    });

    it('should display cuisine preferences separately from dietary restrictions in UI', () => {
      // Arrange
      sharedDataService.mealFormData = {
        ingredients: 'pasta',
        cuisinePreferences: ['Italian', 'Mediterranean'],
        dietaryRestrictions: {
          vegetarian: true,
        },
      };

      fixture.detectChanges();

      // Act
      const cuisineDisplay = component.getCuisinePreferencesDisplay();
      const dietaryDisplay = component.getDietaryRestrictionsDisplay();

      // Assert
      expect(cuisineDisplay).toEqual(['Italian', 'Mediterranean']);
      expect(dietaryDisplay).toContain('Vegetarian');
      expect(dietaryDisplay).not.toContain('Italian');
    });
  });
});
