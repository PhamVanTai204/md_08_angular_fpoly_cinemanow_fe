import { Component } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { UserLoginDto } from '../../../shared/dtos/userDto.dto';

@Component({
  selector: 'app-login',
  standalone: false,

  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(public _userService: UserService) { }

  onLogin() {
    const user = new UserLoginDto({ email: this.email, password: this.password });

    this._userService.login(user).subscribe({
      next: (response) => {
        console.log('Đăng nhập thành công:', response);
        // Xử lý lưu token hoặc chuyển hướng
      },
      error: (err) => {
        console.error('Lỗi đăng nhập:', err);
      }
    });
  }
}

