import { Component } from '@angular/core';

interface NhanVien {
  avatar: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
}

@Component({
  selector: 'app-nhan-vien',
  standalone: false, // Thêm thuộc tính này để chỉ định Component không ở chế độ standalone
  templateUrl: './nhan-vien.component.html',
  styleUrls: ['./nhan-vien.component.css']
})
export class NhanVienComponent {
  nhanViens: NhanVien[] = [
    {
      avatar: 'https://via.placeholder.com/40',
      fullName: 'Hien Dinh',
      email: 'hien1@gmail.com',
      phone: '07238725823',
      role: 'User',
      isActive: true
    },
    {
      avatar: 'https://via.placeholder.com/40',
      fullName: 'Nguyen Van A',
      email: 'nguyenvana@example.com',
      phone: '0123456789',
      role: 'Admin',
      isActive: false
    }
    // ... Thêm nhân viên khác nếu cần
  ];

  // Hàm toggle để thay đổi trạng thái khóa/mở khóa tài khoản
  toggleNhanVienStatus(nv: NhanVien): void {
    nv.isActive = !nv.isActive;
  }
}
