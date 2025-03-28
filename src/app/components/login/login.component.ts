// login.component.ts
import { Component } from '@angular/core';
import { UserService } from '../../../shared/services/user.service';
import { UserLoginDto } from '../../../shared/dtos/userDto.dto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    public _userService: UserService,
    private router: Router
  ) { }

  onLogin(event?: Event) {
    if (event) {
      event.preventDefault(); // Ngăn chặn form submit mặc định
    }
    
    // Đơn giản chỉ kiểm tra có nhập thông tin không
    if (!this.email || !this.password) {
      this.errorMessage = 'Vui lòng nhập email và mật khẩu';
      return;
    }

    // Tạo đối tượng đăng nhập
    const user = new UserLoginDto({ 
      email: this.email, 
      password: this.password 
    });

    // Gọi service đăng nhập
    this._userService.login(user).subscribe({
      next: (response) => {
        console.log('Đăng nhập thành công:', response);
        
        // Điều hướng đến trang chính sau khi đăng nhập
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Lỗi đăng nhập:', err);
        this.errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
      }
    });
  }
}