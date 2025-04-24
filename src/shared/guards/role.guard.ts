// src/shared/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PermissionService } from '../services/permission.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Get roles from route data
    // This can be a single role or an array of roles
    const allowedRoles = route.data['allowedRoles'];
    
    if (!allowedRoles) {
      console.warn('No roles specified for RoleGuard. Denying access by default.');
      this.router.navigate(['/']);
      return of(false);
    }
    
    // Convert to array if it's a single role
    const requiredRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    return this.permissionService.hasPermission(requiredRoles).pipe(
      map(hasPermission => {
        if (hasPermission) {
          return true;
        } else {
          // Check if user is logged in but doesn't have permission
          this.permissionService.getCurrentUser().subscribe(user => {
            if (user) {
              // User is logged in but doesn't have permission
              // Redirect to unauthorized page or home
              this.router.navigate(['/']);
            } else {
              // User is not logged in
              this.router.navigate(['/login'], {
                queryParams: { returnUrl: state.url }
              });
            }
          });
          
          return false;
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
}