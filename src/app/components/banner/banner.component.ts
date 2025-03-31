import { Component, OnInit } from '@angular/core';
import { BannersService } from '../../../shared/services/banners.service';
import { BannersDto } from '../../../shared/dtos/bannersDto.dto';

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
  newBannerUrl: string = '';
  previewError: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private bannersService: BannersService) { }

  ngOnInit() {
    this.getBanners();
  }

  // Lấy danh sách banner
  getBanners() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.bannersService.getBanners().subscribe(
      (data) => {
        this.banners = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Lỗi khi tải banner:', error);
        this.errorMessage = 'Không thể tải danh sách banner. Vui lòng thử lại sau.';
        this.isLoading = false;
      }
    );
  }

  // Mở dialog thêm banner mới
  addBanner() {
    this.showAddDialog = true;
    this.newBannerUrl = '';
    this.previewError = '';
  }

  // Đóng dialog thêm banner
  closeAddDialog() {
    this.showAddDialog = false;
    this.newBannerUrl = '';
    this.previewError = '';
  }

  // Xác nhận thêm banner mới
  confirmAddBanner() {
    if (this.newBannerUrl && this.newBannerUrl.trim() && !this.previewError) {
      this.isLoading = true;
      
      const newBanner = new BannersDto({ id: '', imageUrl: this.newBannerUrl.trim() });
      this.bannersService.createBanner(newBanner).subscribe(
        () => {
          this.getBanners();
          this.closeAddDialog();
        },
        (error) => {
          console.error('Lỗi khi thêm banner:', error);
          this.errorMessage = 'Không thể thêm banner mới. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      );
    }
  }

  // Bắt đầu tính thời gian bấm giữ (long press)
  startPress(banner: BannersDto) {
    this.pressTimer = setTimeout(() => {
      this.openDeleteDialog(banner);
    }, 3000);
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
      
      this.bannersService.deleteBanner(this.bannerToDelete.id).subscribe(
        () => {
          this.getBanners();
          this.closeDeleteDialog();
        },
        (error) => {
          console.error('Lỗi khi xóa banner:', error);
          this.errorMessage = 'Không thể xóa banner. Vui lòng thử lại sau.';
          this.isLoading = false;
          this.closeDeleteDialog();
        }
      );
    }
  }

  // Đóng dialog xác nhận xóa
  closeDeleteDialog() {
    this.showDeleteDialog = false;
    this.bannerToDelete = null;
  }

  // Xử lý lỗi khi tải hình ảnh
  onImageError(event: any) {
    event.target.src = 'assets/images/image-placeholder.png'; // Đặt hình ảnh mặc định
  }

  // Xử lý lỗi khi xem trước
  onPreviewError(event: any) {
    this.previewError = 'Không thể tải hình ảnh này. Vui lòng kiểm tra lại URL.';
    event.target.src = 'assets/images/image-placeholder.png'; // Đặt hình ảnh mặc định
  }
}