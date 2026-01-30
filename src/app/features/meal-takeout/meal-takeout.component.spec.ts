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
    );
  });

  // Error handling
  it('should display error message when API fails', () => {});

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
});
