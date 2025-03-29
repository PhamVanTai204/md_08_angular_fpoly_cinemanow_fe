// nguoi-dung.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Định nghĩa interface cho User
interface User {
  _id: string;
  user_name: string;
  email: string;
  url_image?: string;
  role: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  code: number;
  error: string | null;
  data: User[] | User;
}

@Component({
  selector: 'app-nguoi-dung',
  standalone: false,
  templateUrl: './nguoi-dung.component.html',
  styleUrls: ['./nguoi-dung.component.css']
})
export class NguoiDungComponent implements OnInit {
  // Danh sách người dùng
  users: User[] = [];
  isLoading = false;
  errorMessage = '';
  
  // Dialog properties
  showDialog = false;
  selectedUser: User | null = null;
  
  private baseUrl = 'http://127.0.0.1:3000/users';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // Lấy danh sách người dùng từ API
  loadUsers(): void {
    this.isLoading = true;
    this.http.get<ApiResponse>(`${this.baseUrl}/getAll`).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (response.code === 200 && Array.isArray(response.data)) {
          this.users = response.data;
          this.isLoading = false;
        } else {
          console.error('Định dạng dữ liệu không đúng:', response);
          this.errorMessage = 'Không thể tải dữ liệu người dùng. Định dạng không hợp lệ.';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.';
        this.isLoading = false;
      }
    });
  }

  // Lấy thông tin chi tiết người dùng
  viewUserDetails(userId: string): void {
    this.isLoading = true;
    this.http.get<ApiResponse>(`${this.baseUrl}/getById/${userId}`).subscribe({
      next: (response) => {
        if (response.code === 200 && !Array.isArray(response.data)) {
          this.selectedUser = response.data as User;
          this.showDialog = true;
        } else {
          this.errorMessage = 'Không thể tải thông tin chi tiết người dùng.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user details:', error);
        this.errorMessage = 'Không thể tải thông tin chi tiết người dùng. Vui lòng thử lại sau.';
        this.isLoading = false;
      }
    });
  }

  // Đóng dialog
  closeDialog(): void {
    this.showDialog = false;
    this.selectedUser = null;
  }

  // Lấy tên hiển thị của vai trò
  getRoleName(role: number): string {
    switch (role) {
      case 1:
        return 'Người dùng';
      case 2:
        return 'Admin';
      default:
        return 'Không xác định';
    }
  }

  // Format ngày tạo
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }
}