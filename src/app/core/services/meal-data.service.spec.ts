import { TestBed } from '@angular/core/testing';
import { MealDataService } from './meal-data.service';
import { TestingConstants } from '../constants/testing-constants';

describe('MealDataService', () => {
  let service: MealDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MealDataService],
    });
    service = TestBed.inject(MealDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have the correct title', () => {
    expect(service.title).toEqual(TestingConstants.APP_TITLE);
  });

  it('should have the correct description', () => {
    expect(service.description).toEqual(TestingConstants.APP_DESCRIPTION);
  });

  // Add more tests as you add more functionality to the service
});
