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

    // Get current user synchronously (for faster response)
    const currentUser = this.userService.getCurrentUser();

    // If no user is logged in, redirect to login page
    if (!currentUser) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return of(false);
    }

    // Special handling for role 4 (System Administrator)
    if (currentUser.role === 4) {
      // System administrators have access to specific routes only
      const path = route.routeConfig?.path || '';

      // List of routes permitted for System Admin as per updated requirements
      const allowedAdminRoutes = [
        'rap', 'danhgia', 'nhanvien', 'nguoidung', 'adminrap'
      ];

      const isRoomRoute = path.startsWith('room');

      // Check if current route is in the list of permitted routes
      if (allowedAdminRoutes.includes(path) || isRoomRoute) {
        return of(true);
      } else {
        console.log('System Admin attempting to access restricted route:', path);
        this.router.navigate(['/rap']);
        return of(false);
      }
    }

    // Special handling for Cinema Manager (role 2)
    if (currentUser.role === 2) {
      // Check if this is a permitted route for Cinema Manager
      const path = route.routeConfig?.path || '';

      // List of routes permitted for Cinema Manager as per updated requirements
      const allowedManagerRoutes = [
        'theloaiphim', 'phim', 'lichchieu',
        'giaodich', 'thanhtoan', 'thongke',
        'nhanvien', 'banner', 'voucher', 'combo'
      ];

      const isRoomRoute = path.startsWith('room');

      // Check if current route is in the list of permitted routes
      if (allowedManagerRoutes.includes(path) || isRoomRoute) {
        return of(true);
      } else {
        console.log('Cinema Manager attempting to access restricted route:', path);
        this.router.navigate(['/phim']);
        return of(false);
      }
    }

    // Special handling for staff (role 3)
    if (currentUser.role === 3) {
      // Check if this is a permitted route for staff
      const path = route.routeConfig?.path || '';

      // List of routes permitted for staff - only giaodich and thanhtoan
      const allowedStaffRoutes = ['giaodich', 'thanhtoan'];
      const isRoomRoute = path.startsWith('room');

      // Check if current route is in the list of permitted routes
      if (allowedStaffRoutes.includes(path) || isRoomRoute) {
        return of(true);
      } else {
        console.log('Staff attempting to access restricted route:', path);
        this.router.navigate(['/giaodich']);
        return of(false);
      }
    }

    // Quick check if user has appropriate role
    if (requiredRoles.includes(currentUser.role)) {
      return of(true);
    } else {
      // Navigate to appropriate page based on role
      this.navigateToDefaultPage(currentUser.role, state.url);
      return of(false);
    }
  }

  /**
   * Navigate to default page based on user role
   * @param userRole User role ID
   * @param currentUrl Current URL user is trying to access
   */
  private navigateToDefaultPage(userRole: number, currentUrl: string): void {
    // Save current URL for later use if needed
    sessionStorage.setItem('returnUrl', currentUrl);

    switch (userRole) {
      case 4: // System Administrator
        this.router.navigate(['/rap']);
        break;
      case 2: // Cinema Admin
        this.router.navigate(['/phim']);
        break;
      case 3: // Staff
        this.router.navigate(['/giaodich']);
        break;
      case 1: // Regular user
      default:
        // Regular users should not be in admin section
        // Redirect to public home or user dashboard
        this.router.navigate(['/']);
        break;
    }
  }
}
