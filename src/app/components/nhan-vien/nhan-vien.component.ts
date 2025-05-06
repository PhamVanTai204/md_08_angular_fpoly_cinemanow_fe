import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PhanQuyenService } from '../../../shared/services/phanquyen.service';
import { User, UserCreateUpdate, PaginationParams } from '../../../shared/dtos/phanquyenDto.dto';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-nhan-vien',
  standalone: false,
  templateUrl: './nhan-vien.component.html',
  styleUrls: ['./nhan-vien.component.css']
})
export class NhanVienComponent implements OnInit, OnDestroy {
  // ViewChild để tham chiếu đến form
  @ViewChild('userForm') userForm!: NgForm;

  // Danh sách người dùng
  adminUsers: User[] = [];  // Danh sách admin (role 2)
  staffUsers: User[] = [];  // Danh sách nhân viên (role 3)

  // Thông tin phân trang
  adminPagination = {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 5
  };

  staffPagination = {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 5
  };

  // Loading và error states
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Form validation errors
  formErrors = {
    user_name: '',
    email: '',
    password: '',
    url_image: ''
  };

  // Thông tin người dùng đăng nhập
  currentUser: User | null = null;
  isAdmin: boolean = false;  // Xác định người dùng hiện tại có phải admin không

  // Toggle view state
  showAdminView: boolean = true; // Default to showing admin view

  // Form properties
  showForm: boolean = false;
  editMode: boolean = false;
  selectedUser: User | null = null;

  // Thông tin người dùng mới/cập nhật
  newUser: UserCreateUpdate = {
    user_name: '',
    email: '',
    url_image: 'https://play-lh.googleusercontent.com/P0QkMWnVe00FSXsSc2OzkHKqGB9JTMm4sur4XRkBBkFEtO7MEQgoxO6s92LHnJcvdgc',
    role: 3,  // Mặc định là nhân viên
    password: ''
  };

  private subscriptions: Subscription[] = [];

  // Update constructor to include HttpClient
  constructor(
    private phanQuyenService: PhanQuyenService,
    private router: Router,
    private http: HttpClient // Add this line
  ) { }

  ngOnInit(): void {
    // Khi component khởi tạo, kiểm tra thông tin người dùng hiện tại
    this.checkCurrentUser();
  }

  ngOnDestroy(): void {
    // Hủy các subscription khi component bị hủy để tránh memory leak
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Toggle between admin and staff view
  toggleView(): void {
    this.showAdminView = !this.showAdminView;
  }

  // Kiểm tra thông tin người dùng đăng nhập
  checkCurrentUser(): void {
    this.isLoading = true;

    // Kiểm tra localStorage trước để tránh gọi API không cần thiết
    const savedUser = this.phanQuyenService.getSavedCurrentUser();
    if (savedUser) {
      this.currentUser = savedUser;
      this.isAdmin = this.phanQuyenService.isUserAdmin(savedUser);

      if (this.isAdmin) {
        this.loadUsers();  // Nếu là admin, tải danh sách người dùng
      } else {
        this.handleNonAdminAccess();  // Nếu không phải admin, xử lý truy cập trái phép
      }

      this.isLoading = false;
      return;
    }

    // Nếu không có trong localStorage, gọi API
    const sub = this.phanQuyenService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
          this.isAdmin = this.phanQuyenService.isUserAdmin(user);
          this.phanQuyenService.saveCurrentUser(user);

          if (this.isAdmin) {
            this.loadUsers();  // Nếu là admin, tải danh sách người dùng
          } else {
            this.handleNonAdminAccess();  // Nếu không phải admin, xử lý truy cập trái phép
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
        this.errorMessage = 'Lỗi xác thực người dùng';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    });

    this.subscriptions.push(sub);
  }

  // Xử lý trường hợp người dùng không phải admin
  handleNonAdminAccess(): void {
    this.errorMessage = 'Bạn không có quyền truy cập trang này (chỉ admin mới được phép)';
    setTimeout(() => {
      this.router.navigate(['/']);  // Chuyển hướng về trang chủ
    }, 2000);
  }

