import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class LayoutComponent implements OnInit {
  currentUser: any;
  currentRoute: string = '';
  role: number = 2;
  constructor(
    private userService: UserService,
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
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        this.currentRoute = url.split('/').pop();
      });

    // Navigate to theloaiphim by default if we're at the root path
    if (this.router.url === '/' || this.router.url === '') {
      this.router.navigate(['theloaiphim']);
    }
  }

  // Get role label based on user role number
  getUserRoleLabel(): string {
    if (!this.currentUser) return '';

    switch (this.currentUser.role) {
      case 1:
        return 'Người dùng';
      case 2:
        return 'Quản trị viên';
      case 3:
        return 'Nhân viên rạp';
      default:
        return 'Nhân viên';
    }
  }

  // Handle logout
  logout(): void {
    this.userService.logout();
  }
}