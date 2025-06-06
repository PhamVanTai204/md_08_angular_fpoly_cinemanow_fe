import { Component, OnInit } from '@angular/core';
import { BannersService } from '../../../shared/services/banners.service';
import { BannersDto } from '../../../shared/dtos/bannersDto.dto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  // Không sử dụng đường dẫn ảnh nữa để tránh lỗi 404
  
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

  // Lấy danh sách banner
  getBanners() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.bannersService.getBanners().subscribe({
      next: (data) => {
        this.banners = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải banner:', error);
        this.errorMessage = 'Không thể tải danh sách banner. Vui lòng thử lại sau.';
        this.isLoading = false;
      }
    });
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

  // Xác nhận thêm banner mới
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
      this.bannersService.createBanner(newBanner).subscribe({
        next: () => {
          this.getBanners();
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

  // Xác nhận xóa banner từ dialog
  confirmDelete() {
    if (this.bannerToDelete) {
      this.isLoading = true;
      
      this.bannersService.deleteBanner(this.bannerToDelete.id).subscribe({
        next: () => {
          this.getBanners();
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