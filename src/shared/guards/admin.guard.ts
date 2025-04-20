import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PhanQuyenService } from '../services/phanquyen.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private phanQuyenService: PhanQuyenService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Lấy vai trò yêu cầu từ route data, mặc định là admin (role 2)
    const requiredRole = route.data['requiredRole'] || 2;
    
    // Kiểm tra trong localStorage trước
    const savedUser = this.phanQuyenService.getSavedCurrentUser();
    if (savedUser) {
      const userRole = Number(savedUser.role);
      if (userRole === requiredRole) {
        return true;
      } else {
        // Chuyển hướng về trang home nếu không đủ quyền
        this.router.navigate(['/']);
        return false;
      }
    }

    // Nếu không có trong localStorage, gọi API để lấy thông tin người dùng
    return this.phanQuyenService.getCurrentUser().pipe(
      map(user => {
        if (user) {
          // Lưu thông tin người dùng vào localStorage
          this.phanQuyenService.saveCurrentUser(user);
          
          // Kiểm tra quyền
          const userRole = Number(user.role);
          if (userRole === requiredRole) {
            return true;
          } else {
            // Chuyển hướng về trang home nếu không đủ quyền
            this.router.navigate(['/']);
            return false;
          }
        } else {
          // Chuyển hướng về trang đăng nhập
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: state.url }
          });
          return false;
        }
      }),
      catchError(error => {
        console.error('Error in admin guard:', error);
        // Chuyển hướng về trang đăng nhập
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
        return of(false);
      })
    );
  }
}