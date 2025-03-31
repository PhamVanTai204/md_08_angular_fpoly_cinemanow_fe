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
  
  constructor(
    private userService: UserService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Lấy thông tin người dùng đã đăng nhập
    this.currentUser = this.userService.getCurrentUser();
    
    // Track current route for navigation highlighting
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        this.currentRoute = url.split('/').pop();
      });
  }
  
  // Xử lý logout
  logout(): void {
    // Gọi phương thức đăng xuất từ UserService
    this.userService.logout();
  }
}