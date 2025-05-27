// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../../environments/environment';

// export interface Cinema {
//   _id: string;
//   cinema_name: string;
//   address: string;
// }

// export interface CinemaAdmin {
//   _id: string;
//   user_name: string;
//   email: string;
//   password: string;
//   url_image: string;
//   role: number;
//   location: string;
//   cinema_id: string;
// }

// export interface ApiResponse<T> {
//   status: number;
//   message: string;
//   data: T;
// }

// export interface CinemaListResponse {
//   cinemas: Cinema[];
//   totalCinemas: number;
//   totalPages: number;
//   currentPage: number;
//   pageSize: number;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class CinemaAdminService {
//   private apiUrl = environment.apiUrl;

//   constructor(private http: HttpClient) { }

//   // Lấy danh sách rạp
//   getAllCinemas(page: number, limit: number, search: string = ''): Observable<any> {
//     return this.http.get<any>(`${this.apiUrl}/cinema?page=${page}&limit=${limit}&search=${search}`);
//   }

//   // Đăng ký admin cho rạp
//   registerAdminByCinema(adminData: any): Observable<any> {
//     return this.http.post<any>(`${this.apiUrl}/admin/register`, adminData);
//   }

//   // Xóa admin rạp
//   removeCinemaAdmin(adminId: string): Observable<any> {
//     return this.http.delete<any>(`${this.apiUrl}/admin/${adminId}`);
//   }
// }
