import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PermissionService } from '../services/permission.service';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.permissionService.hasRole(PermissionService.ROLE_SUPER_ADMIN).pipe(
      map(hasRole => {
        if (hasRole) {
          return true;
        } else {
          // User is not super admin, redirect to home
          this.router.navigate(['/']);
          return false;
        }
      }),
      catchError(error => {
        console.error('Error in super admin guard:', error);
        // Redirect to login page on error
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
        return of(false);
      })
    );
  }
}
