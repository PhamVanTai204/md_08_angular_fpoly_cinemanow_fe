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
  primary?: boolean; // Flag for primary navigation item for a role
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
  userCinema: string | null = null;
  private subscriptions: Subscription[] = [];

  // Updated menu lists based on specific role requirements
  contentMenuItems: MenuItem[] = [
    { path: 'theloaiphim', title: 'Thể loại phim', icon: 'category', roles: [4] },
    { path: 'phim', title: 'Phim', icon: 'movie', roles: [4] },
    { path: 'rap', title: 'Phòng chiếu', icon: 'store', roles: [2, 4], primary: true }, // Title sẽ được dynamic theo role
    { path: 'lichchieu', title: 'Lịch chiếu', icon: 'event', roles: [2] },
    { path: 'danhgia', title: 'Quản lý bình luận', icon: 'reviews', roles: [4] },
  ];

  businessMenuItems: MenuItem[] = [
    { path: 'giaodich', title: 'Đặt vé', icon: 'receipt', roles: [3], primary: true }, // Primary for Staff only
    { path: 'thanhtoan', title: 'Thanh toán', icon: 'credit_card', roles: [2, 3] },
    { path: 'thongke', title: 'Thống kê', icon: 'bar_chart', roles: [2, 4] }
  ];

  userMenuItems: MenuItem[] = [
    { path: 'nhanvien', title: 'Nhân viên', icon: 'badge', roles: [2] },
    //    { path: 'nguoidung', title: 'Người dùng', icon: 'person', roles: [] } // Chỉ role 4 có thể truy cập
    { path: 'adminrap', title: 'Quản lý Admin Rạp', icon: 'manage_accounts', roles: [4] },

  ];

  marketingMenuItems: MenuItem[] = [
    { path: 'banner', title: 'Banner', icon: 'image', roles: [4] },
    { path: 'voucher', title: 'Voucher', icon: 'card_giftcard', roles: [4] },
    { path: 'combo', title: 'Combo', icon: 'fastfood', roles: [4] }
  ];

  constructor(
    private userService: UserService,
    private permissionService: PermissionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Retrieve logged-in user information
    this.currentUser = this.userService.getCurrentUser();
    this.userCinema = this.userService.getCurrentUserCinema();
    console.log('Current user:', this.currentUser);
    console.log('User cinema:', this.userCinema);

    // Redirect to login if no user is found
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Check if user has valid location for their role
    if (!this.validateUserAccessToCinema()) {
      console.error('User does not have access to this cinema');
      this.userService.logout();
      this.router.navigate(['/login'], {
        queryParams: { error: 'cinema-access-denied' }
      });
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

    // Navigate based on role if at root path
    this.navigateBasedOnRole();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Validate that user has appropriate access to their assigned cinema
  validateUserAccessToCinema(): boolean {
    // System admins (role 4) have access to all cinemas
    if (this.currentUser.role === 4) {
      return true;
    }

    // For other roles (cinema manager, staff), check if they have a valid cinema assignment
    if (this.currentUser.role === 2 || this.currentUser.role === 3) {
      // Check if cinema name/location info exists
      if (!this.userCinema && !this.currentUser.cinema_name && !this.currentUser.location) {
        return false;
      }
      return true;
    }

    return false;
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

  // NEW METHOD: Dynamic title based on user role
  getMenuItemTitle(item: MenuItem): string {
    // Nếu là menu 'rap' thì hiển thị title khác nhau theo role
    if (item.path === 'rap') {
      return this.currentUser?.role === 2 ? 'Phòng chiếu' : 'Rạp';
    }
    return item.title;
  }

  // Updated: Route to appropriate pages based on role
  navigateBasedOnRole(): void {
    // Only navigate if we're at the root path
    if (!this.isAtRootPath()) {
      return;
    }

    switch (this.currentUser.role) {
      case 4: // System Administrator
        // System admins should start with cinema management
        this.router.navigate(['/layout/rap']);
        break;

      case 3: // Staff
        // Staff should start with transaction management (giaodich)
        this.router.navigate(['/layout/giaodich']);
        break;

      case 2: // Cinema Manager
        // Cinema Managers should start with cinema management
        this.router.navigate(['/layout/rap']);
        break;

      default:
        // If role is unknown, logout and redirect to login
        this.userService.logout();
        this.router.navigate(['/login']);
    }
  }

  // Get the primary route for the current user role
  getPrimaryMenuItem(): MenuItem | undefined {
    const allMenuItems = [
      ...this.contentMenuItems,
      ...this.businessMenuItems,
      ...this.userMenuItems,
      ...this.marketingMenuItems
    ];

    // First try to find items marked as primary for this role
    const primaryItem = allMenuItems.find(
      item => item.primary && item.roles.includes(this.currentUser.role)
    );

    if (primaryItem) {
      return primaryItem;
    }

    // If no primary item found, fall back to first accessible item
    return allMenuItems.find(item => this.canShowMenuItem(item));
  }

  // Helper to check if we're at the root layout path
  private isAtRootPath(): boolean {
    return this.router.url === '/' || this.router.url === '' || this.router.url === '/layout';
  }

  // Get role label based on user role number with additional cinema info for non-system admins
  getUserRoleLabel(): string {
    if (!this.currentUser) return '';

    let roleLabel = '';
    switch (this.currentUser.role) {
      case 0:
        roleLabel = 'Khách';
        break;
      case 1:
        roleLabel = 'Người dùng';
        break;
      case 2:
        roleLabel = 'Quản trị rạp';
        break;
      case 3:
        roleLabel = 'Nhân viên rạp';
        break;
      case 4:
        roleLabel = 'Quản trị viên hệ thống';
        break;
      default:
        roleLabel = 'Không có vai trò';
    }

    // Add cinema name for non-system admins
    if ((this.currentUser.role === 2 || this.currentUser.role === 3) && this.userCinema) {
      roleLabel += ` (${this.userCinema})`;
    }

    return roleLabel;
  }

  // Handle logout
  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  // Handle image loading errors
  handleImageError(): void {
    if (this.currentUser) {
      this.currentUser.url_image = 'https://play-lh.googleusercontent.com/P0QkMWnVe00FSXsSc2OzkHKqGB9JTMm4sur4XRkBBkFEtO7MEQgoxO6s92LHnJcvdgc';
    }
  }
}