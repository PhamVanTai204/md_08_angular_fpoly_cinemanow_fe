import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { UserLoginDto } from "../dtos/userDto.dto";
import { catchError, Observable, tap, throwError } from "rxjs";
import { Router } from "@angular/router";

export interface User {
  userId: string;
  _id?: string;
  user_name: string;
  email: string;
  password?: string;
  url_image?: string;
  role: number;
  isActive?: boolean;
  cinema_id?: string;
  cinema_name?: string;
  location?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: number | null;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://127.0.0.1:3000/users';

  // Role constants for better readability
  
  public static readonly ROLE_CINEMA_ADMIN = 2;  // Cinema Manager
  public static readonly ROLE_STAFF = 3;         // Staff member
  public static readonly ROLE_SYSTEM_ADMIN = 4;  // System Administrator

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  // Get authentication headers with token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Primary login method that sends location to the backend
  login(user: UserLoginDto): Observable<any> {
    // Ensure we're using the correct endpoint that validates location
    return this.http.post<any>(`${this.baseUrl}/loginWebByLocation`, user.toJSON()).pipe(
      tap(response => {
        // Only save user info if there's a successful login with data
        if (response && response.data) {
          localStorage.setItem('currentUser', JSON.stringify(response.data));
          localStorage.setItem('token', response.data.token || '');

          // Save location info if available
          if (response.data.cinema_name) {
            localStorage.setItem('userCinema', response.data.cinema_name);
          }

          // Save cinema ID if available
          if (response.data.cinema_id) {
            localStorage.setItem('userCinemaId', response.data.cinema_id);
          }
        }
      }),
      catchError(error => {
        console.error('Login Error:', error);

        // Clear any partial authentication data on error
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        localStorage.removeItem('userCinema');
        localStorage.removeItem('userCinemaId');

        return throwError(() => new Error(error.message || 'Server error'));
      })
    );
  }

  // Maintains compatibility with older code
  loginWithLocation(user: UserLoginDto): Observable<any> {
    return this.login(user);
  }

  // Logout
  logout(): void {
    // Remove user info and token from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('userCinema');
    localStorage.removeItem('userCinemaId');

    // Navigate to login page
    this.router.navigate(['/login']);
  }

  // Get current user from localStorage
  getCurrentUser(): any {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing currentUser from localStorage:', e);
        return null;
      }
    }
    return null;
  }

  // Get current user ID
  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    return user ? user.userId || user._id : null;
  }

  // Get current user cinema ID
  getCurrentUserCinemaId(): string | null {
    const user = this.getCurrentUser();
    if (user && user.cinema_id) {
      return user.cinema_id;
    }
    return localStorage.getItem('userCinemaId');
  }

  // Get current user cinema name
  getCurrentUserCinema(): string | null {
    const user = this.getCurrentUser();
    if (user && user.cinema_name) {
      return user.cinema_name;
    }
    return localStorage.getItem('userCinema');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  // Role checking methods - updated to match the correct role IDs
  isStaff(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === UserService.ROLE_STAFF : false;
  }

  isCinemaAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === UserService.ROLE_CINEMA_ADMIN : false;
  }

  isSystemAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === UserService.ROLE_SYSTEM_ADMIN : false;
  }

  // Get role name for display
  getRoleName(roleId: number): string {
    switch (Number(roleId)) {
      
      case UserService.ROLE_CINEMA_ADMIN: return 'Quản trị rạp';
      case UserService.ROLE_STAFF: return 'Nhân viên rạp';
      case UserService.ROLE_SYSTEM_ADMIN: return 'Quản trị hệ thống';
      default: return 'Không xác định';
    }
  }

  // Check if user has access to a specific cinema
  hasAccessToCinema(cinemaId: string): boolean {
    // System admin has access to all cinemas
    if (this.isSystemAdmin()) {
      return true;
    }

    const userCinemaId = this.getCurrentUserCinemaId();
    return userCinemaId === cinemaId;
  }
}