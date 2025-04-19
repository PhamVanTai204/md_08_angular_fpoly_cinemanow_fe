import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PhanQuyenService } from '../services/phanquyen.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private phanQuyenService: PhanQuyenService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Kiểm tra trong localStorage trước
    const savedUser = this.phanQuyenService.getSavedCurrentUser();
    if (savedUser) {
      return true;
    }

    // Nếu không có trong localStorage, gọi API để lấy thông tin người dùng
    return this.phanQuyenService.getCurrentUser().pipe(
      map(user => {
        if (user) {
          // Lưu thông tin người dùng vào localStorage
          this.phanQuyenService.saveCurrentUser(user);
          return true;
        } else {
          // Chuyển hướng về trang đăng nhập
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: state.url }
          });
          return false;
        }
      }),
      catchError(error => {
        console.error('Error in auth guard:', error);
        // Chuyển hướng về trang đăng nhập
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
        return of(false);
      })
    );
  }
}