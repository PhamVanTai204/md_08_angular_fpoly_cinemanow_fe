import { Component, OnInit } from '@angular/core';

interface LichChieu {
  phim: string;
  batDau: string;
  ketThuc: string;
  trangThai: string;
}

@Component({
  selector: 'app-lich-chieu',
  standalone: false,
  templateUrl: './lich-chieu.component.html',
  styleUrls: ['./lich-chieu.component.css']
})
export class LichChieuComponent implements OnInit {
  searchTerm: string = '';

  dsLichChieu: LichChieu[] = [
    {
      phim: 'Trạng Quỳnh',
      batDau: '2025/03/12 - 08:20',
      ketThuc: '2025/03/12 - 10:20',
      trangThai: 'Sắp chiếu'
    },
    {
      phim: 'Trạng Quỳnh',
      batDau: '2025/03/12 - 08:20',
      ketThuc: '2025/03/12 - 10:20',
      trangThai: 'Sắp chiếu'
    },
    {
      phim: 'Trạng Quỳnh',
      batDau: '2025/03/12 - 08:20',
      ketThuc: '2025/03/12 - 10:20',
      trangThai: 'Đang chiếu'
    }
  ];

  // Quản lý dialog thêm/sửa
  isMainModalOpen: boolean = false;
  isEditing: boolean = false; // true: sửa, false: thêm

  // Lưu dữ liệu của form thêm/sửa
  lichChieuForm: LichChieu = {
    phim: '',
    batDau: '',
    ketThuc: '',
    trangThai: ''
  };

  // Quản lý dialog xóa
  isDeleteModalOpen: boolean = false;
  lichChieuDangXoa: LichChieu | null = null;
  deletePassword: string = '';

  constructor() {}

  ngOnInit(): void {}

  onSearch(): void {
    // Logic tìm kiếm
    console.log('Search term:', this.searchTerm);
  }

  // Mở dialog Thêm
  openAddModal(): void {
    this.isEditing = false;
    this.isMainModalOpen = true;
    // Reset form
    this.lichChieuForm = {
      phim: '',
      batDau: '',
      ketThuc: '',
      trangThai: ''
    };
  }

  // Mở dialog Sửa
  openEditModal(lich: LichChieu): void {
    this.isEditing = true;
    this.isMainModalOpen = true;
    // Copy dữ liệu lịch cần sửa vào form
    this.lichChieuForm = { ...lich };
  }

  // Đóng dialog Thêm/Sửa
  closeMainModal(): void {
    this.isMainModalOpen = false;
  }

  // Lưu dữ liệu khi bấm LƯU (cả Thêm & Sửa)
  saveSchedule(): void {
    if (this.isEditing) {
      // Trường hợp Sửa
      // Tìm index của lichChieuForm trong dsLichChieu để cập nhật (dựa trên tên phim)
      const idx = this.dsLichChieu.findIndex(
        (item) => item.phim === this.lichChieuForm.phim
      );
      if (idx !== -1) {
        this.dsLichChieu[idx] = { ...this.lichChieuForm };
      }
    } else {
      // Trường hợp Thêm mới
      this.dsLichChieu.push({ ...this.lichChieuForm });
    }

    // Đóng dialog
    this.isMainModalOpen = false;
  }

  // Mở dialog Xoá
  openDeleteModal(lich: LichChieu): void {
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
    // Kiểm tra mật khẩu. Giả sử yêu cầu nhập "hiendz"
    if (this.deletePassword === 'hiendz') {
      if (this.lichChieuDangXoa) {
        // Xóa khỏi dsLichChieu
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
  editSchedule(lich: LichChieu): void {
    this.openEditModal(lich);
  }

  // Hành động Xoá (icon)
  deleteSchedule(lich: LichChieu): void {
    this.openDeleteModal(lich);
  }
}
