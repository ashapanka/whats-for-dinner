import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root component for the application.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
