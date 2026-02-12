import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

/**
 * Service for getting the current position of the user
 */
@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  /**
   * Get the current position of the user
   * @returns Observable of GeolocationPosition
   */
  getCurrentPosition(): Observable<GeolocationPosition> {
    return new Observable((observer) => {
      if (!navigator.geolocation) {
        observer.error(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => observer.next(position),
        (error) => observer.error(error),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  }
}
