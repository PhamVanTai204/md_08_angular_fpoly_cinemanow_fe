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
    // Lấy danh sách vai trò được phép từ dữ liệu route
    const allowedRoles = route.data['allowedRoles'];

    if (!allowedRoles) {
      console.warn('Không có vai trò nào được chỉ định cho RoleGuard. Từ chối truy cập theo mặc định.');
      this.router.navigate(['/']);
      return of(false);
    }

    // Chuyển đổi thành mảng nếu nó là một vai trò đơn
    const requiredRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Lấy thông tin người dùng hiện tại một cách đồng bộ (để phản hồi nhanh hơn)
    const currentUser = this.userService.getCurrentUser();

    // Nếu không có người dùng đăng nhập, chuyển hướng đến trang đăng nhập
    if (!currentUser) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return of(false);
    }

    // Xử lý đặc biệt cho nhân viên (role 3)
    if (currentUser.role === 3) {
      // Kiểm tra xem đây có phải là các route được phép
      const path = route.routeConfig?.path || '';
      
      // Danh sách các route được phép cho nhân viên
      const allowedStaffRoutes = ['rap', 'giaodich', 'combo', 'voucher'];
      const isRoomRoute = path.startsWith('room');
      
      // Kiểm tra xem route hiện tại có nằm trong danh sách route được phép không
      if (allowedStaffRoutes.includes(path) || isRoomRoute) {
        return of(true);
      } else {
        console.log('Nhân viên đang cố gắng truy cập route bị hạn chế:', path);
        this.router.navigate(['/giaodich']);
        return of(false);
      }
    }

    // Kiểm tra nhanh nếu người dùng có vai trò phù hợp
    if (requiredRoles.includes(currentUser.role)) {
      return of(true);
    } else {
      // Điều hướng đến trang thích hợp dựa trên vai trò
      this.navigateToDefaultPage(currentUser.role, state.url);
      return of(false);
    }
  }

  /**
   * Điều hướng đến trang mặc định dựa trên vai trò người dùng
   * @param userRole ID vai trò của người dùng
   * @param currentUrl URL hiện tại mà người dùng đang cố gắng truy cập
   */
  private navigateToDefaultPage(userRole: number, currentUrl: string): void {
    // Lưu URL hiện tại để sử dụng sau này nếu cần
    sessionStorage.setItem('returnUrl', currentUrl);

    switch (userRole) {
      case 2: // Quản trị viên
        // Quản trị viên có thể chuyển đến theloaiphim mặc định
        this.router.navigate(['/theloaiphim']);
        break;
      case 3: // Nhân viên
        // Nhân viên chỉ có thể chuyển đến giaodich mặc định
        this.router.navigate(['/giaodich']);
        break;
      case 1: // Người dùng thông thường
      default:
        // Người dùng thông thường không nên ở trong phần quản trị
        // Chuyển hướng đến trang chủ công khai hoặc dashboard người dùng
        this.router.navigate(['/']);
        break;
    }
  }
}