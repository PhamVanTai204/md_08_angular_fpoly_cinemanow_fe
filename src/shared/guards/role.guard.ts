import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
}
from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    // Get allowed roles from route data
    const allowedRoles = route.data['allowedRoles'];
    
    if (!allowedRoles) {
      console.warn('No roles specified for RoleGuard. Denying access by default.');
      this.router.navigate(['/login']);
      return false;
    }
    
    // Convert to array if it's a single role
    const requiredRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    // Get current user from localStorage
    const currentUser = this.userService.getCurrentUser();
    
    // If no user is logged in, redirect to login page
    if (!currentUser) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }
    
    // Get the route path
    const path = route.routeConfig?.path || '';
    const isRoomRoute = path.startsWith('room');
    
    // Check role-specific permissions
    switch (currentUser.role) {
      case UserService.ROLE_SYSTEM_ADMIN: // System Administrator
        // System administrators have access to all routes
        return true;
        
      case UserService.ROLE_CINEMA_ADMIN: // Cinema Manager
        // List of routes permitted for Cinema Manager
        const allowedManagerRoutes = [
          'theloaiphim', 'phim', 'lichchieu', 
          'giaodich', 'thanhtoan', 'thongke',
          'nhanvien', 'banner', 'voucher', 'combo',
          'dondat', 'danhgia'
        ];
        
        if (allowedManagerRoutes.includes(path) || isRoomRoute) {
          return true;
        } else {
          console.log('Cinema Manager attempting to access restricted route:', path);
          this.router.navigate(['/layout/phim']);
          return false;
        }
        
      case UserService.ROLE_STAFF: // Staff
        // List of routes permitted for staff
        const allowedStaffRoutes = [
          'giaodich', 'thanhtoan', 'rap', 'combo', 'voucher'
        ];
        
        if (allowedStaffRoutes.includes(path) || isRoomRoute) {
          return true;
        } else {
          console.log('Staff attempting to access restricted route:', path);
          this.router.navigate(['/layout/giaodich']);
          return false;
        }
      
      default:
        // Unknown role - redirect to login
        this.userService.logout();
        this.router.navigate(['/login']);
        return false;
    }
  }
}