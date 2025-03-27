import { Component, OnInit } from '@angular/core';
import { ShowtimesService } from '../../../shared/services/showtimes.service';
import { ShowtimesDto } from '../../../shared/dtos/showtimesDto.dto';

@Component({
  selector: 'app-lich-chieu',
  templateUrl: './lich-chieu.component.html',
  styleUrls: ['./lich-chieu.component.css'],
  standalone: false // <--- Quan trọng: không phải standalone
})
export class LichChieuComponent implements OnInit {
  searchTerm: string = '';

  // Danh sách lịch chiếu
  dsLichChieu: ShowtimesDto[] = [];

  // Trạng thái cho modal Thêm/Sửa
  isMainModalOpen: boolean = false;
  isEditing: boolean = false;

  // Form cho modal Thêm/Sửa
  lichChieuForm: ShowtimesDto = new ShowtimesDto();

  // Quản lý dialog xóa
  isDeleteModalOpen: boolean = false;
  lichChieuDangXoa: ShowtimesDto | null = null;
  deletePassword: string = '';

  constructor(private showtimesService: ShowtimesService) {}

  ngOnInit(): void {
    this.loadShowtimes();
  }

  /**
   * Lấy danh sách showtimes từ server
   */
  loadShowtimes(): void {
    this.showtimesService.getAllShowtimes().subscribe({
      next: (data) => {
        this.dsLichChieu = data;
      },
      error: (err) => {
        console.error('Lỗi khi lấy showtimes:', err);
      }
    });
  }

  // Tìm kiếm
  onSearch(): void {
    console.log('Search term:', this.searchTerm);
    // Tuỳ bạn xử lý filter client-side hoặc gọi API search
  }

  // Chuyển số trạng thái => text hiển thị
  getStatusText(status: number): string {
    switch (status) {
      case 1:
        return 'Sắp chiếu';
      case 2:
        return 'Đang chiếu';
      default:
        return 'Không xác định';
    }
  }

  // Mở dialog Thêm
  openAddModal(): void {
    this.isEditing = false;
    this.isMainModalOpen = true;
    this.lichChieuForm = new ShowtimesDto({
      movieId: '',
      showtimeStatus: 1,
      startTime: '',
      endTime: '',
      price: 0
    });
  }

  // Mở dialog Sửa
  openEditModal(lich: ShowtimesDto): void {
    this.isEditing = true;
    this.isMainModalOpen = true;
    this.lichChieuForm = lich.clone();
  }

  // Đóng dialog
  closeMainModal(): void {
    this.isMainModalOpen = false;
  }

  // Lưu khi bấm "LƯU"
  saveSchedule(): void {
    if (this.isEditing) {
      // Update
      if (!this.lichChieuForm.id) {
        alert('Không tìm thấy ID!');
        return;
      }
      this.showtimesService
        .updateShowtime(this.lichChieuForm.id, this.lichChieuForm)
        .subscribe({
          next: () => {
            alert('Cập nhật thành công!');
            this.isMainModalOpen = false;
            this.loadShowtimes();
          },
          error: (err) => {
            console.error('Lỗi update:', err);
            alert('Lỗi cập nhật!');
          }
        });
    } else {
      // Thêm
      this.showtimesService.addShowtime(this.lichChieuForm).subscribe({
        next: () => {
          alert('Thêm thành công!');
          this.isMainModalOpen = false;
          this.loadShowtimes();
        },
        error: (err) => {
          console.error('Lỗi thêm:', err);
          alert('Lỗi thêm!');
        }
      });
    }
  }

  // Mở dialog Xoá
  openDeleteModal(lich: ShowtimesDto): void {
    this.lichChieuDangXoa = lich;
    this.deletePassword = '';
    this.isDeleteModalOpen = true;
  }

  // Đóng dialog Xoá
  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
  }

  // Xác nhận xoá
  confirmDelete(): void {
    if (this.deletePassword === 'hiendz') {
      if (!this.lichChieuDangXoa?.id) {
        alert('Không tìm thấy ID để xoá!');
        return;
      }
      this.showtimesService.deleteShowtime(this.lichChieuDangXoa.id).subscribe({
        next: () => {
          alert('Xoá thành công!');
          this.isDeleteModalOpen = false;
          this.loadShowtimes();
        },
        error: (err) => {
          console.error('Lỗi xoá:', err);
          alert('Lỗi xoá!');
        }
      });
    } else {
      alert('Mật khẩu không đúng!');
    }
  }

  // Hành động Sửa (icon)
  editSchedule(lich: ShowtimesDto): void {
    this.openEditModal(lich);
  }

  // Hành động Xoá (icon)
  deleteSchedule(lich: ShowtimesDto): void {
    this.openDeleteModal(lich);
  }
}