  // Load danh sách Admin và Nhân viên
  loadUsers(): void {
    this.isLoading = true;
    this.loadAdmins();  // Đầu tiên load danh sách admin
  }

  // Load danh sách Admin (role 2)
  loadAdmins(): void {
    const paginationParams: PaginationParams = {
      page: this.adminPagination.currentPage,
      limit: this.adminPagination.limit
    };

    const sub = this.phanQuyenService.getUsersByRole(2, paginationParams)
      .subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.adminUsers = response.data.users;

            // Cập nhật thông tin phân trang
            this.adminPagination.totalUsers = response.data.totalUsers;
            this.adminPagination.totalPages = response.data.totalPages;

            console.log('Loaded admins:', this.adminUsers.length);
            this.loadStaff();  // Sau khi load xong admin thì load nhân viên
          } else {
            this.errorMessage = 'Không thể tải dữ liệu quản trị viên';
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error loading admins:', error);
          this.errorMessage = 'Lỗi kết nối máy chủ khi tải danh sách quản trị viên';
          this.isLoading = false;
        }
      });

    this.subscriptions.push(sub);
  }

  // Load danh sách Nhân viên (role 3)
  loadStaff(): void {
    const paginationParams: PaginationParams = {
      page: this.staffPagination.currentPage,
      limit: this.staffPagination.limit
    };

    const sub = this.phanQuyenService.getUsersByRole(3, paginationParams)
      .pipe(finalize(() => this.isLoading = false))  // Kết thúc loading state sau khi load xong nhân viên
      .subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.staffUsers = response.data.users;

            // Cập nhật thông tin phân trang
            this.staffPagination.totalUsers = response.data.totalUsers;
            this.staffPagination.totalPages = response.data.totalPages;

            console.log('Loaded staff:', this.staffUsers.length);
          } else {
            this.errorMessage = 'Không thể tải dữ liệu nhân viên';
          }
        },
        error: (error) => {
          console.error('Error loading staff:', error);
          this.errorMessage = 'Lỗi kết nối máy chủ khi tải danh sách nhân viên';
        }
      });

    this.subscriptions.push(sub);
  }

  // Phân trang admin - chuyển đến trang chỉ định
  goToAdminPage(page: number): void {
    if (page < 1 || page > this.adminPagination.totalPages) {
      return;
    }

    this.adminPagination.currentPage = page;
    this.loadAdmins();
  }

  // Phân trang nhân viên - chuyển đến trang chỉ định
  goToStaffPage(page: number): void {
    if (page < 1 || page > this.staffPagination.totalPages) {
      return;
    }

    this.staffPagination.currentPage = page;
    this.loadStaff();
  }

  // Tạo mảng trang cho phân trang
  getPageArray(totalPages: number): number[] {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Khóa/mở khóa tài khoản
  toggleUserStatus(user: User): void {
    // Kiểm tra quyền admin trước khi thực hiện hành động
    if (!this.isAdmin) {
      this.errorMessage = 'Bạn không có quyền thực hiện thao tác này';
      return;
    }

    this.isLoading = true;
    const isActive = user.isActive === false || user.isActive === undefined ? true : false;

    const sub = this.phanQuyenService.updateUserStatus(user._id, isActive)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 200) {
            user.isActive = isActive;  // Cập nhật UI ngay lập tức
            const message = isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản';
            this.successMessage = `${message} cho ${user.user_name}`;

            // Tự động ẩn thông báo thành công sau 3 giây
            setTimeout(() => {
              this.successMessage = '';
            }, 3000);
          } else {
            this.errorMessage = response.error || 'Có lỗi xảy ra khi cập nhật trạng thái';
          }
        },
        error: (error) => {
          console.error('Error toggling user status:', error);
          this.errorMessage = 'Lỗi kết nối máy chủ';
        }
      });

    this.subscriptions.push(sub);
  }

  // Lấy tên vai trò từ id
  getRoleName(roleId: number): string {
    return this.phanQuyenService.getRoleName(roleId);
  }

  // Mở form thêm người dùng mới
  addUser(): void {
    // Kiểm tra quyền admin trước khi mở form thêm người dùng
    if (!this.isAdmin) {
      this.errorMessage = 'Bạn không có quyền thực hiện thao tác này';
      return;
    }

    // Reset form errors
    this.resetFormErrors();

    // Thiết lập form cho thêm mới
    this.editMode = false;
    this.selectedUser = null;
    // Đặt giá trị mặc định cho người dùng mới
    this.newUser = {
      user_name: '',
      email: '',
      url_image: 'https://play-lh.googleusercontent.com/P0QkMWnVe00FSXsSc2OzkHKqGB9JTMm4sur4XRkBBkFEtO7MEQgoxO6s92LHnJcvdgc',
      role: 3,  // Mặc định là nhân viên
      password: ''
    };
    this.showForm = true;  // Hiển thị form
  }

  // Đóng form
  closeForm(): void {
    this.showForm = false;
    this.selectedUser = null;
    this.resetFormErrors();
  }

  // Reset form errors
  resetFormErrors(): void {
    this.formErrors = {
      user_name: '',
      email: '',
      password: '',
      url_image: ''
    };
    this.errorMessage = '';
  }

  // Mở form chỉnh sửa người dùng
  editUser(user: User): void {
    // Kiểm tra quyền admin trước khi mở form chỉnh sửa
    if (!this.isAdmin) {
      this.errorMessage = 'Bạn không có quyền thực hiện thao tác này';
      return;
    }

    // Reset form errors
    this.resetFormErrors();

    // Thiết lập form cho chỉnh sửa
    this.editMode = true;
    this.selectedUser = user;
    // Điền thông tin người dùng hiện tại vào form
    this.newUser = {
      user_name: user.user_name,
      email: user.email,
      url_image: user.url_image || 'https://play-lh.googleusercontent.com/P0QkMWnVe00FSXsSc2OzkHKqGB9JTMm4sur4XRkBBkFEtO7MEQgoxO6s92LHnJcvdgc',
      role: Number(user.role),
      password: ''  // Để trống khi chỉnh sửa
    };
    this.showForm = true;  // Hiển thị form
  }

  // Xóa người dùng
  deleteUser(user: User): void {
    // Kiểm tra quyền admin trước khi thực hiện hành động
    if (!this.isAdmin) {
      this.errorMessage = 'Bạn không có quyền thực hiện thao tác này';
      return;
    }

    // Không cho phép xóa admin hiện tại
    if (this.currentUser && user._id === this.currentUser._id) {
      this.errorMessage = 'Không thể xóa tài khoản đang đăng nhập';
      return;
    }

    // Xác nhận trước khi xóa
    if (confirm(`Bạn có chắc chắn muốn xóa người dùng ${user.user_name}?`)) {
      this.isLoading = true;

      const sub = this.phanQuyenService.deleteUser(user._id)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (response) => {
            if (response.code === 200) {
              this.successMessage = `Đã xóa người dùng ${user.user_name}`;
              this.loadUsers();  // Tải lại danh sách để cập nhật UI

              // Tự động ẩn thông báo thành công sau 3 giây
              setTimeout(() => {
                this.successMessage = '';
              }, 3000);
            } else {
              this.errorMessage = response.error || 'Có lỗi xảy ra khi xóa';
            }
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.errorMessage = 'Lỗi kết nối máy chủ';
          }
        });

      this.subscriptions.push(sub);
    }
  }

  // Format ngày tạo
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }

  // Kiểm tra form hợp lệ
  validateForm(): boolean {
    let isValid = true;
    this.resetFormErrors();

    // Kiểm tra tên người dùng
    if (!this.newUser.user_name) {
      this.formErrors.user_name = 'Tên người dùng không được để trống';
      isValid = false;
    } else if (this.newUser.user_name.length < 3) {
      this.formErrors.user_name = 'Tên người dùng phải có ít nhất 3 ký tự';
      isValid = false;
    }

    // Kiểm tra email
    if (!this.newUser.email) {
      this.formErrors.email = 'Email không được để trống';
      isValid = false;
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(this.newUser.email)) {
        this.formErrors.email = 'Email không hợp lệ';
        isValid = false;
      }
    }

    // Kiểm tra mật khẩu (chỉ bắt buộc khi thêm mới)
    if (!this.editMode) {
      if (!this.newUser.password) {
        this.formErrors.password = 'Mật khẩu không được để trống';
        isValid = false;
      } else if (this.newUser.password.length < 6) {
        this.formErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        isValid = false;
      }
    } else if (this.newUser.password && this.newUser.password.length < 6) {
      // Nếu đang chỉnh sửa và có nhập mật khẩu, kiểm tra độ dài
      this.formErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    // Kiểm tra URL hình ảnh (tùy chọn)
    if (this.newUser.url_image && !this.newUser.url_image.startsWith('http')) {
      this.formErrors.url_image = 'URL hình ảnh phải bắt đầu bằng http:// hoặc https://';
      isValid = false;
    }

    return isValid;
  }

  // Xử lý form submit
