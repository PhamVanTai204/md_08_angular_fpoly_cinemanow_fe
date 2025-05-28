import { Component, OnInit } from '@angular/core';
import { CinemaAdminService, Cinema, CinemaAdmin } from '../../../shared/services/cinema-admin.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, timer } from 'rxjs';

@Component({
  selector: 'app-admin-rap',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-rap.component.html',
  styleUrl: './admin-rap.component.css'
})
export class AdminRapComponent implements OnInit {
  // Danh sách rạp và admin rạp
  cinemaList: Cinema[] = [];
  adminList: CinemaAdmin[] = [];
  selectedCinema: Cinema | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Form thêm admin rạp
  addAdminForm: FormGroup;
  showAddForm: boolean = false;

  // Phân trang
  totalCinemaRecords: number = 0;
  totalAdminRecords: number = 0;
  cinemaTotalPages: number = 1;
  adminTotalPages: number = 1;
  cinemaCurrentPage: number = 0;
  adminCurrentPage: number = 0;
  cinemaRows: number = 10;
  adminRows: number = 10;
  cinemaSearchTerm: string = '';

  constructor(
    private cinemaAdminService: CinemaAdminService,
    private fb: FormBuilder
  ) {
    this.addAdminForm = this.fb.group({
      user_name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      url_image: ['https://example.com/avatar.jpg'],
    });
  }

  ngOnInit(): void {
    this.loadCinemas();
  }

  // Load danh sách rạp với delay 2 giây
  loadCinemas(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const page = this.cinemaCurrentPage + 1;
    
    // Tạo timer 2 giây và kết hợp với API call
    const minimumDelay = timer(2000);
    const apiCall = this.cinemaAdminService.getAllCinemas(page, this.cinemaRows, this.cinemaSearchTerm);
    
    forkJoin([minimumDelay, apiCall]).subscribe({
      next: ([_, data]) => {
        this.cinemaList = data.cinemas;
        this.totalCinemaRecords = data.totalCinemas;
        this.cinemaTotalPages = data.totalPages;
        this.isLoading = false;
        console.log('Danh sách rạp đã được tải sau delay 2 giây');
      },
      error: (error) => {
        this.errorMessage = `Lỗi khi tải danh sách rạp: ${error.message}`;
        this.isLoading = false;
      }
    });
  }

  // Refresh dữ liệu rạp
  refreshCinemas(): void {
    console.log('Đang làm mới danh sách rạp...');
    this.loadCinemas();
  }

  // Chọn rạp với delay
  selectCinema(cinema: Cinema): void {
    this.selectedCinema = cinema;
    this.adminList = []; // Reset danh sách admin
    this.adminCurrentPage = 0;
    this.loadAdmins(); // Tải danh sách admin khi chọn rạp
  }

