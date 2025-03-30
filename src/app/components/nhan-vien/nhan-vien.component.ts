import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface User {
  _id?: string;
  userId?: string;
  user_name: string;
  email: string;
  url_image: string;
  role: number;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  phone?: string;
}

interface ApiResponse {
  code: number;
  error: string | null;
  data: User[] | User;
}

@Component({
  selector: 'app-nhan-vien',
  standalone: false,
  templateUrl: './nhan-vien.component.html',
  styleUrls: ['./nhan-vien.component.css'],
})
export class NhanVienComponent implements OnInit {
  // Các thuộc tính
  nhanViens: User[] = [];
  adminUsers: User[] = [];
  staffUsers: User[] = [];
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  
  // Thông tin người dùng đăng nhập
  currentUser: User | null = null;
  isAdmin: boolean = false; // Người dùng hiện tại có phải là admin không
  currentUserId: string = ''; // ID của người dùng hiện tại
  
  // Form properties
  showForm: boolean = false;
  editMode: boolean = false;
  selectedUser: User | null = null;
  
  // Thông tin người dùng mới
  newUser = {
    user_name: '',
    email: '',
    url_image: '',
    role: 3, // Mặc định là nhân viên
    phone: '',
    password: '' // Thêm trường password cho việc tạo mới
  };
  
