// app.component.ts - OPTIMIZED VERSION
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../shared/services/user.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Uncomment this line to force logout on application start (for testing)
    // this.userService.logout();
    
    // Check token validity
    this.checkAuthStatus();
  }
  
  /**
   * Checks if the authentication token is still valid
   * This prevents expired tokens from being used
   * Will logout the user if the token is expired or invalid
   */
  private checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    const user = this.userService.getCurrentUser();
    
    // No token or no user in localStorage
    if (!token || !user) {
      return;
    }
    
    // Check token expiration if you have an expiration date stored
    // This is just an example - your actual implementation may differ
    if (user.expiresAt) {
      const expirationDate = new Date(user.expiresAt);
      const now = new Date();
      
      if (now > expirationDate) {
        console.log('Token expired, logging out user');
        this.userService.logout();
        this.router.navigate(['/login'], { 
          queryParams: { error: 'session-expired' } 
        });
      }
    }
  }
}