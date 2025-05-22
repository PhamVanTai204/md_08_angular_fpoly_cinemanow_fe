import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PermissionService } from '../services/permission.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Get required role from route data, default to cinema admin (role 2)
    const requiredRole = route.data['requiredRole'] || PermissionService.ROLE_ADMIN;

    return this.permissionService.hasRole(requiredRole).pipe(
      map(hasRole => {
        if (hasRole) {
          return true;
        } else {
          // Check if user is system admin, which can access any admin routes
          return this.permissionService.isSystemAdmin().toPromise();
        }
      }),
      map(hasAccess => {
        if (hasAccess) {
          return true;
        } else {
          // User does not have required role, redirect to home
          this.router.navigate(['/']);
          return false;
        }
      }),
      catchError(error => {
        console.error('Error in admin guard:', error);
        // Redirect to login page on error
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
        return of(false);
      })
    );
  }
}