  private baseUrl = 'http://127.0.0.1:3000';
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkCurrentUser();
  }

  // Lấy headers với token xác thực
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Lấy ID từ user - xử lý cả trường hợp _id và userId
  private getUserId(user: User): string {
    return user._id || user.userId || '';
  }

  // Kiểm tra thông tin người dùng đăng nhập hiện tại
  checkCurrentUser(): void {
    this.isLoading = true;
    
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.errorMessage = 'Vui lòng đăng nhập để truy cập trang này';
      this.isLoading = false;
      // Chuyển hướng về trang đăng nhập sau 2 giây
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }
    
    // Thử lấy thông tin người dùng từ localStorage trước
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const userFromStorage = JSON.parse(userStr);
        // Kiểm tra dữ liệu có đủ thông tin không
        if (userFromStorage && userFromStorage.role !== undefined) {
          this.currentUser = userFromStorage;
          this.isAdmin = Number(userFromStorage.role) === 2;
          
          // Lấy userId từ bất kỳ trường nào có sẵn
          this.currentUserId = this.getUserId(userFromStorage);
          
          console.log('Người dùng hiện tại từ localStorage:', this.currentUser);
          console.log('Role:', userFromStorage.role, 'isAdmin:', this.isAdmin);
          console.log('User ID (từ _id hoặc userId):', this.currentUserId);
          
          if (this.isAdmin) {
            this.loadUsers();
            this.isLoading = false;
            return;
          } else {
            this.errorMessage = 'Bạn không có quyền truy cập trang này';
            this.isLoading = false;
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 2000);
            return;
          }
        }
      } catch (e) {
        console.error('Lỗi khi parse dữ liệu người dùng từ localStorage:', e);
      }
    }
    
    // Nếu không có dữ liệu từ localStorage hoặc dữ liệu không hợp lệ, gọi API
    this.http.get<ApiResponse>(`${this.baseUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        if (response && response.code === 200 && response.data) {
          let userData = Array.isArray(response.data) ? response.data[0] : response.data;
          this.currentUser = userData;
          
          // Đảm bảo role là số
          const userRole = Number(userData.role);
          this.isAdmin = userRole === 2;
          
          // Lấy userId từ bất kỳ trường nào có sẵn
          this.currentUserId = this.getUserId(userData);
          
          console.log('Người dùng hiện tại từ API:', this.currentUser);
          console.log('Role:', userRole, 'isAdmin:', this.isAdmin);
          console.log('User ID (từ _id hoặc userId):', this.currentUserId);
          
          if (this.isAdmin) {
            // Nếu là admin, tải danh sách người dùng
            this.loadUsers();
          } else {
            // Nếu không phải admin, hiển thị thông báo và chuyển hướng
            this.errorMessage = 'Bạn không có quyền truy cập trang này (chỉ admin mới được phép)';
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 2000);
          }
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
        this.errorMessage = 'Lỗi xác thực người dùng: ' + (error.message || 'Không thể kết nối tới máy chủ');
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    });
  }

  // Load danh sách người dùng
  loadUsers(): void {
    this.isLoading = true;
    const headers = this.getHeaders();
    
    this.http.get<ApiResponse>(`${this.baseUrl}/users/getAll`, { headers }).subscribe({
      next: (response) => {
        if (response.code === 200 && Array.isArray(response.data)) {
          this.nhanViens = response.data;
          
          // Phân loại theo vai trò
          if (this.currentUserId) {
            // Lọc admin, loại bỏ admin hiện tại dựa vào userId
            this.adminUsers = this.nhanViens.filter(user => {
              const userId = this.getUserId(user);
              return Number(user.role) === 2 && userId !== this.currentUserId;
            });
          } else {
            this.adminUsers = this.nhanViens.filter(user => Number(user.role) === 2);
          }
          
          // Lọc nhân viên
          this.staffUsers = this.nhanViens.filter(user => Number(user.role) === 3);
          
          console.log('Tổng số người dùng:', this.nhanViens.length);
          console.log('Số lượng admin (trừ admin hiện tại):', this.adminUsers.length);
          console.log('Số lượng nhân viên:', this.staffUsers.length);
        } else {
          this.errorMessage = response.error || 'Có lỗi xảy ra khi tải dữ liệu';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Lỗi kết nối máy chủ: ' + (error.message || 'Không thể kết nối');
        this.isLoading = false;
      }
    });
  }

  // Khóa/mở khóa tài khoản
  toggleUserStatus(user: User): void {
    // Kiểm tra quyền admin
    if (!this.isAdmin) {
      this.errorMessage = 'Bạn không có quyền thực hiện thao tác này';
      return;
    }
    
    this.isLoading = true;
    const headers = this.getHeaders();
    const userId = this.getUserId(user);
    
    this.http.put<ApiResponse>(`${this.baseUrl}/users/updateStatus/${userId}`, {
      isActive: !user.isActive
    }, { headers }).subscribe({
      next: (response) => {
        if (response.code === 200) {
          user.isActive = !user.isActive;
          const message = user.isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản';
          this.successMessage = `${message} cho ${user.user_name}`;
        } else {
          this.errorMessage = response.error || 'Có lỗi xảy ra khi cập nhật trạng thái';
        }
        this.isLoading = false;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
        this.errorMessage = 'Lỗi kết nối máy chủ';
        this.isLoading = false;
      }
    });
  }
  
  // Lấy tên vai trò từ id
  getRoleName(roleId: number): string {
    switch(Number(roleId)) {
      case 2: return 'Admin';
      case 3: return 'Nhân viên';
      case 1: return 'Thành viên';
      case 0: return 'Khách';
      default: return 'Không xác định';
    }
  }
  
  // Mở form thêm người dùng mới
  addUser(): void {
    // Kiểm tra quyền admin
    if (!this.isAdmin) {
      this.errorMessage = 'Bạn không có quyền thực hiện thao tác này';
      return;
    }
    
    this.editMode = false;
    this.selectedUser = null;
    this.newUser = {
      user_name: '',
      email: '',
      url_image: '',
      role: 3, // Mặc định là nhân viên
      phone: '',
      password: ''
    };
    this.showForm = true;
  }
  
  // Đóng form
  closeForm(): void {
    this.showForm = false;
    this.selectedUser = null;
  }
  
  // Mở form chỉnh sửa người dùng
  editUser(user: User): void {
    // Kiểm tra quyền admin
    if (!this.isAdmin) {
      this.errorMessage = 'Bạn không có quyền thực hiện thao tác này';
      return;
    }
    
    this.editMode = true;
    this.selectedUser = user;
    this.newUser = {
      user_name: user.user_name,
      email: user.email,
      url_image: user.url_image || '',
      role: Number(user.role),
      phone: user.phone || '',
      password: '' // Để trống khi chỉnh sửa
    };
    this.showForm = true;
  }
  
  // Xử lý form submit
  onSubmitForm(): void {
    // Kiểm tra quyền admin
    if (!this.isAdmin) {
      this.errorMessage = 'Bạn không có quyền thực hiện thao tác này';
      return;
    }
    
    // Kiểm tra dữ liệu nhập
    if (!this.newUser.user_name || !this.newUser.email) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin';
      return;
    }
    
    // Khi thêm mới, password là bắt buộc
    if (!this.editMode && !this.newUser.password) {
      this.errorMessage = 'Vui lòng nhập mật khẩu';
      return;
    }
    
    this.isLoading = true;
    const headers = this.getHeaders();
    
    if (this.editMode && this.selectedUser) {
      // Chỉnh sửa người dùng hiện có
      const updateData: any = {
        user_name: this.newUser.user_name,
        email: this.newUser.email,
        url_image: this.newUser.url_image,
        role: this.newUser.role,
        phone: this.newUser.phone
      };
      
      // Chỉ gửi password nếu có nhập
      if (this.newUser.password) {
        updateData.password = this.newUser.password;
      }
      
      const userId = this.getUserId(this.selectedUser);
      
      this.http.put<ApiResponse>(`${this.baseUrl}/users/update/${userId}`, updateData, 
        { headers }).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.successMessage = `Đã cập nhật thông tin cho ${this.newUser.user_name}`;
            this.loadUsers(); // Tải lại danh sách
          } else {
            this.errorMessage = response.error || 'Có lỗi xảy ra khi cập nhật';
          }
          this.isLoading = false;
          this.showForm = false;
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.errorMessage = 'Lỗi kết nối máy chủ';
          this.isLoading = false;
        }
      });
    } else {
      // Thêm người dùng mới
      this.http.post<ApiResponse>(`${this.baseUrl}/users/insert`, this.newUser, 
        { headers }).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.successMessage = `Đã thêm ${this.newUser.user_name} vào hệ thống`;
            this.loadUsers(); // Tải lại danh sách
          } else {
            this.errorMessage = response.error || 'Có lỗi xảy ra khi thêm mới';
          }
          this.isLoading = false;
          this.showForm = false;
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Error adding user:', error);
          this.errorMessage = 'Lỗi kết nối máy chủ';
          this.isLoading = false;
        }
      });
    }
  }
  
  // Xóa người dùng
  deleteUser(user: User): void {
    // Kiểm tra quyền admin
    if (!this.isAdmin) {
      this.errorMessage = 'Bạn không có quyền thực hiện thao tác này';
      return;
    }
    
    if(confirm(`Bạn có chắc chắn muốn xóa người dùng ${user.user_name}?`)) {
      this.isLoading = true;
      const headers = this.getHeaders();
      const userId = this.getUserId(user);
      
      this.http.delete<ApiResponse>(`${this.baseUrl}/users/delete/${userId}`, { headers }).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.successMessage = `Đã xóa người dùng ${user.user_name}`;
            this.loadUsers(); // Tải lại danh sách
          } else {
            this.errorMessage = response.error || 'Có lỗi xảy ra khi xóa';
          }
          this.isLoading = false;
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.errorMessage = 'Lỗi kết nối máy chủ';
          this.isLoading = false;
        }
      });
    }
  }
}