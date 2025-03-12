import { Component } from '@angular/core';

// Định nghĩa interface cho User
interface User {
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;   // true = đang hoạt động, false = bị khóa
  avatarUrl?: string;  // link ảnh đại diện (nếu có)
}

@Component({
  selector: 'app-nguoi-dung',
  standalone: false,
  templateUrl: './nguoi-dung.component.html',
  styleUrls: ['./nguoi-dung.component.css']
})
export class NguoiDungComponent {
  // Danh sách người dùng (dữ liệu mẫu)
  users: User[] = [
    {
      name: 'Hien Dinh',
      email: 'hien1@gmail.com',
      phone: '07238725823',
      role: 'User',
      isActive: true
      // avatarUrl: 'https://link-den-anh.png' // Nếu có ảnh thật, bỏ comment & thay link
    },
    // Thêm người dùng khác nếu muốn
  ];

  // Hàm khoá/mở khoá tài khoản
  toggleStatus(user: User): void {
    user.isActive = !user.isActive;
  }
}
