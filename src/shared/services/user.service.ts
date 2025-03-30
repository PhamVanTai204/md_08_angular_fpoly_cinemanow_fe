import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UserLoginDto } from "../dtos/userDto.dto";
import { catchError, Observable, tap, throwError } from "rxjs";

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
  
  constructor(private http: HttpClient) { }
  
  // Lấy headers với token xác thực
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
  
  // Đăng nhập
  login(user: UserLoginDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, user.toJSON()).pipe(
      tap(response => {
        // Lưu thông tin người dùng vào localStorage
        if (response && response.data) {
          localStorage.setItem('currentUser', JSON.stringify(response.data));
          localStorage.setItem('token', response.token || '');
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
  
  // Lấy danh sách người dùng
  getAllUsers(): Observable<User[]> {
    const headers = this.getHeaders();
    return this.http.get<User[]>(`${this.baseUrl}/getAll`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching users:', error);
        return throwError(() => new Error(error.message || 'Server error'));
      })
    );
  }
  
  // Khoá/mở khoá người dùng (giả lập vì API chưa có endpoint này)
  toggleUserStatus(userId: string, isActive: boolean): Observable<any> {
    const headers = this.getHeaders();
    // Giả sử API endpoint có dạng /users/toggleStatus/{id}
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
  
  // Lấy người dùng hiện tại từ localStorage
  getCurrentUser(): any {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }
  
  // Lấy ID người dùng hiện tại
  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    return user ? user._id || user.userId : null;
  }
  
  // Kiểm tra người dùng đã đăng nhập
  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }
  
  // Kiểm tra vai trò standard user (role 1)
  isStandardUser(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 1 : false;
  }
  
  // Kiểm tra vai trò admin (role 2)
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 2 : false;
  }
  
  // Kiểm tra vai trò super admin hoặc manager (role 3)
  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 3 : false;
  }
  
  // Kiểm tra role theo số
  hasRole(roleNumber: number): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === roleNumber : false;
  }
}