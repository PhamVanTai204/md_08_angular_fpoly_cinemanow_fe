import { Component, OnInit } from '@angular/core';
import { ShowtimesService } from '../../../shared/services/showtimes.service';
import { ShowtimesDto } from '../../../shared/dtos/showtimesDto.dto';

@Component({
  selector: 'app-lich-chieu',
  templateUrl: './lich-chieu.component.html',
  styleUrls: ['./lich-chieu.component.css'],
  standalone: false
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
    // Implement search by movie_id
    if (this.searchTerm) {
      this.showtimesService.searchShowtimes(this.searchTerm).subscribe({
        next: (data) => {
          this.dsLichChieu = data;
        },
        error: (err) => {
          console.error('Lỗi khi tìm kiếm:', err);
        }
      });
    } else {
      this.loadShowtimes();
    }
  }

  // Mở dialog Thêm
  openAddModal(): void {
    this.isEditing = false;
    this.isMainModalOpen = true;
    this.lichChieuForm = new ShowtimesDto({
      showtime_id: '',
      movie_id: '',
      room_id: '',
      show_date: new Date().toISOString().split('T')[0],
      start_time: '',
      end_time: ''
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
    // Validate form
    if (!this.lichChieuForm.movie_id || !this.lichChieuForm.room_id ||
        !this.lichChieuForm.show_date || !this.lichChieuForm.start_time || 
        !this.lichChieuForm.end_time) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

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