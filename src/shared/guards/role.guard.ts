import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { PermissionService } from '../services/permission.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService,
    private userService: UserService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Get allowed roles from route data
    const allowedRoles = route.data['allowedRoles'];

    if (!allowedRoles) {
      console.warn('No roles specified for RoleGuard. Denying access by default.');
      this.router.navigate(['/']);
      return of(false);
    }

    // Convert to array if it's a single role
    const requiredRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Get current user synchronously first (for faster response)
    const currentUser = this.userService.getCurrentUser();

    // Special handling for staff role (3)
    if (currentUser && currentUser.role === 3) {
      // Check if this is the 'rap' route or a route that starts with 'room'
      const path = route.routeConfig?.path || '';
      const isRapRoute = path === 'rap';
      const isRoomRoute = path.startsWith('room');

      // If staff is trying to access anything other than 'rap' or 'room'
      if (!isRapRoute && !isRoomRoute) {
        console.log('Staff attempting to access restricted route:', path);
        this.router.navigate(['/giaodich']);
        return of(false);
      }
    }

    // If we have the user data cached and can make a quick decision
    if (currentUser) {
      if (requiredRoles.includes(currentUser.role)) {
        return of(true);
      } else {
        // Navigate to appropriate page based on role
        this.navigateToDefaultPage(currentUser.role, state.url);
        return of(false);
      }
    }

    // Otherwise, do the full asynchronous check with the PermissionService
    return this.permissionService.hasPermission(requiredRoles).pipe(
      tap(hasPermission => {
        if (!hasPermission) {
          // Check if user is logged in but doesn't have permission
          this.permissionService.getCurrentUser().subscribe(user => {
            if (user) {
              // User is logged in but doesn't have right permission
              this.navigateToDefaultPage(user.role, state.url);
            } else {
              // User is not logged in
              this.router.navigate(['/login'], {
                queryParams: { returnUrl: state.url }
              });
            }
          });
        }
      }),
      catchError(error => {
        console.error('Error in role guard:', error);
        // Redirect to login page on error
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
        return of(false);
      })
    );
  }

  /**
   * Navigate to the default page based on user role
   * @param userRole The user's role ID
   * @param currentUrl The current URL the user was trying to access
   */
  private navigateToDefaultPage(userRole: number, currentUrl: string): void {
    // Store the current URL as return URL if needed later
    sessionStorage.setItem('returnUrl', currentUrl);

    switch (userRole) {
      case 2: // Admin
        // Admins can go to the theloaiphim as default
        this.router.navigate(['/theloaiphim']);
        break;
      case 3: // Staff
        // Staff can only go to rap as default (changed from phim)
        this.router.navigate(['/rap']);
        break;
      case 1: // Regular user
      default:
        // Regular users shouldn't be in the admin section at all
        // Redirect to public homepage or user dashboard
        this.router.navigate(['/']);
        break;
    }
  }
}