

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MealTakeoutComponent } from './meal-takeout.component';
import { SharedDataService } from '../../core/services/shared-data.service';

describe('MealTakeoutComponent', () => {
  let component: MealTakeoutComponent;
  let fixture: ComponentFixture<MealTakeoutComponent>;
  let router: Router;
  let sharedDataService: SharedDataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MealTakeoutComponent,
        CommonModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule,
      ],
      providers: [
        SharedDataService,
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MealTakeoutComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    sharedDataService = TestBed.inject(SharedDataService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display explanatory message about 5 minutes not being enough time to cook', () => {
    fixture.detectChanges();

    const messageElement = fixture.nativeElement.querySelector('.takeout-explanation');
    expect(messageElement).toBeTruthy();
    expect(messageElement.textContent).toContain("5 minutes isn't enough time to cook. Let's find takeout options near you!");
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
});
