// login.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../shared/services/user.service';
import { UserLoginDto } from '../../../shared/dtos/userDto.dto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  emailError: string = '';
  passwordError: string = '';

  constructor(
    public _userService: UserService,
    private router: Router
  ) { }

  validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  handleEmailChange(): void {
    if (this.emailError) this.emailError = '';
  }

  handlePasswordChange(): void {
    if (this.passwordError) this.passwordError = '';
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  handleSubmit(e: Event): void {
    e.preventDefault();
    let isValid = true;

    if (!this.email) {
      this.emailError = 'Vui lòng nhập email';
      isValid = false;
    } else if (!this.validateEmail(this.email)) {
      this.emailError = 'Email không hợp lệ';
      isValid = false;
    }

    if (!this.password) {
      this.passwordError = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (this.password.length < 6) {
      this.passwordError = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    if (isValid) {
      // Tạo đối tượng đăng nhập
      const user = new UserLoginDto({
        email: this.email,
        password: this.password
      });

      // Gọi service đăng nhập
      this._userService.login(user).subscribe({
        next: (response) => {
          console.log('Đăng nhập thành công:', response);

          // Lưu token và thông tin người dùng (đã được xử lý trong UserService)
          // Thêm timeout nhỏ để đảm bảo token được lưu trước khi điều hướng
          setTimeout(() => {
            // Điều hướng đến trang layout sau khi đăng nhập thành công
            this.router.navigateByUrl('/layout');
          }, 100);
        },
        error: (err) => {
          console.error('Lỗi đăng nhập:', err);
          this.emailError = 'Đăng nhập thất bại. Vui lòng thử lại.';
        }
      });
    }
  }
}