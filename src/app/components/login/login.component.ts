// login.component.ts - OPTIMIZED VERSION
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../shared/services/user.service';
import { UserLoginDto } from '../../../shared/dtos/userDto.dto';
import { Router, ActivatedRoute } from '@angular/router';
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
  errorMessage: string = '';
  
  // Cinema related properties
  cinemas: Cinema[] = [];
  selectedCinema: string = '';
  isLoadingCinemas: boolean = false;

  constructor(
    public _userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    // Clear any previous error messages
    this.emailError = '';
    this.passwordError = '';
    this.locationError = '';
    this.errorMessage = '';
    
    // Check for error parameters in URL
    this.route.queryParams.subscribe(params => {
      if (params['error'] === 'cinema-access-denied') {
        this.errorMessage = 'Bạn không có quyền truy cập vào rạp này. Vui lòng chọn rạp phù hợp.';
      } else if (params['error']) {
        this.errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.';
      }
    });
    
    // Check if user is already logged in
    const currentUser = this._userService.getCurrentUser();
    if (currentUser) {
      // User is already logged in, redirect based on role
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
        
        // For demo or fallback purposes, use sample data
        this.cinemas = [
          { _id: '682618a044e3d2514d9a6621', cinema_name: 'Beta Giải Phóng', location: 'Hà Nội', total_room: 5, createdAt: '', updatedAt: '', __v: 0 },
          { _id: '682619bb44e3d2514d9a662c', cinema_name: 'Beta Thanh Xuân', location: 'Hồ Chí Minh', total_room: 4, createdAt: '', updatedAt: '', __v: 0 }
        ];
        this.selectedCinema = this.cinemas[0].cinema_name;
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
    
    // Auto-detect if it's the system admin account and adjust validation accordingly
    if (this.email === 'quantrihethong@gmail.com') {
      if (this.locationError) this.locationError = '';
    }
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
    
    // Reset error messages
    this.emailError = '';
    this.passwordError = '';
    this.locationError = '';
    this.errorMessage = '';
    
    let isValid = this.validateForm();
    
    if (isValid) {
      this.isSubmitting = true;
      
      // Special handling for system admin login
      if (this.email === 'quantrihethong@gmail.com') {
        // Hard-coded password check for system admin
        if (this.password === '123456789Abcd') {
          // Clear any previous session data
          localStorage.clear();
          
          // Create a mock system admin user
          const sysAdminUser = {
            _id: 'sysadmin123',
            userId: 'sysadmin123',
            user_name: 'Quản trị hệ thống',
            email: 'quantrihethong@gmail.com',
            role: 4, // System admin role
            token: 'mock-token-admin',
            url_image: 'https://example.com/admin.jpg'
          };
          
          localStorage.setItem('currentUser', JSON.stringify(sysAdminUser));
          localStorage.setItem('token', sysAdminUser.token);
          
          // Redirect to layout after a short delay
          setTimeout(() => {
            this.router.navigateByUrl('/layout/rap');
            this.isSubmitting = false;
          }, 500);
        } else {
          // Wrong password for system admin
          this.passwordError = 'Mật khẩu không đúng';
          this.isSubmitting = false;
        }
        return;
      }
      
      // For regular users, send the selected cinema with the login request
      // Create login DTO with location
      const user = new UserLoginDto({
        email: this.email,
        password: this.password,
        location: this.selectedCinema
      });

      // Call login service with location
      this._userService.login(user).subscribe({
        next: (response) => {
          if (response && response.data) {
            console.log('Login successful:', response);
            
            // Critical check: Verify that the user's assigned cinema in MongoDB matches the selected cinema
            if (response.data.cinema_name && response.data.cinema_name !== this.selectedCinema) {
              // Cinema mismatch - clear auth data and show error
              localStorage.removeItem('currentUser');
              localStorage.removeItem('token');
              localStorage.removeItem('userCinema');
              localStorage.removeItem('userCinemaId');
              
              this.emailError = `Bạn chỉ có thể đăng nhập vào rạp "${response.data.cinema_name}"`;
              this.isSubmitting = false;
              return;
            }
            
            // Find the cinema ID from the selected cinema name
            const selectedCinemaObj = this.cinemas.find(c => c.cinema_name === this.selectedCinema);
            
            // Save the cinema info
            if (selectedCinemaObj && selectedCinemaObj._id) {
              localStorage.setItem('userCinemaId', selectedCinemaObj._id);
              localStorage.setItem('userCinema', this.selectedCinema);
            }
            
            // Successful login - redirect based on role
            setTimeout(() => {
              this.redirectBasedOnRole();
              this.isSubmitting = false;
            }, 300);
          } else {
            // Response format error
            this.emailError = 'Đăng nhập thất bại. Phản hồi không hợp lệ.';
            this.isSubmitting = false;
          }
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

    /* --- Validate location for non-system admin login --- */
    if (this.email !== 'quantrihethong@gmail.com' && !this.selectedCinema) {
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
          this.router.navigateByUrl('/layout/rap');
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