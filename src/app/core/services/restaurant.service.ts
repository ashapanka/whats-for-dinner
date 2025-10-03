import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  rating?: number;
  priceLevel?: number;
  isOpen?: boolean;
  photoUrl?: string;
  phoneNumber?: string;
}

export interface RestaurantSearchResponse {
  restaurants: Restaurant[];
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private readonly apiUrl = environment.backendApiUrl;

  constructor(private http: HttpClient) {}

  findNearbyRestaurants(latitude: number, longitude: number, radius: number = 2000): Observable<RestaurantSearchResponse> {
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('radius', radius.toString());

    return this.http.get<RestaurantSearchResponse>(`${this.apiUrl}/restaurants/nearby`, { params });
  }

  searchRestaurantsByLocation(location: string): Observable<RestaurantSearchResponse> {
    const params = new HttpParams().set('location', location);
    return this.http.get<RestaurantSearchResponse>(`${this.apiUrl}/restaurants/search`, { params });
  }
}

