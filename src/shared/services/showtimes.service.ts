import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ShowtimesDto } from '../dtos/showtimesDto.dto';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
export interface ShowtimesByMovieAndCinemaResponse {
  code: number;
  error: string | null;
  data: ShowtimeDateGroup[];
}

export interface ShowtimeDateGroup {
  date: string; // Format: "YYYY-MM-DD"
  showtimes: ShowtimesDto[];
}
@Injectable({
  providedIn: 'root'
})



export class ShowtimesService {
  // API URLs
  private baseUrl: string = 'http://127.0.0.1:3000/showtimes';
  private moviesUrl: string = 'http://127.0.0.1:3000/films/getfilm';
  private roomsUrl: string = 'http://127.0.0.1:3000/room/getroom';

  private getAllUrl: string = `${this.baseUrl}/get-all`;
  private getByIdUrl: string = `${this.baseUrl}/get-by-id`;
  private createUrl: string = `${this.baseUrl}/create`;
  private updateUrl: string = `${this.baseUrl}/update`;
  private deleteUrl: string = `${this.baseUrl}/delete`;

  constructor(private http: HttpClient) { }
  getShowtimesByMovieAndCinema(movieId: string, cinemaId: string): Observable<ShowtimesByMovieAndCinemaResponse> {
    const url = `${this.baseUrl}/by-movie-and-cinema?movie_id=${movieId}&cinema_id=${cinemaId}`;

    return this.http.get<ShowtimesByMovieAndCinemaResponse>(url).pipe(
      map(response => {
        if (response && response.code === 200 && response.data) {
          // Transform the data into the expected format
          const transformedData = response.data.map((dateGroup: any) => ({
            date: dateGroup.date,
            showtimes: dateGroup.showtimes.map((showtime: any) => ShowtimesDto.fromJS(showtime))
          }));

          return {
            code: 200,
            error: null,
            data: transformedData
          };
        }
        throw new Error('Invalid response format');
      }),
      catchError(this.handleError)
    );
  }




