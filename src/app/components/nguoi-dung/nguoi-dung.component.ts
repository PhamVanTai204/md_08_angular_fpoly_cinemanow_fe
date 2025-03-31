import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// Định nghĩa interface cho User
export interface User {
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
  templateUrl: './nguoi-dung.component.html',
  styleUrls: ['./nguoi-dung.component.css'],
  standalone: false
})
export class NguoiDungComponent implements OnInit, OnDestroy {
  // Danh sách người dùng
  users: User[] = [];
  filteredUsers: User[] = [];
  pagedUsers: User[] = [];
  
  // Loading và error states
  isLoading = false;
  errorMessage = '';
  
  // Tìm kiếm
  searchTerm: string = '';
  
  // Phân trang
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;
  
  // Dialog properties
  showDialog = false;
  selectedUser: User | null = null;
  
  private baseUrl = 'http://127.0.0.1:3000/users';
  private subscriptions: Subscription[] = [];
  
  constructor(private http: HttpClient) { }
  
  ngOnInit(): void {
    this.loadAllUsers();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  // Lấy tất cả người dùng
  loadAllUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.searchTerm = ''; // Reset search when reloading
    
    const sub = this.http.get<ApiResponse>(`${this.baseUrl}/getAll`)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 200 && Array.isArray(response.data)) {
            // Lọc người dùng có role=1
            this.users = response.data.filter(user => user.role === 1);
            this.filteredUsers = [...this.users];
            this.totalItems = this.filteredUsers.length;
            this.calculateTotalPages();
            this.updatePagedUsers();
            console.log('Loaded users:', this.users.length);
          } else {
            this.errorMessage = 'Không thể tải dữ liệu người dùng.';
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading users:', error);
          this.errorMessage = 'Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.';
        }
      });
    
    this.subscriptions.push(sub);
  }
  
  // Tìm kiếm người dùng
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredUsers = this.users.filter(user => 
        user.user_name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      );
    }
    
    this.totalItems = this.filteredUsers.length;
    this.calculateTotalPages();
    this.currentPage = 1; // Reset to first page when searching
    this.updatePagedUsers();
  }
  
  // Thay đổi kích thước trang
  onPageSizeChange(): void {
    this.calculateTotalPages();
    this.currentPage = 1; // Reset to first page
    this.updatePagedUsers();
  }
  
  // Cập nhật danh sách người dùng cho trang hiện tại
  updatePagedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.filteredUsers.length);
    this.pagedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }
  
  // Thay đổi trang
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagedUsers();
  }
  
  // Tính tổng số trang
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
  }
  
  // Lấy thông tin chi tiết người dùng
  viewUserDetails(userId: string): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const sub = this.http.get<ApiResponse>(`${this.baseUrl}/getById/${userId}`)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 200 && !Array.isArray(response.data)) {
            this.selectedUser = response.data as User;
            this.showDialog = true;
          } else {
            this.errorMessage = 'Không thể tải thông tin chi tiết người dùng.';
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading user details:', error);
          this.errorMessage = 'Không thể tải thông tin chi tiết người dùng. Vui lòng thử lại sau.';
        }
      });
    
    this.subscriptions.push(sub);
  }
  
  // Đóng dialog
  closeDialog(): void {
    this.showDialog = false;
    setTimeout(() => this.selectedUser = null, 300);
  }
  
  // Tạo mảng phân trang
  getPaginationArray(): number[] {
    const pagination: number[] = [];
    
    if (this.totalPages <= 7) {
      // Nếu có ít hơn hoặc bằng 7 trang, hiển thị tất cả
      for (let i = 1; i <= this.totalPages; i++) {
        pagination.push(i);
      }
    } else {
      // Luôn hiển thị trang đầu tiên
      pagination.push(1);
      
      // Nếu trang hiện tại > 3, thêm dấu ...
      if (this.currentPage > 3) {
        pagination.push(-1); // -1 sẽ được hiển thị dưới dạng ...
      }
      
      // Xác định trang bắt đầu và kết thúc để hiển thị
      let startPage = Math.max(2, this.currentPage - 1);
      let endPage = Math.min(this.totalPages - 1, this.currentPage + 1);
      
      // Đảm bảo luôn hiển thị 3 trang liên tiếp
      if (endPage - startPage < 2) {
        if (this.currentPage < this.totalPages / 2) {
          endPage = Math.min(this.totalPages - 1, startPage + 2);
        } else {
          startPage = Math.max(2, endPage - 2);
        }
      }
      
      // Thêm các trang ở giữa
      for (let i = startPage; i <= endPage; i++) {
        pagination.push(i);
      }
      
      // Nếu trang hiện tại < totalPages - 2, thêm dấu ...
      if (this.currentPage < this.totalPages - 2) {
        pagination.push(-1); // -1 sẽ được hiển thị dưới dạng ...
      }
      
      // Luôn hiển thị trang cuối cùng
      pagination.push(this.totalPages);
    }
    
    return pagination;
  }
  
  // Lấy tên hiển thị của vai trò
  getRoleName(role: number): string {
    switch (role) {
      case 1: return 'Người dùng';
      case 2: return 'Admin';
      default: return 'Không xác định';
    }
  }
  
  // Format ngày tạo
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }
  
  // Format giờ
  formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  
  // Rút gọn ID
  truncateId(id: string): string {
    if (!id) return '';
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  }
  
  // Lấy index bắt đầu của người dùng trên trang hiện tại
  getStartIndex(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }
  
  // Lấy index kết thúc của người dùng trên trang hiện tại
  getEndIndex(): number {
    return Math.min(this.getStartIndex() + this.pageSize - 1, this.totalItems);
  }
}