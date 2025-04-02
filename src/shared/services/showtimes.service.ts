import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ShowtimesDto } from '../dtos/showtimesDto.dto';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ShowtimesService {
  // Chú ý baseUrl phải trùng với app.use('/showtimes', showTimeRoutes);
  private baseUrl = 'http://127.0.0.1:3000/showtimes';
  private moviesUrl = 'http://127.0.0.1:3000/films/getfilm'; // URL cho API phim
  private roomsUrl = 'http://127.0.0.1:3000/room/getroom';  // URL cho API phòng

  // Các endpoint cụ thể
  private getAllUrl = `${this.baseUrl}/get-all`;
  private getByIdUrl = `${this.baseUrl}/get-by-id`;
  private createUrl = `${this.baseUrl}/create`;
  private updateUrl = `${this.baseUrl}/update`;
  private deleteUrl = `${this.baseUrl}/delete`;

  constructor(private http: HttpClient) { }

  getAllShowtimes(): Observable<ShowtimesDto[]> {
    return this.http.get<any>(this.getAllUrl).pipe(
      switchMap(response => {
        // Giả sử server trả về { code: 200, data: [...] }
        if (response && response.code === 200 && Array.isArray(response.data)) {
          const showtimes = response.data.map((item: any) => ShowtimesDto.fromJS(item));
          
          // Lấy tất cả ID phim và phòng cần lookup
          // Sử dụng kiểu ép buộc để đảm bảo kết quả là string[]
          const movieIds = Array.from(new Set(showtimes.map((s: ShowtimesDto) => s.movieId))) as string[];
          const roomIds = Array.from(new Set(showtimes.map((s: ShowtimesDto) => s.roomId))) as string[];
          
          // Tạo tác vụ cho việc lấy danh sách phim và phòng
          return forkJoin({
            movies: this.getMoviesInfo(movieIds),
            rooms: this.getRoomsInfo(roomIds)
          }).pipe(
            map(({ movies, rooms }) => {
              // Gán tên phim và phòng cho mỗi suất chiếu
              return showtimes.map((showtime: ShowtimesDto) => {
                const movie = movies.find((m: any) => m._id === showtime.movieId);
                const room = rooms.find((r: any) => r._id === showtime.roomId);
                
                if (movie) {
                  showtime.movieName = movie.title || 'Không có tên';
                  console.log(`Lấy được tên phim: ${showtime.movieName} cho ID: ${showtime.movieId}`);
                }
                
                if (room) {
                  showtime.roomName = room.room_name || 'Không có tên';
                  console.log(`Lấy được tên phòng: ${showtime.roomName} cho ID: ${showtime.roomId}`);
                }
                
                return showtime;
              });
            })
          );
        }
        throw new Error('Failed to fetch showtimes');
      }),
      catchError(this.handleError)
    );
  }

  // Phương thức lấy thông tin phim
  private getMoviesInfo(movieIds: string[]): Observable<any[]> {
    if (movieIds.length === 0) return new Observable(observer => observer.next([]));
    
    // Sử dụng endpoint API phim
    return this.http.get<any>(this.moviesUrl).pipe(
      map(response => {
        if (response && response.code === 200 && response.data && response.data.films) {
          return response.data.films.filter((movie: any) => 
            movieIds.includes(movie._id)
          );
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching movie info:', error);
        return [];
      })
    );
  }

  // Phương thức lấy thông tin phòng
  private getRoomsInfo(roomIds: string[]): Observable<any[]> {
    if (roomIds.length === 0) return new Observable(observer => observer.next([]));
    
    // Sử dụng endpoint API phòng
    return this.http.get<any>(this.roomsUrl).pipe(
      map(response => {
        if (response && response.code === 200 && response.data && response.data.rooms) {
          return response.data.rooms.filter((room: any) => 
            roomIds.includes(room._id)
          );
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching room info:', error);
        return [];
      })
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
    const data = showtime.toJSON();
    console.log('Dữ liệu gửi đến API createShowtime:', data);
    
    return this.http.post<any>(this.createUrl, data).pipe(
      tap(response => console.log('API Response:', response)),
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
    const data = showtime.toJSON();
    console.log('Dữ liệu gửi đến API updateShowtime:', data);
    
    return this.http.put<any>(`${this.updateUrl}/${id}`, data).pipe(
      tap(response => console.log('API Response:', response)),
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
    if (error.error && error.error.message) {
      console.error('Server error message:', error.error.message);
    }
    return throwError(() => error);
  }
}