import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ShowtimesDto } from '../dtos/showtimesDto.dto';
import { catchError, throwError, Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShowtimesService {
  // Các endpoint
  private getAllUrl      = 'http://127.0.0.1:3000/showtimes/getAll';
  private getByIdUrl     = 'http://127.0.0.1:3000/showtimes/getById';
  private addShowTimeUrl = 'http://127.0.0.1:3000/showtimes/addShowTime';
  // Nếu có endpoint update, delete... bạn có thể thêm tương tự

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách tất cả showtimes
   */
  getAllShowtimes(): Observable<ShowtimesDto[]> {
    return this.http.get<any>(this.getAllUrl).pipe(
      map(response => {
        // Giả sử server trả về { code: 200, data: [...] }
        if (response && response.code === 200 && response.data) {
          return response.data.map((item: any) => ShowtimesDto.fromJS(item));
        }
        throw new Error('Failed to fetch showtimes');
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
        // Nếu server trả về trực tiếp object showtime
        // hoặc { code: 200, data: {...} } => tùy backend
        // Ở đây minh họa trường hợp trả về object gốc
        return ShowtimesDto.fromJS(response);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Thêm mới 1 showtime
   */
  addShowtime(showtime: ShowtimesDto): Observable<ShowtimesDto> {
    return this.http.post<any>(this.addShowTimeUrl, showtime.toJSON()).pipe(
      map(response => {
        // Nếu server trả về object showtime mới
        return ShowtimesDto.fromJS(response);
      }),
      catchError(this.handleError)
    );
  }

  // Các hàm update, delete... nếu cần, bạn có thể thêm tương tự
  // updateShowtime(...) {}
  // deleteShowtime(...) {}

  /**
   * Xử lý lỗi chung
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('ShowtimesService Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
