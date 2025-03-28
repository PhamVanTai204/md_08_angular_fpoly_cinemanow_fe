import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ShowtimesDto } from '../dtos/showtimesDto.dto';
import { catchError, throwError, Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShowtimesService {
  // Các endpoint (thay đổi nếu cần cho đúng backend)
  private getAllUrl         = 'http://127.0.0.1:3000/showtimes/get-all';
  private getByIdUrl        = 'http://127.0.0.1:3000/showtimes/get-by-id';
  private addShowTimeUrl    = 'http://127.0.0.1:3000/showtimes/create';
  private updateShowTimeUrl = 'http://127.0.0.1:3000/showtimes/update';
  private deleteShowTimeUrl = 'http://127.0.0.1:3000/showtimes/delete';
  private searchShowtimesUrl = 'http://127.0.0.1:3000/showtimes/search'; // New endpoint for search

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách tất cả showtimes
   * Giả sử server trả về { code: 200, data: [...] }
   */
  getAllShowtimes(): Observable<ShowtimesDto[]> {
    return this.http.get<any>(this.getAllUrl).pipe(
      map(response => {
        // Nếu server trả về { code: 200, data: [...] }
        if (response && response.code === 200 && Array.isArray(response.data)) {
          return response.data.map((item: any) => ShowtimesDto.fromJS(item));
        }
        // Nếu server trả về mảng thẳng, chỉ cần:
        // return response.map((item: any) => ShowtimesDto.fromJS(item));
        
        throw new Error('Failed to fetch showtimes');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Tìm kiếm showtimes theo movie_id
   */
  searchShowtimes(movieId: string): Observable<ShowtimesDto[]> {
    return this.http.get<any>(`${this.searchShowtimesUrl}?movie_id=${movieId}`).pipe(
      map(response => {
        // Handle response based on your API structure
        if (response && response.code === 200 && Array.isArray(response.data)) {
          return response.data.map((item: any) => ShowtimesDto.fromJS(item));
        }
        
        // Alternative response format handling
        if (Array.isArray(response)) {
          return response.map((item: any) => ShowtimesDto.fromJS(item));
        }
        
        // If response contains films array property
        if (response && Array.isArray(response.showtimes)) {
          return response.showtimes.map((item: any) => ShowtimesDto.fromJS(item));
        }
        
        console.error('Unexpected response format:', response);
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy chi tiết 1 showtime theo ID
   */
  getShowtimeById(id: string): Observable<ShowtimesDto> {
    return this.http.get<any>(`${this.getByIdUrl}/${id}`).pipe(
      map(response => {
        // Giả sử server trả về object gốc
        return ShowtimesDto.fromJS(response);
        
        // Hoặc nếu server trả về { code: 200, data: {...} }:
        // return ShowtimesDto.fromJS(response.data);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Thêm mới 1 showtime
   */
  addShowtime(showtime: ShowtimesDto): Observable<ShowtimesDto> {
    const body = showtime.toJSON();
    return this.http.post<any>(this.addShowTimeUrl, body).pipe(
      map(response => {
        // Giả sử server trả về object showtime vừa thêm
        return ShowtimesDto.fromJS(response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Cập nhật showtime
   */
  updateShowtime(id: string, showtime: ShowtimesDto): Observable<ShowtimesDto> {
    const body = showtime.toJSON();
    return this.http.put<any>(`${this.updateShowTimeUrl}/${id}`, body).pipe(
      map(response => {
        return ShowtimesDto.fromJS(response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Xoá showtime
   */
  deleteShowtime(id: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteShowTimeUrl}/${id}`).pipe(
      map(response => {
        // Tuỳ backend trả về gì
        return response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Xử lý lỗi chung
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('ShowtimesService Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}