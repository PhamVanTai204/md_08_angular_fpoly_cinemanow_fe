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

  // Danh sách người dùng - CHỈ KHAI BÁO 1 LẦN
  staffUsers: User[] = [];  // Danh sách nhân viên hiển thị (sau phân trang)
  allStaffUsers: User[] = [];  // Toàn bộ nhân viên cùng location

  // Thông tin phân trang chỉ cho nhân viên
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
  isAdmin: boolean = false;

  // Form properties
  showForm: boolean = false;
  editMode: boolean = false;
  selectedUser: User | null = null;

  // Thông tin người dùng mới/cập nhật
  newUser: UserCreateUpdate = {
    user_name: '',
    email: '',
    url_image: 'https://play-lh.googleusercontent.com/P0QkMWnVe00FSXsSc2OzkHKqGB9JTMm4sur4XRkBBkFEtO7MEQgoxO6s92LHnJcvdgc',
    role: 3,  // Cố định là nhân viên
    password: '',
    location: ''
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private phanQuyenService: PhanQuyenService,
    private router: Router,
    private http: HttpClient
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

    const savedUser = this.phanQuyenService.getSavedCurrentUser();
    if (savedUser) {
      this.currentUser = savedUser;
      this.isAdmin = this.phanQuyenService.isUserAdmin(savedUser);

      if (this.isAdmin) {
        this.loadStaffUsers();
      } else {
        this.handleNonAdminAccess();
      }

      this.isLoading = false;
      return;
    }

    const sub = this.phanQuyenService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
          this.isAdmin = this.phanQuyenService.isUserAdmin(user);
          this.phanQuyenService.saveCurrentUser(user);

          console.log('Current user cinema:', user.cinema_name);

          if (this.isAdmin) {
            this.loadStaffUsers();
          } else {
            this.handleNonAdminAccess();
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
      this.router.navigate(['/']);
    }, 2000);
  }

  // Load danh sách Nhân viên (role 3) và filter theo cinema_name
  loadStaffUsers(): void {
    this.isLoading = true;
    
    if (!this.currentUser?.cinema_name) {
      this.errorMessage = 'Không thể xác định rạp của bạn';
      this.isLoading = false;
      return;
    }

    const paginationParams: PaginationParams = {
      page: 1,
      limit: 1000
    };

    const sub = this.phanQuyenService.getUsersByRole(3, paginationParams)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (response.code === 200) {
            const allStaff = response.data.users || [];
            console.log('All staff from API:', allStaff);
            console.log('Current user cinema_name:', this.currentUser?.cinema_name);
            
            this.allStaffUsers = allStaff.filter(user => {
              console.log('Checking user location:', user.location, 'vs cinema_name:', this.currentUser?.cinema_name);
              return user.location === this.currentUser?.cinema_name;
            });

            this.staffPagination.totalUsers = this.allStaffUsers.length;
            this.staffPagination.totalPages = Math.ceil(this.allStaffUsers.length / this.staffPagination.limit);

            this.applyClientSidePagination();

            console.log('Loaded staff for cinema:', this.currentUser?.cinema_name, 'Total:', this.allStaffUsers.length);
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

  // Áp dụng phân trang client-side
  applyClientSidePagination(): void {
    const startIndex = (this.staffPagination.currentPage - 1) * this.staffPagination.limit;
    const endIndex = startIndex + this.staffPagination.limit;
    this.staffUsers = this.allStaffUsers.slice(startIndex, endIndex);
  }

  // Phân trang nhân viên
  goToStaffPage(page: number): void {
    if (page < 1 || page > this.staffPagination.totalPages) {
      return;
    }

    this.staffPagination.currentPage = page;
    this.applyClientSidePagination();
  }

  // Tạo mảng trang cho phân trang
  getPageArray(totalPages: number): number[] {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Lấy tên vai trò từ id
  getRoleName(roleId: number): string {
    return this.phanQuyenService.getRoleName(roleId);
  }

  // Mở form thêm người dùng mới
  addUser(): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Bạn không có quyền thực hiện thao tác này';
      return;
    }

    if (!this.currentUser?.cinema_name) {
      this.errorMessage = 'Không thể xác định rạp của bạn';
      return;
    }

    this.resetFormErrors();

    this.editMode = false;
    this.selectedUser = null;
    this.newUser = {
      user_name: '',
      email: '',
      url_image: 'https://play-lh.googleusercontent.com/P0QkMWnVe00FSXsSc2OzkHKqGB9JTMm4sur4XRkBBkFEtO7MEQgoxO6s92LHnJcvdgc',
      role: 3,
      password: '',
      location: this.currentUser.cinema_name
    };
    this.showForm = true;
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
    if (!this.isAdmin) {
      this.errorMessage = 'Bạn không có quyền thực hiện thao tác này';
      return;
    }

    this.resetFormErrors();

    this.editMode = true;
    this.selectedUser = user;
    this.newUser = {
      user_name: user.user_name,
      email: user.email,
      url_image: user.url_image || 'https://play-lh.googleusercontent.com/P0QkMWnVe00FSXsSc2OzkHKqGB9JTMm4sur4XRkBBkFEtO7MEQgoxO6s92LHnJcvdgc',
      role: 3,
      password: '',
      location: this.currentUser?.cinema_name || ''
    };
    this.showForm = true;
  }

  // Xóa người dùng
  deleteUser(user: User): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Bạn không có quyền thực hiện thao tác này';
      return;
    }

    if (this.currentUser && user._id === this.currentUser._id) {
      this.errorMessage = 'Không thể xóa tài khoản đang đăng nhập';
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa nhân viên ${user.user_name}?`)) {
      this.isLoading = true;

      const sub = this.phanQuyenService.deleteUser(user._id)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (response) => {
            if (response.code === 200) {
              this.successMessage = `Đã xóa nhân viên ${user.user_name}`;
              this.loadStaffUsers();

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

    if (!this.newUser.user_name) {
      this.formErrors.user_name = 'Tên người dùng không được để trống';
      isValid = false;
    } else if (this.newUser.user_name.length < 3) {
      this.formErrors.user_name = 'Tên người dùng phải có ít nhất 3 ký tự';
      isValid = false;
    }

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

    if (!this.editMode) {
      if (!this.newUser.password) {
        this.formErrors.password = 'Mật khẩu không được để trống';
        isValid = false;
      } else if (this.newUser.password.length < 6) {
        this.formErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        isValid = false;
      }
    } else if (this.newUser.password && this.newUser.password.length < 6) {
      this.formErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    if (this.newUser.url_image && !this.newUser.url_image.startsWith('http')) {
      this.formErrors.url_image = 'URL hình ảnh phải bắt đầu bằng http:// hoặc https://';
      isValid = false;
    }

    return isValid;
  }

  // Xử lý form submit
  onSubmitForm(): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Bạn không có quyền thực hiện thao tác này';
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    if (this.editMode && this.selectedUser) {
      // Chỉnh sửa nhân viên
      const userData: any = {
        user_name: this.newUser.user_name,
        email: this.newUser.email,
        url_image: this.newUser.url_image,
        role: 3
      };

      if (this.newUser.password && this.newUser.password.trim() !== '') {
        userData.password = this.newUser.password;
      }

      const sub = this.phanQuyenService.updateUser(this.selectedUser._id, userData)
        .pipe(finalize(() => {
          this.isLoading = false;
          this.showForm = false;
        }))
        .subscribe({
          next: (response) => {
            if (response.code === 200) {
              this.successMessage = `Đã cập nhật thông tin cho ${this.newUser.user_name}`;
              this.loadStaffUsers();

              setTimeout(() => {
                this.successMessage = '';
              }, 3000);
            } else {
              this.errorMessage = response.error || 'Có lỗi xảy ra khi cập nhật';
            }
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.errorMessage = 'Lỗi kết nối máy chủ';
          }
        });

      this.subscriptions.push(sub);
    } else {
      // Thêm nhân viên mới
      const newUserData = {
        user_name: this.newUser.user_name,
        email: this.newUser.email,
        password: this.newUser.password,
        url_image: this.newUser.url_image,
        role: 3,
        location: this.currentUser?.cinema_name
      };

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      });

      this.http.post('http://127.0.0.1:3000/users/registerWebByLocation', newUserData, { headers: headers })
        .pipe(finalize(() => {
          this.isLoading = false;
          this.showForm = false;
        }))
        .subscribe({
          next: (response: any) => {
            if (response && (response.code === 200 || response.data)) {
              this.successMessage = `Đã thêm nhân viên ${this.newUser.user_name} vào rạp ${this.currentUser?.cinema_name}`;
              this.loadStaffUsers();

              setTimeout(() => {
                this.successMessage = '';
              }, 3000);
            } else {
              this.errorMessage = (response && response.error) ? response.error : 'Có lỗi xảy ra khi thêm mới';
              setTimeout(() => {
                this.errorMessage = '';
              }, 3000);
            }
          },
          error: (error) => {
            console.error('Error adding staff:', error);
            this.errorMessage = 'Lỗi kết nối máy chủ: ' + (error.message || error);
            setTimeout(() => {
              this.errorMessage = '';
            }, 3000);
          }
        });
    }
  }
}