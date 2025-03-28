import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ShowtimesDto } from '../dtos/showtimesDto.dto';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ShowtimesService {
  // Chú ý baseUrl phải trùng với app.use('/showtimes', showTimeRoutes);
  private baseUrl = 'http://127.0.0.1:3000/showtimes';

  // Các endpoint cụ thể
  private getAllUrl = `${this.baseUrl}/get-all`;
  private getByIdUrl = `${this.baseUrl}/get-by-id`;
  private createUrl = `${this.baseUrl}/create`;
  private updateUrl = `${this.baseUrl}/update`;
  private deleteUrl = `${this.baseUrl}/delete`;

  constructor(private http: HttpClient) { }

  getAllShowtimes(): Observable<ShowtimesDto[]> {
    return this.http.get<any>(this.getAllUrl).pipe(
      map(response => {
        // Giả sử server trả về { code: 200, data: [...] }
        if (response && response.code === 200 && Array.isArray(response.data)) {
          return response.data.map((item: any) => ShowtimesDto.fromJS(item));
        }
        throw new Error('Failed to fetch showtimes');
      }),
      catchError(this.handleError)
    );
  }

  getShowtimeById(id: string): Observable<ShowtimesDto> {
    return this.http.get<any>(`${this.getByIdUrl}/${id}`).pipe(
      map(response => {
        // Giả sử server trả về { code: 200, data: {...} }
        if (response && response.code === 200 && response.data) {
          return ShowtimesDto.fromJS(response.data);
        }
        throw new Error('Failed to fetch showtime by id');
      }),
      catchError(this.handleError)
    );
  }

  createShowtime(showtime: ShowtimesDto): Observable<ShowtimesDto> {
    return this.http.post<any>(this.createUrl, showtime.toJSON()).pipe(
      map(response => {
        // Giả sử server trả về { code: 201, data: {...} } hoặc { code: 200, data: {...} }
        if (response && (response.code === 201 || response.code === 200) && response.data) {
          return ShowtimesDto.fromJS(response.data);
        }
        throw new Error('Failed to create showtime');
      }),
      catchError(this.handleError)
    );
  }

  updateShowtime(id: string, showtime: ShowtimesDto): Observable<ShowtimesDto> {
    return this.http.put<any>(`${this.updateUrl}/${id}`, showtime.toJSON()).pipe(
      map(response => {
        // Giả sử server trả về { code: 200, data: {...} }
        if (response && response.code === 200 && response.data) {
          return ShowtimesDto.fromJS(response.data);
        }
        throw new Error('Failed to update showtime');
      }),
      catchError(this.handleError)
    );
  }

  deleteShowtime(id: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteUrl}/${id}`).pipe(
      map(response => {
        // Giả sử server trả về { code: 200, ... }
        if (response && response.code === 200) {
          return response;
        }
        throw new Error('Failed to delete showtime');
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('ShowtimesService Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
