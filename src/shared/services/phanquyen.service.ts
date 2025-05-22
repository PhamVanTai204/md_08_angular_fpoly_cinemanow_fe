import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import {
  ApiResponse,
  User,
  UsersByRoleResponse,
  PaginationParams,
  UserFilter,
  UserCreateUpdate
} from '../dtos/phanquyenDto.dto';

@Injectable({
  providedIn: 'root'
})
export class PhanQuyenService {
  private baseUrl = 'http://127.0.0.1:3000/users';

  // Role constants for better readability
  public static readonly ROLE_USER = 1;          // Regular user
  public static readonly ROLE_CINEMA_ADMIN = 2;  // Cinema Manager
  public static readonly ROLE_STAFF = 3;         // Staff member
  public static readonly ROLE_SYSTEM_ADMIN = 4;  // System Administrator

  constructor(private http: HttpClient) { }

  // Lấy headers với token xác thực
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Lấy danh sách người dùng theo vai trò
  getUsersByRole(role: number, params: PaginationParams): Observable<UsersByRoleResponse> {
    const { page, limit } = params;
    return this.http.get<UsersByRoleResponse>(
      `${this.baseUrl}/usersByRole/${role}?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }

  // Lấy tất cả người dùng
  getAllUsers(): Observable<User[]> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/getAll`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          if (response.code === 200 && Array.isArray(response.data)) {
            return response.data as User[];
          }
          return [];
        })
      );
  }

  // Lấy thông tin chi tiết người dùng theo ID
  getUserById(userId: string): Observable<User | null> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/getById/${userId}`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          if (response.code === 200 && !Array.isArray(response.data)) {
            return response.data as User;
          }
          return null;
        })
      );
  }

  // Lấy thông tin người dùng hiện tại
  getCurrentUser(): Observable<User | null> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/me`, { headers: this.getHeaders() })
      .pipe(
        map(response => {
          if (response.code === 200) {
            const userData = Array.isArray(response.data) ? response.data[0] : response.data;
            return userData as User;
          }
          return null;
        })
      );
  }

  // Đăng ký người dùng mới (Admin hoặc Nhân viên)
  registerUser(userData: UserCreateUpdate): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.baseUrl}/reg`,
      userData,
      { headers: this.getHeaders() }
    );
  }

  // Thêm người dùng mới
  createUser(userData: UserCreateUpdate): Observable<ApiResponse> {
    // Sử dụng API đăng ký người dùng thay vì API insert
    return this.registerUser(userData);
  }

  // Cập nhật thông tin người dùng
  updateUser(userId: string, userData: UserCreateUpdate): Observable<ApiResponse> {
    console.log('Service updateUser called with ID:', userId);
    console.log('Update data:', userData);

    return this.http.patch<ApiResponse>(
      `${this.baseUrl}/update-profile/${userId}`, // Correct endpoint
      userData,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => console.log('Update response:', response)),
      catchError(error => {
        console.error('Update error:', error);
        return throwError(() => error);
      })
    );
  }
  // Cập nhật trạng thái người dùng (khóa/mở khóa)
  updateUserStatus(userId: string, isActive: boolean): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.baseUrl}/updateStatus/${userId}`,
      { isActive },
      { headers: this.getHeaders() }
    );
  }

  // Xóa người dùng
  deleteUser(userId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.baseUrl}/deleteUser/${userId}`,
      { headers: this.getHeaders() }
    );
  }

  // Các hàm tiện ích - updated to match the correct role IDs
  getRoleName(roleId: number): string {
    switch (Number(roleId)) {
      
      case PhanQuyenService.ROLE_CINEMA_ADMIN: return 'Quản trị rạp';
      case PhanQuyenService.ROLE_STAFF: return 'Nhân viên rạp';
      case PhanQuyenService.ROLE_SYSTEM_ADMIN: return 'Quản trị hệ thống';
      default: return 'Không xác định';
    }
  }

  // Lưu thông tin người dùng hiện tại vào localStorage
  saveCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Lấy thông tin người dùng hiện tại từ localStorage
  getSavedCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch (e) {
        console.error('Lỗi khi parse dữ liệu người dùng từ localStorage:', e);
      }
    }
    return null;
  }

  // Kiểm tra người dùng hiện tại có phải admin không - updated for different admin types
  isUserAdmin(user: User | null): boolean {
    if (!user) return false;
    
    const role = Number(user.role);
    return role === PhanQuyenService.ROLE_CINEMA_ADMIN || role === PhanQuyenService.ROLE_SYSTEM_ADMIN;
  }
  
  // Check if user is system admin
  isSystemAdmin(user: User | null): boolean {
    return user ? Number(user.role) === PhanQuyenService.ROLE_SYSTEM_ADMIN : false;
  }
  
  // Check if user is cinema admin
  isCinemaAdmin(user: User | null): boolean {
    return user ? Number(user.role) === PhanQuyenService.ROLE_CINEMA_ADMIN : false;
  }
  
  // Check if user is staff
  isStaff(user: User | null): boolean {
    return user ? Number(user.role) === PhanQuyenService.ROLE_STAFF : false;
  }
}