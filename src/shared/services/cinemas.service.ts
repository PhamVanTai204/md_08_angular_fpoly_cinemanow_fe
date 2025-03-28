import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CinemaDto } from "../dtos/cinemasDto.dto";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class CinemasService {
  private getAllUrl   = 'http://127.0.0.1:3000/cinema/getcinema';
  private getByIdUrl  = 'http://127.0.0.1:3000/cinema/getcinemaById';
  private addUrl      = 'http://127.0.0.1:3000/cinema/addcinema';
  private editUrl     = 'http://127.0.0.1:3000/cinema/editcinema';
  private deleteUrl   = 'http://127.0.0.1:3000/cinema/deletecinema';
  private searchUrl   = 'http://127.0.0.1:3000/cinema/search';

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách rạp
   * Dữ liệu trả về ở: { code: 200, data: { cinemas: [...] } }
   */
  getCinemas(): Observable<CinemaDto[]> {
    return this.http.get<any>(this.getAllUrl).pipe(
      map(response => {
        if (
          response &&
          response.code === 200 &&
          response.data &&
          Array.isArray(response.data.cinemas)
        ) {
          return response.data.cinemas.map((item: any) => CinemaDto.fromJS(item));
        }
        throw new Error('Failed to fetch cinemas: data.cinemas is not an array');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy 1 rạp theo ID
   */
  getCinemaById(id: string): Observable<CinemaDto> {
    return this.http.get<any>(`${this.getByIdUrl}/${id}`).pipe(
      map(response => {
        if (response && response.code === 200 && response.data) {
          return CinemaDto.fromJS(response.data);
        }
        throw new Error('Failed to fetch cinema by ID');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Thêm 1 rạp
   * - Server có thể trả về code = 201, data = "Thêm rạp phim thành công"
   * - Hoặc code = 200, data = { _id, cinema_name, ... }
   */
  addCinema(cinema: CinemaDto): Observable<CinemaDto> {
    return this.http.post<any>(this.addUrl, cinema.toJSON()).pipe(
      map(response => {
        // Chấp nhận code = 200 hoặc 201
        if (response && (response.code === 200 || response.code === 201)) {
          // Nếu response.data là object, chuyển thành CinemaDto
          if (response.data && typeof response.data === 'object') {
            return CinemaDto.fromJS(response.data);
          } else {
            // Nếu response.data chỉ là string, ta trả về chính "cinema" đã gửi
            // để hiển thị lên danh sách (không có _id do server không trả về)
            return cinema;
          }
        }
        // Nếu server trả về code khác, ném lỗi
        throw new Error(response && response.error ? response.error : 'Failed to add cinema');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Sửa 1 rạp
   */
  editCinema(id: string, cinema: CinemaDto): Observable<CinemaDto> {
    return this.http.put<any>(`${this.editUrl}/${id}`, cinema.toJSON()).pipe(
      map(response => {
        if (response && response.code === 200 && response.data) {
          return CinemaDto.fromJS(response.data);
        }
        throw new Error('Failed to edit cinema');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Xóa 1 rạp
   */
  deleteCinema(id: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteUrl}/${id}`).pipe(
      map(response => {
        if (response && response.code === 200) {
          return response;
        }
        throw new Error('Failed to delete cinema');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Tìm kiếm rạp
   */
  searchCinema(query: string): Observable<CinemaDto[]> {
    return this.http.get<any>(`${this.searchUrl}?q=${encodeURIComponent(query)}`).pipe(
      map(response => {
        if (
          response &&
          response.code === 200 &&
          response.data &&
          Array.isArray(response.data.cinemas)
        ) {
          return response.data.cinemas.map((item: any) => CinemaDto.fromJS(item));
        }
        throw new Error('Failed to search cinemas');
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('CinemasService Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
