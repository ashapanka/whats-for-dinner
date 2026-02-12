import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Restaurant interface matching FastAPI backend response
 */
export interface Restaurant {
  name: string;
  place_id: string;
  vicinity: string;
  rating?: number | null;
  types: string[];
  user_ratings_total?: number | null;
  price_level?: number | null;
  opening_hours?: string | null;
}

/**
 * Restaurant search response from FastAPI backend
 */
export interface RestaurantSearchResponse {
  restaurants: Restaurant[];
  status: string;
  total_results: number;
}

@Injectable({
  providedIn: 'root',
})

/**
 * Service for searching nearby restaurants using FastAPI backend
 */
export class RestaurantService {
  // Backend API URL for restaurant search
  private readonly apiUrl = environment.backendApiUrl;

  /**
   * Creates an instance of RestaurantService.
   * @param http The Angular HttpClient for making HTTP requests
   */
  constructor(private http: HttpClient) {}

  /**
   * Find nearby restaurants based on coordinates
   * Uses POST request to send data in request body
   *
   * @param latitude Latitude coordinate
   * @param longitude Longitude coordinate
   * @param radius Search radius in meters
   * @param preferences List of cuisine preferences to filter by
   * @returns Observable of restaurant search response
   */
  findNearbyRestaurants(
    latitude: number,
    longitude: number,
    radius: number = 1000,
    preferences: string[] = [],
  ): Observable<RestaurantSearchResponse> {
    const body = {
      latitude,
      longitude,
      radius,
      preferences,
    };

    return this.http.post<RestaurantSearchResponse>(`${this.apiUrl}/restaurants/search`, body);
  }

  /**
   * Search restaurants by location string (requires geocoding on backend)
   * Uses POST request to send data in request body
   *
   * @param location Location string (e.g. "New York, NY")
   * @param radius Search radius in meters
   * @param preferences List of cuisine preferences to filter by
   * @returns Observable of restaurant search response
   */
  searchRestaurantsByLocation(
    location: string,
    radius: number = 1000,
    preferences: string[] = [],
  ): Observable<RestaurantSearchResponse> {
    const body = {
      location,
      radius,
      preferences,
    };

    return this.http.post<RestaurantSearchResponse>(
      `${this.apiUrl}/restaurants/search-by-location`,
      body,
    );
  }
}
