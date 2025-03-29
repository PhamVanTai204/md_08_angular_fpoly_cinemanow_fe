// shared/services/combo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Combo {
  _id: string;
  combo_id: string;
  name_combo: string;
  price_combo: number;
  description_combo: string;
  image_combo: string;
}

// Định nghĩa kiểu dữ liệu cho response
interface ApiResponseWithData {
  data: Combo[];
  success?: boolean;
  message?: string;
}

interface ApiResponseWithCombos {
  combos: Combo[];
  success?: boolean;
  message?: string;
}

type ApiResponse = ApiResponseWithData | ApiResponseWithCombos | Combo[];

@Injectable({
  providedIn: 'root'
})
export class ComboService {
  private baseUrl = 'http://127.0.0.1:3000/combos';

  constructor(private http: HttpClient) { }

  getAllCombos(): Observable<Combo[]> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/get-all`)
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
        })
      );
  }

  getComboById(id: string): Observable<Combo> {
    return this.http.get<Combo | ApiResponse>(`${this.baseUrl}/get-by-id/${id}`)
      .pipe(
        map((response: any) => {
          // Xử lý các trường hợp response khác nhau
          if (typeof response === 'object') {
            if (response.data && !Array.isArray(response.data)) {
              return response.data;
            } else if (!response.data && !response.combos) {
              return response as Combo;
            }
          }
          throw new Error('API không trả về dữ liệu combo hợp lệ');
        })
      );
  }

  createCombo(combo: Omit<Combo, '_id'>): Observable<Combo> {
    return this.http.post<Combo | ApiResponse>(`${this.baseUrl}/create`, combo)
      .pipe(
        map((response: any) => {
          // Xử lý các trường hợp response khác nhau
          if (typeof response === 'object') {
            if (response.data && !Array.isArray(response.data)) {
              return response.data;
            } else if (!response.data && !response.combos) {
              return response as Combo;
            }
          }
          throw new Error('API không trả về dữ liệu combo sau khi tạo');
        })
      );
  }

  updateCombo(id: string, combo: Partial<Combo>): Observable<Combo> {
    return this.http.put<Combo | ApiResponse>(`${this.baseUrl}/update/${id}`, combo)
      .pipe(
        map((response: any) => {
          // Xử lý các trường hợp response khác nhau
          if (typeof response === 'object') {
            if (response.data && !Array.isArray(response.data)) {
              return response.data;
            } else if (!response.data && !response.combos) {
              return response as Combo;
            }
          }
          throw new Error('API không trả về dữ liệu combo sau khi cập nhật');
        })
      );
  }

  deleteCombo(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }
}