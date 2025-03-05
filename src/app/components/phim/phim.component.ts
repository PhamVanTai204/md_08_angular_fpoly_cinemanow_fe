import { Component } from '@angular/core';

@Component({
  selector: 'app-phim',
  standalone: false, // Giữ hoặc bỏ nếu bạn không dùng Standalone Component
  templateUrl: './phim.component.html',
  styleUrls: ['./phim.component.css']
})
export class PhimComponent {
  // Biến lưu từ khoá tìm kiếm
  searchTerm: string = '';

  // Danh sách phim (dữ liệu mẫu)
  danhSachPhim = [
    {
      theLoai: 'Hành động Kinh Dị',
      poster: 'https://d1j8r0kxyu9tj8.cloudfront.net/files/1618301042CTBAF7i4v3cXFfn.jpg',
      tenPhim: 'RÒM',
      thoiLuong: 120,
      trangThai: 'ONLINE',
      ngayPhatHanh: new Date(2025, 0, 23)
    },
    {
      theLoai: 'Kịch Tính Tình Cảm',
      poster: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqAcGHNJamloNStAZBGCIatqecki3f2HSMLw&s',
      tenPhim: 'NHÀ BÀ NỮ',
      thoiLuong: 120,
      trangThai: 'ONLINE',
      ngayPhatHanh: new Date(2025, 0, 23)
    },
    {
      theLoai: 'Hài Kịch',
      poster: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuscXpOzMpN3C2A2Cby0bPhP5Pqf0aDGGnlg&s',
      tenPhim: 'TRANG QUỲNH',
      thoiLuong: 120,
      trangThai: 'ONLINE',
      ngayPhatHanh: new Date(2025, 0, 23)
    }
  ];

  /**
   * Getter để lọc danh sách phim theo từ khoá tìm kiếm
   */
  get danhSachPhimDaLoc() {
    if (!this.searchTerm) {
      return this.danhSachPhim;
    }
    const lowerSearch = this.searchTerm.toLowerCase();
    return this.danhSachPhim.filter(phim =>
      phim.tenPhim.toLowerCase().includes(lowerSearch)
    );
  }

  // ---------------------
  // CÁC BIẾN VÀ HÀM CHO MODAL THÊM/SỬA PHIM
  // ---------------------
  showModal: boolean = false;  // Ẩn/hiện modal Thêm/Sửa
  isEdit: boolean = false;     // Xác định đang Sửa (true) hay Thêm (false)
  editIndex: number | null = null; // Vị trí phim đang sửa
  // Biến tạm để binding dữ liệu phim trong modal
  currentPhim: any = {
    theLoai: '',
    poster: '',
    tenPhim: '',
    thoiLuong: 0,
    trangThai: 'ONLINE',
    ngayPhatHanh: new Date()
  };

  /**
   * Mở modal Thêm phim
   */
  themPhim() {
    this.isEdit = false;
    this.editIndex = null;
    // Reset dữ liệu phim mới
    this.currentPhim = {
      theLoai: '',
      poster: '',
      tenPhim: '',
      thoiLuong: 0,
      trangThai: 'ONLINE',
      ngayPhatHanh: new Date()
    };
    this.showModal = true;
  }

  /**
   * Mở modal Sửa phim
   */
  suaPhim(phim: any, index: number) {
    this.isEdit = true;
    this.editIndex = index;
    // Tạo một bản sao để tránh sửa trực tiếp trên mảng
    this.currentPhim = { ...phim };
    this.showModal = true;
  }

  /**
   * Lưu phim (thêm mới hoặc cập nhật)
   */
  savePhim() {
    if (this.isEdit && this.editIndex !== null) {
      // Cập nhật phim
      this.danhSachPhim[this.editIndex] = this.currentPhim;
    } else {
      // Thêm phim mới
      this.danhSachPhim.push(this.currentPhim);
    }
    // Đóng modal
    this.showModal = false;
  }

  /**
   * Đóng modal Thêm/Sửa (không lưu)
   */
  closeModal() {
    this.showModal = false;
  }

  // ---------------------
  // CÁC BIẾN VÀ HÀM CHO MODAL XÓA PHIM
  // ---------------------
  showDeleteModal: boolean = false; // Ẩn/hiện modal Xóa
  deleteIndex: number | null = null; // Vị trí phim muốn xóa
  deletePhim: any = null;           // Thông tin phim muốn xóa
  deletePassword: string = '';      // Mật khẩu xác nhận

  /**
   * Mở modal Xóa phim (yêu cầu nhập mật khẩu hiendz)
   */
  xoaPhim(phim: any, index: number) {
    this.showDeleteModal = true;
    this.deleteIndex = index;
    this.deletePhim = phim;
    this.deletePassword = '';
  }

  /**
   * Xác nhận xóa phim
   */
  confirmXoaPhim() {
    // Kiểm tra mật khẩu
    if (this.deletePassword !== 'hiendz') {
      alert('Mật khẩu sai!');
      return;
    }

    // Hỏi xác nhận
    const isConfirm = confirm(`Bạn có chắc muốn xóa phim "${this.deletePhim.tenPhim}"?`);
    if (!isConfirm) {
      return;
    }

    // Tiến hành xóa
    if (this.deleteIndex !== null) {
      this.danhSachPhim.splice(this.deleteIndex, 1);
    }
    this.closeDeleteModal();
  }

  /**
   * Đóng modal Xóa (không xóa)
   */
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteIndex = null;
    this.deletePhim = null;
    this.deletePassword = '';
  }
}
