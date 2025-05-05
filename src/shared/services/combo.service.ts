// shared/services/combo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { ComboDto } from '../dtos/ComboDto.dto';

export interface Combo {
  _id: string;
  combo_id: string;
  name_combo: string;
  price_combo: number;
  description_combo: string;
  image_combo: string;
  user_id?: any; // Có thể là string hoặc object chứa thông tin người dùng
  quantity?: number; // Thêm field quantity
}

// Định nghĩa kiểu dữ liệu cho response
interface ApiResponseWithData {
  data: Combo[];
  success?: boolean;
  message?: string;
  code?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})

export class ComboService {
  private baseUrl = 'http://127.0.0.1:3000/combos';

  constructor(private http: HttpClient) { }

  // Lấy headers với token xác thực
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
  getAllCombos1(): Observable<ComboDto[]> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.baseUrl}/get-all`, { headers })
      .pipe(
        map((response: any) => {
          // Nếu response là mảng, ánh xạ từng combo thành ComboDto
          if (Array.isArray(response)) {
            return response.map((combo: any) => ComboDto.fromJS(combo));
          }
          // Nếu response là object chứa mảng data
          else if (response && typeof response === 'object') {
            if (response.data && Array.isArray(response.data)) {
              return response.data.map((combo: any) => ComboDto.fromJS(combo));
            }
          }
          // Trường hợp không tìm thấy mảng, trả về mảng rỗng
          console.warn('API không trả về dữ liệu mong đợi:', response);
          return [];
        }),
        catchError(error => {
          console.error('Error in getAllCombos:', error);
          throw error;
        })
      );
  }
  // Lấy tất cả combos với ComboDto
  getAllCombos(): Observable<ComboDto[]> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.baseUrl}/get-all`, { headers })
      .pipe(
        map((response: any) => {
          // Nếu response là mảng, ánh xạ từng combo thành ComboDto
          if (Array.isArray(response)) {
            return response.map((combo: any) => ComboDto.fromJS(combo));
          }
          // Nếu response là object chứa mảng data
          else if (response && typeof response === 'object') {
            if (response.data && Array.isArray(response.data)) {
              return response.data.map((combo: any) => ComboDto.fromJS(combo));
            }
            // Nếu response là object chứa mảng combos
            else if (response.combos && Array.isArray(response.combos)) {
              return response.combos.map((combo: any) => ComboDto.fromJS(combo));
            }
          }
          // Trường hợp không tìm thấy mảng, trả về mảng rỗng
          console.warn('API không trả về dữ liệu mong đợi:', response);
          return [];
        }),
        catchError(error => {
          console.error('Error in getAllCombos:', error);
          throw error;
        })
      );
  }

  // Giữ lại phương thức này để tương thích với mã cũ nhưng đổi tên
  getAllCombosLegacy(): Observable<Combo[]> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.baseUrl}/get-all`, { headers })
      .pipe(
        map((response: any) => {
          // Nếu response là mảng, trả về trực tiếp
          if (Array.isArray(response)) {
            return response;
          }
          // Nếu response là object chứa mảng data
          else if (response && typeof response === 'object') {
            if (response.data && Array.isArray(response.data)) {
              return response.data;
            }
            // Nếu response là object chứa mảng combos
            else if (response.combos && Array.isArray(response.combos)) {
              return response.combos;
            }
          }
          // Trường hợp không tìm thấy mảng, trả về mảng rỗng
          console.warn('API không trả về dữ liệu mong đợi:', response);
          return [];
        }),
        catchError(error => {
          console.error('Error in getAllCombosLegacy:', error);
          throw error;
        })
      );
  }

  // Lấy chi tiết combo theo ComboDto
  getComboById(id: string): Observable<ComboDto> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.baseUrl}/get-by-id/${id}`, { headers })
      .pipe(
        map((response: any) => {
          // Xử lý các trường hợp response khác nhau
          if (typeof response === 'object') {
            if (response.data && !Array.isArray(response.data)) {
              return ComboDto.fromJS(response.data);
            } else if (!response.data && !response.combos) {
              return ComboDto.fromJS(response);
            }
          }
          throw new Error('API không trả về dữ liệu combo hợp lệ');
        }),
        catchError(error => {
          console.error('Error in getComboById:', error);
          throw error;
        })
      );
  }

  // Tạo combo mới
  createCombo(combo: Partial<ComboDto>): Observable<ComboDto> {
    const headers = this.getHeaders();

    console.log('Creating combo with data:', combo);

    return this.http.post<any>(`${this.baseUrl}/create`, combo.toJSON ? combo.toJSON() : combo, { headers })
      .pipe(
        map((response: any) => {
          console.log('Create combo response:', response);
          // Xử lý các trường hợp response khác nhau
          if (typeof response === 'object') {
            if (response.data && !Array.isArray(response.data)) {
              return ComboDto.fromJS(response.data);
            } else if (!response.data && !response.combos) {
              return ComboDto.fromJS(response);
            }
          }
          throw new Error('API không trả về dữ liệu combo sau khi tạo');
        }),
        catchError(error => {
          console.error('Error in createCombo:', error);
          throw error;
        })
      );
  }

  // Cập nhật combo
  updateCombo(id: string, combo: Partial<ComboDto>): Observable<ComboDto> {
    const headers = this.getHeaders();

    console.log('Updating combo with data:', combo);

    return this.http.put<any>(`${this.baseUrl}/update/${id}`, combo.toJSON ? combo.toJSON() : combo, { headers })
      .pipe(
        map((response: any) => {
          console.log('Update combo response:', response);
          // Xử lý các trường hợp response khác nhau
          if (typeof response === 'object') {
            if (response.data && !Array.isArray(response.data)) {
              return ComboDto.fromJS(response.data);
            } else if (!response.data && !response.combos) {
              return ComboDto.fromJS(response);
            }
          }
          throw new Error('API không trả về dữ liệu combo sau khi cập nhật');
        }),
        catchError(error => {
          console.error('Error in updateCombo:', error);
          throw error;
        })
      );
  }

  // Xóa combo
  deleteCombo(id: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.baseUrl}/delete/${id}`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error in deleteCombo:', error);
          throw error;
        })
      );
  }
}