import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { PermissionService } from '../../../shared/services/permission.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

interface MenuItem {
  path: string;
  title: string;
  icon: string;
  roles: number[]; // Roles allowed to view this menu
}

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class LayoutComponent implements OnInit, OnDestroy {
  currentUser: any;
  currentRoute: string = '';
  private subscriptions: Subscription[] = [];

  // Menu lists grouped by category
  contentMenuItems: MenuItem[] = [
    { path: 'theloaiphim', title: 'Thể loại phim', icon: 'category', roles: [2, 4] },
    { path: 'phim', title: 'Phim', icon: 'movie', roles: [2, 4] },
    { path: 'rap', title: 'Rạp', icon: 'store', roles: [2, 3, 4] }, // Rap is visible to staff, admin, and system admin
    { path: 'lichchieu', title: 'Lịch chiếu', icon: 'event', roles: [2, 4] },
    { path: 'danhgia', title: 'Đánh giá phim', icon: 'reviews', roles: [2, 4] },
  ];

  businessMenuItems: MenuItem[] = [
    { path: 'giaodich', title: 'Đặt vé', icon: 'receipt', roles: [2, 3, 4] },
    { path: 'thanhtoan', title: 'Thanh toán', icon: 'credit_card', roles: [2, 4] },
    { path: 'thongke', title: 'Thống kê', icon: 'bar_chart', roles: [2, 4] }
  ];

  userMenuItems: MenuItem[] = [
    { path: 'nhanvien', title: 'Nhân viên', icon: 'badge', roles: [2, 4] },
    { path: 'nguoidung', title: 'Người dùng', icon: 'person', roles: [2, 4] }
  ];

  marketingMenuItems: MenuItem[] = [
    { path: 'banner', title: 'Banner', icon: 'image', roles: [2, 4] },
    { path: 'voucher', title: 'Voucher', icon: 'card_giftcard', roles: [2, 3, 4] },
    { path: 'combo', title: 'Combo', icon: 'fastfood', roles: [2, 3, 4] }
  ];

  constructor(
    private userService: UserService,
    private permissionService: PermissionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Retrieve logged-in user information
    this.currentUser = this.userService.getCurrentUser();
    console.log('Current user:', this.currentUser);

    // Redirect to login if no user is found
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Track current route for navigation highlighting
    const routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        this.currentRoute = url.split('/').pop();
      });

    this.subscriptions.push(routeSub);

    // Find first accessible menu item for this user
    this.navigateToFirstAccessibleRoute();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Check if menu can be displayed for current role
  canShowMenuItem(item: MenuItem): boolean {
    const userRole = this.currentUser?.role;
    if (!userRole) return false;
    return item.roles.includes(userRole);
  }

  // Check if any items in a menu group are viewable
  hasViewableItems(menuItems: MenuItem[]): boolean {
    if (!this.currentUser) return false;
    const userRole = this.currentUser.role;
    return menuItems.some(item => item.roles.includes(userRole));
  }

  // Navigate to the first accessible route for the current user
  navigateToFirstAccessibleRoute(): void {
    // Special handling for staff role (role 3)
    if (this.currentUser?.role === 3) {
      // Only navigate if we're at the root path
      if (this.router.url === '/' || this.router.url === '' || this.router.url === '/layout') {
        this.router.navigate(['giaodich']);
      }
      return;
    }

    // For all other roles
    const allMenuItems = [
      ...this.contentMenuItems,
      ...this.businessMenuItems,
      ...this.userMenuItems,
      ...this.marketingMenuItems
    ];

    const firstAccessibleItem = allMenuItems.find(item => this.canShowMenuItem(item));

    if (firstAccessibleItem) {
      if (this.router.url === '/' || this.router.url === '' || this.router.url === '/layout') {
        this.router.navigate([firstAccessibleItem.path]);
      }
    } else {
      this.userService.logout();
      this.router.navigate(['/login']);
    }
  }

  // Get role label based on user role number
  getUserRoleLabel(): string {
    if (!this.currentUser) return '';

    switch (this.currentUser.role) {
      case 0:
        return 'Khách';
      case 1:
        return 'Người dùng';
      case 2:
        return 'Quản trị rạp';
      case 3:
        return 'Nhân viên rạp';
      case 4: 
        return 'Quản trị viên hệ thống';
      default:
        return 'Không có vai trò';
    }
  }

  // Handle logout
  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}