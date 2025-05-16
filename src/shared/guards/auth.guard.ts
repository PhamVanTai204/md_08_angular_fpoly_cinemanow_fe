// auth.guard.ts - OPTIMIZED VERSION
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if current URL is login page
    const isLoginPage = state.url.includes('/login');
    
    // Get current user from localStorage
    const currentUser = this.userService.getCurrentUser();
    
    // If trying to access login page while already logged in
    if (currentUser && isLoginPage) {
      // Redirect to appropriate dashboard based on role
      this.redirectBasedOnRole(currentUser);
      return false;
    }
    
    // If trying to access protected page while not logged in
    if (!currentUser && !isLoginPage) {
      // Store the attempted URL for redirection after login
      const returnUrl = state.url;
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl } 
      });
      return false;
    }
    
    // Allow access to login page when not logged in
    // OR protected pages when logged in
    return true;
  }
  
  // Helper method to redirect based on role
  private redirectBasedOnRole(user: any): void {
    if (!user || !user.role) {
      this.router.navigate(['/layout']);
      return;
    }
    
    switch (user.role) {
      case 4: // System Administrator
        this.router.navigate(['/layout/rap']);
        break;
      case 3: // Staff
        this.router.navigate(['/layout/giaodich']);
        break;
      case 2: // Cinema Manager
        this.router.navigate(['/layout/phim']);
        break;
      default:
        this.router.navigate(['/layout']);
        break;
    }
  }
}