  /**
   * Lấy tất cả các suất chiếu, bao gồm tên phim và tên phòng
   * @returns Observable<ShowtimesDto[]>
   */
  getAllShowtimes(): Observable<ShowtimesDto[]> {
    return this.http.get<any>(this.getAllUrl).pipe(
      switchMap((response: any) => {
        if (response && response.code === 200 && Array.isArray(response.data)) {
          // Parse showtimes
          const showtimes: ShowtimesDto[] = response.data.map((item: any) => ShowtimesDto.fromJS(item));

          // Collect unique IDs for movies and rooms to minimize API requests
          const movieIds: string[] = Array.from(new Set(showtimes.map((s: ShowtimesDto) => s.movieId).filter(id => id)));
          const roomIds: string[] = Array.from(new Set(showtimes.map((s: ShowtimesDto) => s.roomId).filter(id => id)));

          // Only fetch additional data if we have IDs to look up
          if (movieIds.length || roomIds.length) {
            return forkJoin({
              movies: this.getMoviesInfo(movieIds),
              rooms: this.getRoomsInfo(roomIds)
            }).pipe(
              map(({ movies, rooms }: { movies: any[], rooms: any[] }) => {
                // Enrich showtimes with movie and room names
                return showtimes.map((showtime: ShowtimesDto) => {
                  // Find and set movie name
                  const movie: any = movies.find((m: any) => m._id === showtime.movieId);
                  if (movie && !showtime.movieName) {
                    showtime.movieName = movie.title || 'Không có tên';
                    console.log(`Lấy được tên phim: ${showtime.movieName} cho ID: ${showtime.movieId}`);
                  }

                  // Find and set room name
                  const room: any = rooms.find((r: any) => r._id === showtime.roomId);
                  if (room && !showtime.roomName) {
                    showtime.roomName = room.room_name || 'Không có tên';
                    console.log(`Lấy được tên phòng: ${showtime.roomName} cho ID: ${showtime.roomId}`);
                  }

                  return showtime;
                });
              })
            );
          }

          // If no IDs to look up, return showtimes as is
          return of(showtimes);
        }
        throw new Error('Failed to fetch showtimes');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Lấy thông tin các phim từ danh sách ID
   * @param movieIds Danh sách ID phim
   * @returns Observable<any[]>
   */
  private getMoviesInfo(movieIds: string[]): Observable<any[]> {
    // If no movie IDs, return empty array
    if (movieIds.length === 0) {
      return of([]);
    }

    // Fetch movies and filter by provided IDs
    return this.http.get<any>(this.moviesUrl).pipe(
      map((response: any) => {
        if (response && response.code === 200 && response.data && response.data.films) {
          return response.data.films.filter((movie: any) =>
            movieIds.includes(movie._id)
          );
        }
        return [];
      }),
      catchError((error: any) => {
        console.error('Error fetching movie info:', error);
        return of([]);
      })
    );
  }

  /**
   * Lấy thông tin các phòng từ danh sách ID
   * @param roomIds Danh sách ID phòng
   * @returns Observable<any[]>
   */
  private getRoomsInfo(roomIds: string[]): Observable<any[]> {
    // If no room IDs, return empty array
    if (roomIds.length === 0) {
      return of([]);
    }

    // Fetch rooms and filter by provided IDs
    return this.http.get<any>(this.roomsUrl).pipe(
      map((response: any) => {
        if (response && response.code === 200 && response.data && response.data.rooms) {
          return response.data.rooms.filter((room: any) =>
            roomIds.includes(room._id)
          );
        }
        return [];
      }),
      catchError((error: any) => {
        console.error('Error fetching room info:', error);
        return of([]);
      })
    );
  }

  /**
   * Lấy thông tin một suất chiếu theo ID
   * @param id ID của suất chiếu
   * @returns Observable<ShowtimesDto>
   */
  getShowtimeById(id: string): Observable<ShowtimesDto> {
    return this.http.get<any>(`${this.getByIdUrl}/${id}`).pipe(
      map((response: any) => {
        if (response && response.code === 200 && response.data) {
          return ShowtimesDto.fromJS(response.data);
        }
        throw new Error('Failed to fetch showtime by id');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Tạo mới một suất chiếu
   * @param showtime Thông tin suất chiếu
   * @returns Observable<ShowtimesDto>
   */
  createShowtime(showtime: ShowtimesDto): Observable<ShowtimesDto> {
    const data: any = showtime.toJSON();
    console.log('Dữ liệu gửi đến API createShowtime:', data);

    return this.http.post<any>(this.createUrl, data).pipe(
      tap((response: any) => console.log('API Response:', response)),
      map((response: any) => {
        if (response && (response.code === 201 || response.code === 200) && response.data) {
          return ShowtimesDto.fromJS(response.data);
        }
        throw new Error('Failed to create showtime');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Cập nhật một suất chiếu
   * @param id ID của suất chiếu
   * @param showtime Thông tin cập nhật
   * @returns Observable<ShowtimesDto>
   */
  updateShowtime(id: string, showtime: ShowtimesDto): Observable<ShowtimesDto> {
    const data: any = showtime.toJSON();
    console.log('Dữ liệu gửi đến API updateShowtime:', data);

    return this.http.put<any>(`${this.updateUrl}/${id}`, data).pipe(
      tap((response: any) => console.log('API Response:', response)),
      map((response: any) => {
        if (response && response.code === 200 && response.data) {
          return ShowtimesDto.fromJS(response.data);
        }
        throw new Error('Failed to update showtime');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Xóa một suất chiếu
   * @param id ID của suất chiếu
   * @returns Observable<any>
   */
  deleteShowtime(id: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteUrl}/${id}`).pipe(
      map((response: any) => {
        if (response && response.code === 200) {
          return response;
        }
        throw new Error('Failed to delete showtime');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Xử lý lỗi từ HTTP requests
   * @param error HTTP error
   * @returns Observable<never>
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('ShowtimesService Error:', error);

    if (error.error && error.error.message) {
      console.error('Server error message:', error.error.message);
    }

    return throwError(() => error);
  }
}