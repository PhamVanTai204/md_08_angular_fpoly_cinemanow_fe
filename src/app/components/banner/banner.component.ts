import { Component, OnInit } from '@angular/core';
import { BannersService } from '../../../shared/services/banners.service';
import { BannersDto } from '../../../shared/dtos/bannersDto.dto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css'],
  standalone: false
})
export class BannerComponent implements OnInit {
  banners: BannersDto[] = [];
  private pressTimer: any;
  showDeleteDialog: boolean = false;
  showAddDialog: boolean = false;
  bannerToDelete: BannersDto | null = null;
  previewError: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  
  // Add form group for validation
  bannerForm!: FormGroup;
  submitted = false;

  constructor(
    private bannersService: BannersService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    // Initialize the form with validators
    this.bannerForm = this.formBuilder.group({
      imageUrl: ['', [
        Validators.required,
        Validators.pattern('^(https?://)[a-zA-Z0-9-_.~%:/=?&#+]+$')
      ]]
    });
    
    this.getBanners();
  }

  // Helper function to safely access form controls
  get imageUrl() {
    return this.bannerForm.get('imageUrl');
  }

  // Lấy danh sách banner với delay loading tối thiểu 2 giây
  getBanners() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Tạo timer 2 giây và kết hợp với API call
    const minimumDelay = timer(2000); // 2 giây
    const apiCall = this.bannersService.getBanners();
    
    // Sử dụng forkJoin để đợi cả timer và API call hoàn thành
    forkJoin([minimumDelay, apiCall]).subscribe({
      next: ([_, data]) => {
        this.banners = data;
        this.isLoading = false;
        console.log('Dữ liệu đã được tải sau delay 2 giây');
      },
      error: (error) => {
        console.error('Lỗi khi tải banner:', error);
        this.errorMessage = 'Không thể tải danh sách banner. Vui lòng thử lại sau.';
        this.isLoading = false;
      }
    });
  }

  // Refresh dữ liệu với delay (có thể gọi từ nút refresh)
  refreshBanners() {
    console.log('Đang làm mới dữ liệu...');
    this.getBanners();
  }

  // Mở dialog thêm banner mới
  addBanner() {
    this.showAddDialog = true;
    this.submitted = false;
    this.bannerForm.reset();
    this.previewError = '';
  }

  // Đóng dialog thêm banner
  closeAddDialog() {
    this.showAddDialog = false;
    this.bannerForm.reset();
    this.previewError = '';
    this.submitted = false;
  }

  // Xác nhận thêm banner mới với delay loading
  confirmAddBanner() {
    this.submitted = true;

    // Stop if form is invalid
    if (this.bannerForm.invalid) {
      return;
    }

    const imageUrl = this.bannerForm.get('imageUrl')?.value;
    if (imageUrl && !this.previewError) {
      this.isLoading = true;
      
      const newBanner = new BannersDto({ id: '', imageUrl: imageUrl.trim() });
      
      // Tạo timer 2 giây và kết hợp với API call tạo banner
      const minimumDelay = timer(2000);
      const createCall = this.bannersService.createBanner(newBanner);
      
      forkJoin([minimumDelay, createCall]).subscribe({
        next: ([_, result]) => {
          console.log('Banner đã được tạo sau delay 2 giây');
          this.getBanners(); // Sẽ có delay thêm 2 giây nữa khi tải lại
          this.closeAddDialog();
        },
        error: (error) => {
          console.error('Lỗi khi thêm banner:', error);
          this.errorMessage = 'Không thể thêm banner mới. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
    }
  }

  // Bắt đầu tính thời gian bấm giữ (long press)
  startPress(banner: BannersDto) {
    this.pressTimer = setTimeout(() => {
      this.openDeleteDialog(banner);
    }, 1500);
  }

  // Hủy bỏ tính thời gian bấm giữ
  cancelPress() {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
  }

  // Mở dialog xác nhận xóa
  openDeleteDialog(banner: BannersDto) {
    this.bannerToDelete = banner;
    this.showDeleteDialog = true;
    this.cancelPress(); // Đảm bảo hủy timer nếu dialog được mở bằng nút xóa
  }

  // Xác nhận xóa banner từ dialog với delay loading
  confirmDelete() {
    if (this.bannerToDelete) {
      this.isLoading = true;
      
      // Tạo timer 2 giây và kết hợp với API call xóa banner
      const minimumDelay = timer(2000);
      const deleteCall = this.bannersService.deleteBanner(this.bannerToDelete.id);
      
      forkJoin([minimumDelay, deleteCall]).subscribe({
        next: ([_, result]) => {
          console.log('Banner đã được xóa sau delay 2 giây');
          this.getBanners(); // Sẽ có delay thêm 2 giây nữa khi tải lại
          this.closeDeleteDialog();
        },
        error: (error) => {
          console.error('Lỗi khi xóa banner:', error);
          this.errorMessage = 'Không thể xóa banner. Vui lòng thử lại sau.';
          this.isLoading = false;
          this.closeDeleteDialog();
        }
      });
    }
  }

  // Đóng dialog xác nhận xóa
  closeDeleteDialog() {
    this.showDeleteDialog = false;
    this.bannerToDelete = null;
  }

  // Xử lý lỗi khi tải hình ảnh - phiên bản cải tiến
  onImageError(event: any) {
    // Ngăn chặn sự kiện error lặp lại bằng cách xóa sự kiện error
    event.target.onerror = null;
    // Thay vì tải ảnh placeholder, chỉ hiển thị div với nội dung "Lỗi hình ảnh"
    const imgElement = event.target;
    const parent = imgElement.parentNode;
    
    // Kiểm tra xem đã có div thông báo lỗi chưa để tránh tạo nhiều lần
    if (!parent.querySelector('.image-error-message')) {
      // Thêm lớp CSS để chỉ ra đây là container chứa ảnh lỗi
      parent.classList.add('image-error-container');
      
      // Ẩn hình ảnh bị lỗi
      imgElement.style.display = 'none';
      
      // Tạo phần tử div hiển thị thông báo lỗi
      const errorDiv = document.createElement('div');
      errorDiv.className = 'image-error-message';
      errorDiv.innerHTML = '<span class="material-icons">broken_image</span><p>Lỗi hình ảnh</p>';
      
      // Thêm div thông báo lỗi vào DOM
      parent.appendChild(errorDiv);
    }
  }

  // Xử lý lỗi khi xem trước
  onPreviewError(event: any) {
    this.previewError = 'Không thể tải hình ảnh này. Vui lòng kiểm tra lại URL.';
    // Ngăn chặn sự kiện error lặp lại
    event.target.onerror = null;
    
    // Ẩn hình ảnh lỗi, không cố gắng tải ảnh placeholder
    event.target.style.display = 'none';
    
    // Tạo và hiển thị div thông báo lỗi nếu chưa có
    const imgElement = event.target;
    const parent = imgElement.parentNode;
    
    if (!parent.querySelector('.preview-error-message')) {
      // Tạo phần tử div hiển thị thông báo lỗi trong preview
      const errorDiv = document.createElement('div');
      errorDiv.className = 'preview-error-message';
      errorDiv.innerHTML = '<span class="material-icons">broken_image</span>';
      
      // Thêm div thông báo lỗi vào DOM
      parent.appendChild(errorDiv);
    }
  }

  // Preview the image when URL changes
  updateImagePreview() {
    // Clear previous error when URL changes
    this.previewError = '';
  }

  // Helper for checking if a form control has a specific error
  hasError(controlName: string, errorName: string): boolean {
    const control = this.bannerForm.get(controlName);
    return !!(control && this.submitted && control.hasError(errorName));
  }
}