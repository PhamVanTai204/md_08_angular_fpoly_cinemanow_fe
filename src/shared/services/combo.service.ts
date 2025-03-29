// shared/services/combo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Combo {
  _id: string;
  combo_id: string;
  name_combo: string;
  price_combo: number;
  description_combo: string;
  image_combo: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComboService {
  private baseUrl = 'http://127.0.0.1:3000/combos';

  constructor(private http: HttpClient) { }

  getAllCombos(): Observable<Combo[]> {
    return this.http.get<Combo[]>(`${this.baseUrl}/get-all`);
  }

  getComboById(id: string): Observable<Combo> {
    return this.http.get<Combo>(`${this.baseUrl}/get-by-id/${id}`);
  }

  createCombo(combo: Omit<Combo, '_id'>): Observable<Combo> {
    return this.http.post<Combo>(`${this.baseUrl}/create`, combo);
  }

  updateCombo(id: string, combo: Partial<Combo>): Observable<Combo> {
    return this.http.put<Combo>(`${this.baseUrl}/update/${id}`, combo);
  }

  deleteCombo(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }
}