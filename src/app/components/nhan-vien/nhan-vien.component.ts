// nhan-vien.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Định nghĩa interface cho API response
interface ApiResponse {
  code: number;
  error: string | null;
  data: User[];
}

// Định nghĩa interface cho User từ API
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

// Định nghĩa interface cho NhanVien (đã chuyển đổi từ User)
interface NhanVien {
  _id: string;
  avatar: string;
  fullName: string;
  email: string;
  phone: string;  // Sẽ hiển thị "N/A" vì API không có trường này
  role: string;
  isActive: boolean;
}

@Component({
  selector: 'app-nhan-vien',
  standalone: false,
  templateUrl: './nhan-vien.component.html',
  styleUrls: ['./nhan-vien.component.css']
})
export class NhanVienComponent implements OnInit {
  nhanViens: NhanVien[] = [];
  isLoading = false;
  errorMessage = '';
  private baseUrl = 'http://127.0.0.1:3000/users';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadNhanVien();
  }

  // Lấy danh sách nhân viên (role = 2) từ API
  loadNhanVien(): void {
    this.isLoading = true;
    this.http.get<ApiResponse>(`${this.baseUrl}/getAll`).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (response.code === 200 && Array.isArray(response.data)) {
          // Lọc người dùng có role = 2 (Admin) và chuyển đổi thành NhanVien
          this.nhanViens = response.data
            .filter(user => user.role === 2)
            .map(user => ({
              _id: user._id,
              avatar: user.url_image || 'https://via.placeholder.com/40',
              fullName: user.user_name,
              email: user.email,
              phone: 'N/A',  // API không có số điện thoại
              role: 'Admin', // Role = 2 tương ứng với Admin
              isActive: true // Mặc định active
            }));
          this.isLoading = false;
        } else {
          console.error('Định dạng dữ liệu không đúng:', response);
          this.errorMessage = 'Không thể tải dữ liệu nhân viên. Định dạng không hợp lệ.';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading staff:', error);
        this.errorMessage = 'Không thể tải dữ liệu nhân viên. Vui lòng thử lại sau.';
        this.isLoading = false;
      }
    });
  }

  // Hàm khóa/mở khóa tài khoản
  toggleNhanVienStatus(nv: NhanVien): void {
    nv.isActive = !nv.isActive;
    
    // Trong thực tế, sẽ gọi API để cập nhật trạng thái
    // Ví dụ:
    /*
    this.http.patch(`${this.baseUrl}/toggleStatus/${nv._id}`, { isActive: nv.isActive })
      .subscribe({
        next: (response) => {
          console.log('Staff status updated:', response);
        },
        error: (error) => {
          console.error('Error updating staff status:', error);
          // Khôi phục trạng thái cũ nếu có lỗi
          nv.isActive = !nv.isActive;
          this.errorMessage = 'Không thể cập nhật trạng thái nhân viên. Vui lòng thử lại sau.';
        }
      });
    */
  }
}