import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { UserLoginDto } from "../dtos/userDto.dto";
import { catchError, Observable, tap, throwError } from "rxjs";
import { Router } from "@angular/router";

export interface User {
  _id: string;
  user_name: string;
  email: string;
  password?: string;
  url_image?: string;
  role: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://127.0.0.1:3000/users';

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

  // Standard login
  login(user: UserLoginDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, user.toJSON()).pipe(
      tap(response => {
        // Save user info to localStorage
        if (response && response.data) {
          localStorage.setItem('currentUser', JSON.stringify(response.data));
          localStorage.setItem('token', response.data.token || '');
        } else if (response) {
          localStorage.setItem('currentUser', JSON.stringify(response));
        }
      }),
      catchError(error => {
        console.error('LoginService Error:', error);
        return throwError(() => new Error(error.message || 'Server error'));
      })
    );
  }

  // Login with location
  loginWithLocation(user: UserLoginDto): Observable<any> {
    // Use the location-specific endpoint
    return this.http.post<any>(`${this.baseUrl}/loginWebByLocation`, user.toJSON()).pipe(
      tap(response => {
        // Save user info to localStorage
        if (response && response.data) {
          localStorage.setItem('currentUser', JSON.stringify(response.data));
          localStorage.setItem('token', response.data.token || '');
          // Save location info for later use if needed
          if (user.location) {
            localStorage.setItem('userLocation', user.location);
          }
        } else if (response) {
          localStorage.setItem('currentUser', JSON.stringify(response));
        }
      }),
      catchError(error => {
        console.error('LoginService Error:', error);
        return throwError(() => new Error(error.message || 'Server error'));
      })
    );
  }

  // Logout
  logout(): void {
    // Remove user info and token from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('userLocation');

    // Navigate to login page
    this.router.navigate(['/login']);
  }

  // Get all users
  getAllUsers(): Observable<User[]> {
    const headers = this.getHeaders();
    return this.http.get<User[]>(`${this.baseUrl}/getAll`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching users:', error);
        return throwError(() => new Error(error.message || 'Server error'));
      })
    );
  }

  // Toggle user status (active/inactive)
  toggleUserStatus(userId: string, isActive: boolean): Observable<any> {
    const headers = this.getHeaders();
    return this.http.patch<any>(`${this.baseUrl}/toggleStatus/${userId}`,
      { isActive },
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error toggling user status:', error);
        return throwError(() => new Error(error.message || 'Server error'));
      })
    );
  }

  // Get current user from localStorage
  getCurrentUser(): any {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  // Get current user ID
  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    return user ? user._id || user.userId : null;
  }

  // Get current user location
  getCurrentUserLocation(): string | null {
    return localStorage.getItem('userLocation');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  // Role checking methods
  isStaff(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 3 : false;
  }

  isCinemaAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 2 : false;
  }

  isSystemAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 4 : false;
  }

  // Generic role checking
  hasRole(roleNumber: number): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === roleNumber : false;
  }
}