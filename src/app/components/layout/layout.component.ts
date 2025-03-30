import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class LayoutComponent implements OnInit {
  currentUser: any;
  
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Lấy thông tin người dùng đã đăng nhập
    this.currentUser = this.userService.getCurrentUser();
  }

  logout(): void {
    // Gọi phương thức đăng xuất từ UserService
    this.userService.logout();
  }
}