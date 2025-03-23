import { Component, OnInit } from '@angular/core';

interface ShowTime {
  movieId: string;         // tương đương movie_id
  showtimeStatus: number;  // tương đương showtime_status
  startTime: string;       // tương đương start_time
  endTime: string;         // tương đương end_time
  price: number;           // tương đương price
  // id?: string;          // Nếu server trả về _id, có thể thêm trường này
}

@Component({
  selector: 'app-lich-chieu',
  templateUrl: './lich-chieu.component.html',
  styleUrls: ['./lich-chieu.component.css'],
  standalone: false // <--- Quan trọng: Đảm bảo component không ở chế độ standalone
})
export class LichChieuComponent implements OnInit {
  searchTerm: string = '';

  // Danh sách lịch chiếu (demo)
  dsLichChieu: ShowTime[] = [
    {
      movieId: '67cf93ab853699acbdff6fb3',
      showtimeStatus: 1,
      startTime: '2025-03-15T14:30:00Z',
      endTime: '2025-03-15T16:30:00Z',
      price: 100000
    },
    {
      movieId: '67cf93ab853699acbdff6fb3',
      showtimeStatus: 2,
      startTime: '2025-03-16T10:00:00Z',
      endTime: '2025-03-16T12:00:00Z',
      price: 120000
    }
  ];

  // Trạng thái cho modal Thêm/Sửa
  isMainModalOpen: boolean = false;
  isEditing: boolean = false;

  // Form cho modal Thêm/Sửa
  lichChieuForm: ShowTime = {
    movieId: '',
    showtimeStatus: 1,
    startTime: '',
    endTime: '',
    price: 0
  };

  // Quản lý dialog xóa
  isDeleteModalOpen: boolean = false;
  lichChieuDangXoa: ShowTime | null = null;
  deletePassword: string = '';

  constructor() {}

  ngOnInit(): void {}

  // Tìm kiếm
  onSearch(): void {
    // Logic tìm kiếm (ví dụ: filter dsLichChieu theo movieId)
    console.log('Search term:', this.searchTerm);
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
    // Reset form
    this.lichChieuForm = {
      movieId: '',
      showtimeStatus: 1,
      startTime: '',
      endTime: '',
      price: 0
    };
  }

  // Mở dialog Sửa
  openEditModal(lich: ShowTime): void {
    this.isEditing = true;
    this.isMainModalOpen = true;
    // Copy dữ liệu vào form
    this.lichChieuForm = { ...lich };
  }

  // Đóng dialog Thêm/Sửa
  closeMainModal(): void {
    this.isMainModalOpen = false;
  }

  // Lưu dữ liệu khi bấm LƯU
  saveSchedule(): void {
    if (this.isEditing) {
      // Trường hợp Sửa: tìm index theo movieId + startTime (chẳng hạn)
      const idx = this.dsLichChieu.findIndex(
        (item) =>
          item.movieId === this.lichChieuForm.movieId &&
          item.startTime === this.lichChieuForm.startTime
      );
      if (idx !== -1) {
        this.dsLichChieu[idx] = { ...this.lichChieuForm };
      }
    } else {
      // Thêm mới
      this.dsLichChieu.push({ ...this.lichChieuForm });
    }
    // Đóng dialog
    this.isMainModalOpen = false;
  }

  // Mở dialog Xoá
  openDeleteModal(lich: ShowTime): void {
    this.lichChieuDangXoa = lich;
    this.deletePassword = '';
    this.isDeleteModalOpen = true;
  }

  // Đóng dialog Xoá
  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
  }

  // Xác nhận xóa
  confirmDelete(): void {
    if (this.deletePassword === 'hiendz') {
      if (this.lichChieuDangXoa) {
        this.dsLichChieu = this.dsLichChieu.filter(
          (item) => item !== this.lichChieuDangXoa
        );
      }
      this.isDeleteModalOpen = false;
    } else {
      alert('Mật khẩu không đúng!');
    }
  }

  // Hành động Sửa (icon)
  editSchedule(lich: ShowTime): void {
    this.openEditModal(lich);
  }

  // Hành động Xoá (icon)
  deleteSchedule(lich: ShowTime): void {
    this.openDeleteModal(lich);
  }
}
