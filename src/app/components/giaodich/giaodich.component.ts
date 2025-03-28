import { Component } from '@angular/core';

@Component({
  selector: 'app-giaodich',
  standalone: false,

  templateUrl: './giaodich.component.html',
  styleUrl: './giaodich.component.css'
})
export class GiaodichComponent {
  email: string = '';
  password: string = '';

  onLogin() {
    console.log('Email:', this.email);
    console.log('Mật khẩu:', this.password);
    alert('Đăng nhập thành công!');
  }
}
