

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MealTakeoutComponent } from './meal-takeout.component';
import { SharedDataService } from '../../core/services/shared-data.service';

fdescribe('MealTakeoutComponent', () => {
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
});
