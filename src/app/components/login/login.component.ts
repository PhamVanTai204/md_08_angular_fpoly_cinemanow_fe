import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../shared/services/user.service';
import { UserLoginDto } from '../../../shared/dtos/userDto.dto';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Cinema {
  _id: string;
  cinema_name: string;
  location: string;
  total_room: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  emailError: string = '';
  passwordError: string = '';
  locationError: string = '';
  isSubmitting: boolean = false;
  
  // Cinema related properties
  cinemas: Cinema[] = [];
  selectedCinema: string = '';
  isLoadingCinemas: boolean = false;

  constructor(
    public _userService: UserService,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    // Check if user is already logged in, redirect if needed
    if (this._userService.isLoggedIn()) {
      this.redirectBasedOnRole();
      return;
    }
    
    // Load cinemas when component initializes
    this.loadCinemas();
  }

  /**
   * Loads the list of cinemas from the API
   */
  loadCinemas(): void {
    this.isLoadingCinemas = true;
    this.http.get<any>('http://127.0.0.1:3000/cinema/getcinema').subscribe({
      next: (response) => {
        if (response && response.data && response.data.cinemas) {
          this.cinemas = response.data.cinemas;
          // Default select the first cinema if available
          if (this.cinemas.length > 0) {
            this.selectedCinema = this.cinemas[0].cinema_name;
          }
        }
        this.isLoadingCinemas = false;
      },
      error: (err) => {
        console.error('Error loading cinemas:', err);
        this.isLoadingCinemas = false;
      }
    });
  }

  /**
   * Validates email format
   * Only allows emails with 3-50 characters (a-z, 0-9) + '@gmail.com'
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

  handleLocationChange(): void {
    if (this.locationError) this.locationError = '';
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handles the login form submission
   */
  handleSubmit(e: Event): void {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (this.isSubmitting) {
      return;
    }
    
    let isValid = this.validateForm();

    if (isValid) {
      this.isSubmitting = true;
      
      // Create login object with location
      const user = new UserLoginDto({
        email: this.email,
        password: this.password,
        location: this.selectedCinema
      });

      // Call login service with location
      this._userService.loginWithLocation(user).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          
          // Allow UI to update before redirect
          setTimeout(() => {
            this.redirectBasedOnRole();
            this.isSubmitting = false;
          }, 100);
        },
        error: (err) => {
          console.error('Login error:', err);
          this.emailError = 'Đăng nhập thất bại. Vui lòng thử lại.';
          this.isSubmitting = false;
        }
      });
    }
  }
  
  /**
   * Validates all form fields and returns validation status
   */
  private validateForm(): boolean {
    let isValid = true;

    /* --- Validate email --- */
    if (!this.email) {
      this.emailError = 'Vui lòng nhập tài khoản';
      isValid = false;
    } else if (!this.validateEmail(this.email)) {
      this.emailError = 'Tài khoản 3-50 ký tự (a-z, 0-9) và kết thúc bằng @gmail.com';
      isValid = false;
    }

    /* --- Validate password --- */
    if (!this.password) {
      this.passwordError = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (this.password.length < 8 || this.password.length > 50) {
      this.passwordError = 'Mật khẩu phải dài 8-50 ký tự';
      isValid = false;
    }

    /* --- Validate location --- */
    if (!this.selectedCinema) {
      this.locationError = 'Vui lòng chọn rạp phim';
      isValid = false;
    }
    
    return isValid;
  }
  
  /**
   * Redirects user to appropriate page based on role
   */
  private redirectBasedOnRole(): void {
    const currentUser = this._userService.getCurrentUser();
    
    if (currentUser && currentUser.role) {
      switch (currentUser.role) {
        case 4: // System Administrator
          this.router.navigateByUrl('/layout/admin');
          break;
        case 3: // Staff
          this.router.navigateByUrl('/layout/giaodich');
          break;
        case 2: // Cinema Manager
          this.router.navigateByUrl('/layout/phim');
          break;
        default:
          this.router.navigateByUrl('/layout');
      }
    } else {
      this.router.navigateByUrl('/layout');
    }
  }
}