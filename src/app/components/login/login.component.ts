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

  /* === VALIDATE MỚI === */
  /**
   * Chỉ cho phép username 3-50 ký tự (a-z, 0-9) + '@gmail.com'
   */
  validateEmail(email: string): boolean {
    const regex = /^[a-z0-9]{3,50}@gmail\.com$/;
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

    /* --- validate tài khoản --- */
    if (!this.email) {
      this.emailError = 'Vui lòng nhập tài khoản';
      isValid = false;
    } else if (!this.validateEmail(this.email)) {
      this.emailError = 'Tài khoản 3-50 ký tự (a-z, 0-9) và kết thúc bằng @gmail.com';
      isValid = false;
    }

    /* --- validate mật khẩu --- */
    if (!this.password) {
      this.passwordError = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (this.password.length < 8 || this.password.length > 50) {
      this.passwordError = 'Mật khẩu phải dài 8-50 ký tự';
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

          setTimeout(() => {
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
