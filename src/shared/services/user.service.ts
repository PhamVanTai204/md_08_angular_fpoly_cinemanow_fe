// shared/services/user.service.ts
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UserLoginDto } from "../dtos/userDto.dto";
import { catchError, Observable, tap, throwError } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://127.0.0.1:3000/users';

  constructor(private http: HttpClient) { }

  // Đăng nhập đơn giản
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
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getAll`);
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
}