onSubmitForm(): void {
  // Kiểm tra quyền admin trước khi thực hiện hành động
  if (!this.isAdmin) {
    this.errorMessage = 'Bạn không có quyền thực hiện thao tác này';
    return;
  }

  // Kiểm tra dữ liệu hợp lệ
  if (!this.validateForm()) {
    return;
  }

  this.isLoading = true;

  if (this.editMode && this.selectedUser) {
    // Chỉnh sửa người dùng hiện có
    const userData: any = {
      user_name: this.newUser.user_name,
      email: this.newUser.email,
      url_image: this.newUser.url_image,
      role: this.newUser.role
    };

    // Chỉ gửi password nếu không trống
    if (this.newUser.password && this.newUser.password.trim() !== '') {
      userData.password = this.newUser.password;
    }

    console.log('Updating user with ID:', this.selectedUser._id);
    console.log('Update data:', userData);

    // Sử dụng PATCH request với đúng endpoint
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.patch(
      `http://127.0.0.1:3000/users/update-profile/${this.selectedUser._id}`,
      userData, 
      { headers: headers }
    ).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.showForm = false;
        
        if (response.code === 200) {
          this.successMessage = `Đã cập nhật thông tin cho ${this.newUser.user_name}`;
          this.loadUsers();  // Tải lại danh sách để cập nhật UI

          // Tự động ẩn thông báo thành công sau 3 giây
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } else {
          this.errorMessage = response.error || 'Có lỗi xảy ra khi cập nhật';
        }
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.errorMessage = 'Lỗi kết nối máy chủ: ' + (error.message || JSON.stringify(error));
        this.isLoading = false;
        this.showForm = false;
      }
    });
  } else {
    // Thêm người dùng mới - không thay đổi
    const newUserData = {
      user_name: this.newUser.user_name,
      email: this.newUser.email,
      password: this.newUser.password,
      url_image: this.newUser.url_image,
      role: this.newUser.role
    };

    const sub = this.phanQuyenService.createUser(newUserData)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.showForm = false;
      }))
      .subscribe({
        next: (response) => {
          if (response && (response.code === 200 || response.data)) {
            this.successMessage = `Đã thêm ${this.newUser.user_name} vào hệ thống`;
            this.loadUsers();  // Tải lại danh sách để cập nhật UI

            // Tự động ẩn thông báo thành công sau 3 giây
            setTimeout(() => {
              this.successMessage = '';
            }, 3000);
          } else {
            this.errorMessage = (response && response.error)
              ? response.error
              : 'Có lỗi xảy ra khi thêm mới';

            setTimeout(() => {
              this.errorMessage = '';
            }, 3000);
          }
        },
        error: (error) => {
          console.error('Error adding user:', error);
          this.errorMessage = 'Lỗi kết nối máy chủ: ' + (error.message || error);

          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
          }
      });

    this.subscriptions.push(sub);
  }
}

}