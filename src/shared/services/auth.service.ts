// shared/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  userId: string;
  user_name: string;
  email: string;
  role: number;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor() {
    // Khởi tạo từ localStorage nếu có
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Lấy thông tin người dùng hiện tại
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Lưu thông tin người dùng đã đăng nhập
  public setCurrentUser(user: any): void {
    // Kiểm tra các trường cần thiết
    if (user && user.userId && user.token) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
    } else if (user && user.data && user.data.userId && user.token) {
      // Trường hợp API trả về dạng { data: { ... }, token: '...' }
      const userData = {
        ...user.data,
        token: user.token
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      this.currentUserSubject.next(userData);
    }
  }

  // Đăng xuất
  public logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Kiểm tra xem người dùng đã đăng nhập chưa
  public isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  // Lấy ID của người dùng hiện tại
  public getCurrentUserId(): string | null {
    return this.currentUserValue ? this.currentUserValue.userId : null;
  }

  // Kiểm tra vai trò (admin = 2)
  public isAdmin(): boolean {
    return this.currentUserValue ? this.currentUserValue.role === 2 : false;
  }

  // Lấy token xác thực
  public getAuthToken(): string | null {
    return this.currentUserValue ? this.currentUserValue.token || null : null;
  }
}