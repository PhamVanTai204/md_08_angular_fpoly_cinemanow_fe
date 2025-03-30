import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nhan-vien',
  standalone: false,
  templateUrl: './nhan-vien.component.html',
  styleUrls: ['./nhan-vien.component.css'],
  // standalone: false - Đảm bảo không có thuộc tính này hoặc đặt là false
})
export class NhanVienComponent implements OnInit {
  // Các thuộc tính
  nhanViens: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.loadNhanVien();
  }

  // Load danh sách nhân viên
  loadNhanVien(): void {
    this.isLoading = true;
    
    // Mô phỏng lấy dữ liệu từ API
    setTimeout(() => {
      this.nhanViens = [
        {
          id: 1,
          fullName: 'Nguyễn Văn A',
          email: 'nguyenvana@example.com',
          phone: '0123456789',
          role: 'Admin',
          avatar: 'https://via.placeholder.com/40?text=NVA',
          isActive: true
        },
        {
          id: 2,
          fullName: 'Trần Thị B',
          email: 'tranthib@example.com',
          phone: '0987654321',
          role: 'Nhân viên',
          avatar: 'https://via.placeholder.com/40?text=TTB',
          isActive: true
        },
        {
          id: 3,
          fullName: 'Lê Văn C',
          email: 'levanc@example.com',
          phone: '0369852147',
          role: 'Nhân viên',
          avatar: 'https://via.placeholder.com/40?text=LVC',
          isActive: false
        }
      ];
      
      this.isLoading = false;
    }, 500);
  }

  // Khóa/mở khóa tài khoản nhân viên
  toggleNhanVienStatus(nhanVien: any): void {
    // Mô phỏng API cập nhật trạng thái
    this.isLoading = true;
    
    setTimeout(() => {
      nhanVien.isActive = !nhanVien.isActive;
      const message = nhanVien.isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản';
      this.errorMessage = `${message} cho nhân viên ${nhanVien.fullName}`;
      
      this.isLoading = false;
      
      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
    }, 500);
  }
}