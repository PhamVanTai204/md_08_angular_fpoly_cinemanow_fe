import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PhanQuyenService } from '../../../shared/services/phanquyen.service';
import { User, UsersByRoleResponse } from '../../../shared/dtos/phanquyenDto.dto';

@Component({
  selector: 'app-nguoi-dung',
  standalone: false,
  templateUrl: './nguoi-dung.component.html',
  styleUrls: ['./nguoi-dung.component.css'],
})
export class NguoiDungComponent implements OnInit, OnDestroy {
  // Danh sách người dùng thành viên (role 1)
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
  
  // Thông tin người dùng hiện tại
  currentUser: User | null = null;
  
  private subscriptions: Subscription[] = [];
  
  constructor(
    private phanQuyenService: PhanQuyenService,
    private router: Router
  ) { }
  
  ngOnInit(): void {
    this.checkCurrentUser();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  // Kiểm tra thông tin người dùng đăng nhập
  checkCurrentUser(): void {
    this.isLoading = true;
    
    // Kiểm tra localStorage trước
    const savedUser = this.phanQuyenService.getSavedCurrentUser();
    if (savedUser) {
      this.currentUser = savedUser;
      this.loadUsers();
      this.isLoading = false;
      return;
    }
    
    // Nếu không có trong localStorage, gọi API
    const sub = this.phanQuyenService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
          this.phanQuyenService.saveCurrentUser(user);
          this.loadUsers();
        } else {
          this.errorMessage = 'Không thể xác thực người dùng';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error checking current user:', error);
        this.errorMessage = 'Lỗi xác thực người dùng';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    });
    
    this.subscriptions.push(sub);
  }
  
  // Lấy tất cả người dùng thành viên (role 1)
  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.searchTerm = ''; // Reset search when reloading
    
    const sub = this.phanQuyenService.getUsersByRole(1, { page: this.currentPage, limit: this.pageSize })
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: UsersByRoleResponse) => {
          if (response.code === 200) {
            this.users = response.data.users;
            this.filteredUsers = [...this.users];
            this.totalItems = response.data.totalUsers;
            this.totalPages = response.data.totalPages;
            this.updatePagedUsers();
            console.log('Loaded users:', this.users.length);
          } else {
            this.errorMessage = 'Không thể tải dữ liệu người dùng.';
          }
        },
        error: (error) => {
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
    this.loadUsers();
  }
  
  // Cập nhật danh sách người dùng cho trang hiện tại
  updatePagedUsers(): void {
    // Không cần cắt mảng vì API đã trả về dữ liệu đã phân trang
    this.pagedUsers = this.filteredUsers;
  }
  
  // Thay đổi trang
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadUsers();
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
    
    const sub = this.phanQuyenService.getUserById(userId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (user) => {
          if (user) {
            this.selectedUser = user;
            this.showDialog = true;
          } else {
            this.errorMessage = 'Không thể tải thông tin chi tiết người dùng.';
          }
        },
        error: (error) => {
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
  
  // Lấy tên hiển thị của vai trò
  getRoleName(role: number): string {
    return this.phanQuyenService.getRoleName(role);
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