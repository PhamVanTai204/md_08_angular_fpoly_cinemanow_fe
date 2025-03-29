import { Component, OnInit } from '@angular/core';
import { BannersService } from '../../../shared/services/banners.service';
import { BannersDto } from '../../../shared/dtos/bannersDto.dto';

@Component({
  selector: 'app-banner',
  standalone: false,
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {
  banners: BannersDto[] = [];
  private pressTimer: any;
  showDeleteDialog: boolean = false;
  bannerToDelete: BannersDto | null = null;

  constructor(private bannersService: BannersService) {}

  ngOnInit() {
    this.getBanners();
  }

  // Lấy danh sách banner
  getBanners() {
    this.bannersService.getBanners().subscribe(
      (data) => {
        this.banners = data;
      },
      (error) => {
        console.error('Lỗi khi tải banner:', error);
      }
    );
  }

  // Thêm banner mới (sau khi thêm, dữ liệu sẽ được reset ngay lập tức)
  addBanner() {
    const imageUrl = prompt('Nhập URL ảnh cho banner mới:');
    if (imageUrl && imageUrl.trim()) {
      const newBanner = new BannersDto({ id: '', imageUrl: imageUrl.trim() });
      this.bannersService.createBanner(newBanner).subscribe(
        () => {
          // Reset dữ liệu ngay sau khi thêm
          this.getBanners();
        },
        (error) => {
          console.error('Lỗi khi thêm banner:', error);
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
  }

  // Xác nhận xóa banner từ dialog
  confirmDelete() {
    if (this.bannerToDelete) {
      this.bannersService.deleteBanner(this.bannerToDelete.id).subscribe(
        () => {
          // Reset dữ liệu sau khi xóa
          this.getBanners();
          this.closeDeleteDialog();
        },
        (error) => {
          console.error('Lỗi khi xóa banner:', error);
        }
      );
    }
  }

  // Đóng dialog xác nhận xóa
  closeDeleteDialog() {
    this.showDeleteDialog = false;
    this.bannerToDelete = null;
  }
}
