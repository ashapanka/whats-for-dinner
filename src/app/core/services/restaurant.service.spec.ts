import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RestaurantService, RestaurantSearchResponse, Restaurant } from './restaurant.service';
import { environment } from '../../../environments/environment';

describe('RestaurantService', () => {
  let service: RestaurantService;
  let httpMock: HttpTestingController;

  const mockRestaurant: Restaurant = {
    name: 'Test Restaurant',
    place_id: 'test123',
    vicinity: '123 Test St',
    rating: 4.5,
    types: ['restaurant', 'food'],
    user_ratings_total: 100,
    price_level: 2,
    opening_hours: 'Mo-Fr 09:00-18:00',
  };

  const mockSearchResponse: RestaurantSearchResponse = {
    restaurants: [mockRestaurant],
    status: 'OK',
    total_results: 1,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RestaurantService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RestaurantService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findNearbyRestaurants', () => {
    it('should make POST request to correct endpoint', () => {
      const latitude = 40.7128;
      const longitude = -74.006;

      service.findNearbyRestaurants(latitude, longitude).subscribe();

      const req = httpMock.expectOne(`${environment.backendApiUrl}/restaurants/search`);
      expect(req.request.method).toBe('POST');
      req.flush(mockSearchResponse);
    });

    it('should send correct request body with default parameters', () => {
      const latitude = 40.7128;
      const longitude = -74.006;

      service.findNearbyRestaurants(latitude, longitude).subscribe();

      const req = httpMock.expectOne(`${environment.backendApiUrl}/restaurants/search`);
      expect(req.request.body).toEqual({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 1000,
        preferences: [],
      });
      req.flush(mockSearchResponse);
    });

    it('should send correct request body with custom parameters', () => {
      const latitude = 40.7128;
      const longitude = -74.006;
      const radius = 5000;
      const preferences = ['italian', 'vegetarian'];

      service.findNearbyRestaurants(latitude, longitude, radius, preferences).subscribe();

      const req = httpMock.expectOne(`${environment.backendApiUrl}/restaurants/search`);
      expect(req.request.body).toEqual({
        latitude: 40.7128,
        longitude: -74.006,
        radius: 5000,
        preferences: ['italian', 'vegetarian'],
      });
      req.flush(mockSearchResponse);
    });

    it('should return restaurant search response on success', () => {
      const latitude = 40.7128;
      const longitude = -74.006;

      service.findNearbyRestaurants(latitude, longitude).subscribe((response) => {
        expect(response).toEqual(mockSearchResponse);
        expect(response.restaurants.length).toBe(1);
        expect(response.restaurants[0].name).toBe('Test Restaurant');
        expect(response.status).toBe('OK');
        expect(response.total_results).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.backendApiUrl}/restaurants/search`);
      req.flush(mockSearchResponse);
    });

    it('should handle empty results', () => {
      const emptyResponse: RestaurantSearchResponse = {
        restaurants: [],
        status: 'ZERO_RESULTS',
        total_results: 0,
      };

      service.findNearbyRestaurants(40.7128, -74.006).subscribe((response) => {
        expect(response.restaurants.length).toBe(0);
        expect(response.status).toBe('ZERO_RESULTS');
      });

      const req = httpMock.expectOne(`${environment.backendApiUrl}/restaurants/search`);
      req.flush(emptyResponse);
    });

    it('should handle HTTP errors', () => {
      service.findNearbyRestaurants(40.7128, -74.006).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(`${environment.backendApiUrl}/restaurants/search`);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('searchRestaurantsByLocation', () => {
    it('should make POST request to correct endpoint', () => {
      const location = 'New York, NY';

      service.searchRestaurantsByLocation(location).subscribe();

      const req = httpMock.expectOne(`${environment.backendApiUrl}/restaurants/search-by-location`);
      expect(req.request.method).toBe('POST');
      req.flush(mockSearchResponse);
    });

    it('should send correct request body with default parameters', () => {
      const location = 'New York, NY';

      service.searchRestaurantsByLocation(location).subscribe();

      const req = httpMock.expectOne(`${environment.backendApiUrl}/restaurants/search-by-location`);
      expect(req.request.body).toEqual({
        location: 'New York, NY',
        radius: 1000,
        preferences: [],
      });
      req.flush(mockSearchResponse);
    });

    it('should send correct request body with custom parameters', () => {
      const location = 'New York, NY';
      const radius = 3000;
      const preferences = ['mexican', 'gluten-free'];

      service.searchRestaurantsByLocation(location, radius, preferences).subscribe();

      const req = httpMock.expectOne(`${environment.backendApiUrl}/restaurants/search-by-location`);
      expect(req.request.body).toEqual({
        location: 'New York, NY',
        radius: 3000,
        preferences: ['mexican', 'gluten-free'],
      });
      req.flush(mockSearchResponse);
    });

    it('should return restaurant search response on success', () => {
      const location = 'New York, NY';

      service.searchRestaurantsByLocation(location).subscribe((response) => {
        expect(response).toEqual(mockSearchResponse);
        expect(response.restaurants.length).toBe(1);
        expect(response.status).toBe('OK');
      });

      const req = httpMock.expectOne(`${environment.backendApiUrl}/restaurants/search-by-location`);
      req.flush(mockSearchResponse);
    });

    it('should handle HTTP errors', () => {
      service.searchRestaurantsByLocation('Invalid Location').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${environment.backendApiUrl}/restaurants/search-by-location`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });
});
