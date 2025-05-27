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
      case UserService.ROLE_SYSTEM_ADMIN: // System Administrator (role 4)
        this.router.navigate(['/layout/rap']);
        break;
      case UserService.ROLE_STAFF: // Staff (role 3)
        this.router.navigate(['/layout/giaodich']);
        break;
      case UserService.ROLE_CINEMA_ADMIN: // Cinema Manager (role 2) - Updated
        this.router.navigate(['/layout/rap']); // Changed from /layout/phim to /layout/rap
        break;
      default:
        this.router.navigate(['/layout']);
        break;
    }
  }
}