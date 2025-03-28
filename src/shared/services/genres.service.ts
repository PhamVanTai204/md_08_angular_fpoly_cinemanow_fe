import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { GenresDto } from "../dtos/genresDto.dto";
import { catchError, Observable, throwError, map } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GenresService {
  private getAllUrl = 'http://127.0.0.1:3000/genres/getAll';
  private getByIdUrl = 'http://127.0.0.1:3000/genres/getById';
  private createUrl = 'http://127.0.0.1:3000/genres/create';
  private updateUrl = 'http://127.0.0.1:3000/genres/update';
  private deleteUrl = 'http://127.0.0.1:3000/genres/delete';

  constructor(private http: HttpClient) { }

  getGenres(): Observable<GenresDto[]> {
    return this.http.get<any>(this.getAllUrl).pipe(
      map(response => {
        console.log('Original genres response:', response);
        if (response && response.code === 200 && response.data) {
          return response.data.map((item: any) => {
            const genre = GenresDto.fromJS(item);
            console.log('Mapped genre:', genre);
            return genre;
          });
        }
        throw new Error('Failed to fetch genres');
      }),
      catchError(this.handleError)
    );
  }

  getGenreById(id: string): Observable<GenresDto> {
    return this.http.get<any>(`${this.getByIdUrl}/${id}`).pipe(
      map(response => GenresDto.fromJS(response)),
      catchError(this.handleError)
    );
  }

  createGenre(genre: GenresDto): Observable<GenresDto> {
    return this.http.post<any>(this.createUrl, genre.toJSON()).pipe(
      map(response => GenresDto.fromJS(response)),
      catchError(this.handleError)
    );
  }

  updateGenre(id: string, genre: GenresDto): Observable<GenresDto> {
    return this.http.put<any>(`${this.updateUrl}/${id}`, genre.toJSON()).pipe(
      map(response => GenresDto.fromJS(response)),
      catchError(this.handleError)
    );
  }

  deleteGenre(id: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('GenresService Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
