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
  isActive?: boolean;  // Thêm trường này để theo dõi trạng thái
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
          // Thêm trường isActive cho mỗi người dùng (giả định tất cả đều active)
          this.users = response.data.map(user => ({
            ...user,
            isActive: true
          }));
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

  // Hàm khoá/mở khoá tài khoản
  toggleStatus(user: User): void {
    user.isActive = !user.isActive;
    
    // Trong thực tế, bạn sẽ gọi API để cập nhật trạng thái
    // Ví dụ:
    /*
    this.http.patch(`${this.baseUrl}/toggleStatus/${user._id}`, { isActive: user.isActive })
      .subscribe({
        next: (response) => {
          console.log('User status updated:', response);
        },
        error: (error) => {
          console.error('Error updating user status:', error);
          // Khôi phục trạng thái cũ nếu có lỗi
          user.isActive = !user.isActive;
          this.errorMessage = 'Không thể cập nhật trạng thái người dùng. Vui lòng thử lại sau.';
        }
      });
    */
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
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }
}