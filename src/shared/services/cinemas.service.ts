import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CinemaDto } from "../dtos/cinemasDto.dto";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class CinemasService {
  private getAllUrl = 'http://127.0.0.1:3000/cinema/getcinema';
  private getByIdUrl = 'http://127.0.0.1:3000/cinema/getcinemaById';
  private addUrl = 'http://127.0.0.1:3000/cinema/addcinema';
  private editUrl = 'http://127.0.0.1:3000/cinema/editcinema';
  private deleteUrl = 'http://127.0.0.1:3000/cinema/deletecinema';
  private searchUrl = 'http://127.0.0.1:3000/cinema/search';
  private apiUrlgetByFilm = "http://127.0.0.1:3000/cinema/get-by-movie/";

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách rạp theo ID phim
   * Endpoint: /cinema/get-by-movie/:filmId
   * Trả về: { code: 200, data: { cinemas: [...] } }
   */
  getCinemaByFilm(filmId: string): Observable<CinemaDto[]> {
    return this.http.get<any>(`${this.apiUrlgetByFilm}${filmId}`).pipe(
      map(response => {
        if (
          response &&
          response.code === 200 &&
          Array.isArray(response.data)
        ) {
          return response.data.map((item: any) => CinemaDto.fromJS(item));
        }
        throw new Error('Không thể tải danh sách rạp theo ID phim');
      }),
      catchError(this.handleError)
    );
  }

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
        throw new Error('Không thể tải danh sách rạp: Dữ liệu không hợp lệ');
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
        throw new Error('Không thể tải thông tin rạp');
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
        throw new Error(response && response.error ? response.error : 'Không thể thêm rạp');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Sửa 1 rạp
   */
  editCinema(id: string, cinemaData: { cinema_name: string; location: string }): Observable<CinemaDto> {
    return this.http.put<any>(`${this.editUrl}/${id}`, cinemaData).pipe(
      map(response => {
        if (response && response.code === 200 && response.data) {
          return CinemaDto.fromJS(response.data);
        }
        throw new Error('Không thể cập nhật thông tin rạp');
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
        throw new Error('Không thể xóa rạp');
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
        throw new Error('Không thể tìm kiếm rạp');
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('CinemasService Error:', error);
    let errorMessage = 'Đã xảy ra lỗi khi thực hiện thao tác.';

    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}