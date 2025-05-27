import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError, of } from 'rxjs';

export interface Cinema {
  _id: string;
  cinema_name: string;
  location: string;
  address: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CinemaAdmin {
  _id: string;
  user_name: string;
  email: string;
  password: string;
  url_image: string;
  role: number;
  location: string; // Tên rạp
  createdAt?: string;
  updatedAt?: string;
  cinema_id?: string;
  role_name?: string; // Tên vai trò
}

export interface RegisterAdminRequest {
  user_name: string;
  email: string;
  password: string;
  url_image: string;
  role: number;
  location: string; // Tên rạp
  cinema_id: string;
}

export interface CinemaApiResponse {
  code: number;
  error: string | null;
  data: {
    cinemas: Cinema[];
    totalCinemas: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export interface CinemaAdminResponse {
  code: number;
  error: string | null;
  data: {
    admins: CinemaAdmin[];
    totalAdmins: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export interface LoginAdminRequest {
  email: string;
  password: string;
}

export interface LoginAdminResponse {
  code: number;
  error: string | null;
  data: {
    token: string;
    user: CinemaAdmin;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CinemaAdminService {
  private baseUrl = 'http://127.0.0.1:3000';

  constructor(private http: HttpClient) { }

  // Lấy danh sách rạp
  getAllCinemas(page: number = 1, limit: number = 10, search: string = ''): Observable<CinemaApiResponse['data']> {
    return this.http.get<CinemaApiResponse>(
      `${this.baseUrl}/cinema/getcinema?page=${page}&limit=${limit}&search=${search}`
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Lấy danh sách admin của một rạp
  getAdminsByCinema(cinemaId: string, page: number = 1, limit: number = 10): Observable<{
    admins: CinemaAdmin[],
    totalAdmins: number,
    totalPages: number,
    currentPage: number,
    pageSize: number
  }> {
    return this.http.get<CinemaAdminResponse>(
      `${this.baseUrl}/users/get-admin-by-id-cinema/${cinemaId}?page=${page}&limit=${limit}`
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Thêm admin cho rạp
  addCinemaAdmin(admin: Partial<CinemaAdmin>, cinemaId: string): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/users/add-cinema-admin`,
      {
        ...admin,
        cinema_id: cinemaId,
        role: 3 // Role 3 cho admin rạp
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Đăng ký admin cho rạp thông qua API mới
  registerAdminByCinema(adminData: RegisterAdminRequest): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/users/registerWebByLocation`,
      adminData
    ).pipe(
      catchError(this.handleError)
    );
  }

  // Xóa admin của rạp
  removeCinemaAdmin(cinemaId: string, adminId: string): Observable<any> {
  return this.http.delete<any>(
    `${this.baseUrl}/users/delete-admin-by-cinema/${cinemaId}/${adminId}`
  ).pipe(
    catchError(this.handleError)
  );
}


  // Đăng nhập admin rạp
  loginAdminByCinema(loginData: LoginAdminRequest): Observable<any> {
    return this.http.post<LoginAdminResponse>(
      `${this.baseUrl}/users/loginWebByLocation`,
      loginData
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  // Kiểm tra email đã tồn tại chưa
  checkEmailExists(email: string): Observable<boolean> {
    const encodedEmail = encodeURIComponent(email);
    return this.http.get<any>(
      `${this.baseUrl}/users/checkEmail/${encodedEmail}`
    ).pipe(
      map(response => response.exists || false),
      catchError(error => {
        console.error('Error checking email:', error);
        return of(false);
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('CinemaAdminService Error:', error);
    let errorMessage = 'Đã xảy ra lỗi không xác định!';

    if (error.error instanceof ErrorEvent) {
      // Lỗi phía client
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Lỗi phía server
      if (error.status === 409) {
        // Xử lý lỗi Conflict
        errorMessage = error.error.error || error.error.message || 'Email hoặc tên người dùng đã tồn tại trong hệ thống';
      } else if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