  // Tải danh sách admin của rạp với delay 2 giây
  loadAdmins(): void {
    if (!this.selectedCinema) return;

    this.isLoading = true;
    this.errorMessage = '';
    
    const page = this.adminCurrentPage + 1;
    
    // Tạo timer 2 giây và kết hợp với API call
    const minimumDelay = timer(2000);
    const apiCall = this.cinemaAdminService.getAdminsByCinema(this.selectedCinema._id, page, this.adminRows);

    forkJoin([minimumDelay, apiCall]).subscribe({
      next: ([_, data]) => {
        this.adminList = data.admins;
        this.totalAdminRecords = data.totalAdmins;
        this.adminTotalPages = data.totalPages;
        this.isLoading = false;
        console.log('Danh sách admin đã được tải sau delay 2 giây');
      },
      error: (error) => {
        this.errorMessage = `Lỗi khi tải danh sách admin: ${error.message}`;
        this.isLoading = false;
        // Xóa thông báo lỗi sau 5 giây
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  // Refresh dữ liệu admin
  refreshAdmins(): void {
    console.log('Đang làm mới danh sách admin...');
    this.loadAdmins();
  }

  // Thêm admin cho rạp với delay 2 giây
  addAdmin(): void {
    if (!this.selectedCinema) {
      this.errorMessage = 'Vui lòng chọn rạp trước khi thêm admin';
      return;
    }

    if (this.addAdminForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin đúng định dạng';
      return;
    }

    this.isLoading = true;
    // Lưu lại thông tin rạp hiện tại
    const currentCinema = this.selectedCinema;

    // Đảm bảo luôn tạo tài khoản admin rạp (role 2)
    const adminData = {
      ...this.addAdminForm.value,
      location: currentCinema.cinema_name,
      role: 2, // LUÔN là 2 (admin rạp)
      cinema_id: currentCinema._id
    };

    // Tạo timer 2 giây và kết hợp với API call
    const minimumDelay = timer(2000);
    const apiCall = this.cinemaAdminService.registerAdminByCinema(adminData);

    forkJoin([minimumDelay, apiCall]).subscribe({
      next: ([_, response]) => {
        this.successMessage = response.message || 'Đã thêm admin rạp thành công';
        this.isLoading = false;
        this.addAdminForm.reset({
          url_image: 'https://example.com/avatar.jpg'
        });
        this.showAddForm = false;
        // Reset và tải lại dữ liệu
        this.adminCurrentPage = 0;
        this.loadAdmins(); // Sẽ có delay thêm 2 giây nữa
        console.log('Admin đã được thêm sau delay 2 giây');
        
        // Xóa thông báo thành công sau 5 giây
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        // Hiển thị thông báo lỗi chi tiết
        if (error.message.includes('email')) {
          this.errorMessage = `Email ${this.addAdminForm.value.email} đã được sử dụng. Vui lòng sử dụng email khác.`;
        } else if (error.message.includes('user_name') || error.message.includes('người dùng')) {
          this.errorMessage = `Tên người dùng ${this.addAdminForm.value.user_name} đã tồn tại. Vui lòng chọn tên khác.`;
        } else {
          this.errorMessage = `Lỗi khi thêm admin rạp: ${error.message}`;
        }
        this.isLoading = false;
        // Xóa thông báo lỗi sau 5 giây
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  // Xóa admin rạp với delay 2 giây
  removeAdmin(admin: CinemaAdmin): void {
    if (confirm(`Bạn có chắc chắn muốn xóa admin "${admin.user_name}" không?`)) {
      this.isLoading = true;

      // Lưu lại cinema hiện tại trước khi xóa
      const currentCinema = this.selectedCinema;

      if (!currentCinema) {
        this.errorMessage = 'Không tìm thấy thông tin rạp';
        this.isLoading = false;
        return;
      }

      // Tạo timer 2 giây và kết hợp với API call
      const minimumDelay = timer(2000);
      const apiCall = this.cinemaAdminService.removeCinemaAdmin(currentCinema._id, admin._id);

      forkJoin([minimumDelay, apiCall]).subscribe({
        next: ([_, response]) => {
          this.successMessage = response.message || 'Đã xóa admin rạp thành công';
          this.isLoading = false;
          // Reset và tải lại dữ liệu
          this.adminCurrentPage = 0;
          this.loadAdmins(); // Sẽ có delay thêm 2 giây nữa
          console.log('Admin đã được xóa sau delay 2 giây');
          
          // Xóa thông báo thành công sau 5 giây
          setTimeout(() => {
            this.successMessage = '';
          }, 5000);
        },
        error: (error) => {
          this.errorMessage = `Lỗi khi xóa admin rạp: ${error.message}`;
          this.isLoading = false;
          // Xóa thông báo lỗi sau 5 giây
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        }
      });
    }
  }

  // Phân trang
  onCinemaPageChange(page: number): void {
    this.cinemaCurrentPage = page;
    this.loadCinemas();
  }

  onAdminPageChange(page: number): void {
    this.adminCurrentPage = page;
    this.loadAdmins();
  }

  // Tìm kiếm rạp
  onSearchCinema(): void {
    this.cinemaCurrentPage = 0;
    this.loadCinemas();
  }

  // Xử lý rows per page
  onCinemaRowsChange(): void {
    this.cinemaCurrentPage = 0;
    this.loadCinemas();
  }

  onAdminRowsChange(): void {
    this.adminCurrentPage = 0;
    this.loadAdmins();
  }

  // Quản lý form
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.addAdminForm.reset({
        url_image: 'https://example.com/avatar.jpg'
      });
    }
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Handle image loading errors
  handleImageError(admin: CinemaAdmin): void {
    admin.url_image = `https://ui-avatars.com/api/?name=${admin.user_name}&background=random`;
  }

  // Helpers
  getCinemaPageNumbers(): number[] {
    return Array.from({ length: this.cinemaTotalPages }, (_, i) => i);
  }

  // Lấy danh sách số trang cho phân trang admin
  getAdminPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.adminTotalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Quay lại danh sách rạp
  backToList(): void {
    this.selectedCinema = null;
    this.adminList = [];
    this.adminCurrentPage = 0;
  }
}