import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ShowtimesDto } from '../dtos/showtimesDto.dto';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ShowtimesService {
  private baseUrl: string = 'http://127.0.0.1:3000/showtimes';
  private moviesUrl: string = 'http://127.0.0.1:3000/films/getfilm';
  private roomsUrl: string = 'http://127.0.0.1:3000/room/getroom';

  private getAllUrl: string = `${this.baseUrl}/get-all`;
  private getByIdUrl: string = `${this.baseUrl}/get-by-id`;
  private createUrl: string = `${this.baseUrl}/create`;
  private updateUrl: string = `${this.baseUrl}/update`;
  private deleteUrl: string = `${this.baseUrl}/delete`;

  constructor(private http: HttpClient) { }

  getAllShowtimes(): Observable<ShowtimesDto[]> {
    return this.http.get<any>(this.getAllUrl).pipe(
      switchMap((response: any) => {
        if (response && response.code === 200 && Array.isArray(response.data)) {
          const showtimes: ShowtimesDto[] = response.data.map((item: any) => ShowtimesDto.fromJS(item));
          const movieIds: string[] = Array.from(new Set(showtimes.map((s: ShowtimesDto) => s.movieId))) as string[];
          const roomIds: string[] = Array.from(new Set(showtimes.map((s: ShowtimesDto) => s.roomId))) as string[];

          return forkJoin({
            movies: this.getMoviesInfo(movieIds),
            rooms: this.getRoomsInfo(roomIds)
          }).pipe(
            map(({ movies, rooms }: { movies: any[], rooms: any[] }) => {
              return showtimes.map((showtime: ShowtimesDto) => {
                const movie: any = movies.find((m: any) => m._id === showtime.movieId);
                const room: any = rooms.find((r: any) => r._id === showtime.roomId);
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

  private getMoviesInfo(movieIds: string[]): Observable<any[]> {
    if (movieIds.length === 0) {
      return new Observable<any[]>(observer => {
        observer.next([]);
        observer.complete();
      });
    }
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
        return new Observable<any[]>(observer => {
          observer.next([]);
          observer.complete();
        });
      })
    );
  }

  private getRoomsInfo(roomIds: string[]): Observable<any[]> {
    if (roomIds.length === 0) {
      return new Observable<any[]>(observer => {
        observer.next([]);
        observer.complete();
      });
    }
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
        return new Observable<any[]>(observer => {
          observer.next([]);
          observer.complete();
        });
      })
    );
  }

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

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('ShowtimesService Error:', error);
    if (error.error && error.error.message) {
      console.error('Server error message:', error.error.message);
    }
    return throwError(() => error);
  }
}
