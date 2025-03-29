// shared/services/combo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';

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
        }),
        catchError(error => {
          console.error('Error in getAllCombos:', error);
          throw error;
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
        }),
        catchError(error => {
          console.error('Error in getComboById:', error);
          throw error;
        })
      );
  }

  createCombo(combo: Omit<Combo, '_id'>): Observable<Combo> {
    // Đảm bảo rằng combo đủ các trường cần thiết
    const comboToCreate = {
      combo_id: combo.combo_id,
      name_combo: combo.name_combo,
      price_combo: Number(combo.price_combo),
      description_combo: combo.description_combo || '',
      image_combo: combo.image_combo || ''
    };

    return this.http.post<Combo | ApiResponse>(`${this.baseUrl}/create`, comboToCreate)
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
        }),
        catchError(error => {
          console.error('Error in createCombo:', error);
          throw error;
        })
      );
  }

  updateCombo(id: string, combo: Partial<Combo>): Observable<Combo> {
    // Đảm bảo rằng combo đủ các trường cần thiết để cập nhật
    const comboToUpdate = {
      combo_id: combo.combo_id,
      name_combo: combo.name_combo,
      price_combo: Number(combo.price_combo),
      description_combo: combo.description_combo,
      image_combo: combo.image_combo
    };

    return this.http.put<Combo | ApiResponse>(`${this.baseUrl}/update/${id}`, comboToUpdate)
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
        }),
        catchError(error => {
          console.error('Error in updateCombo:', error);
          throw error;
        })
      );
  }

  deleteCombo(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error in deleteCombo:', error);
          throw error;
        })
      );
  }
}