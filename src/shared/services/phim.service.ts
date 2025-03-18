import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PhimDto } from "../dtos/phimDto.dto";
import { catchError, Observable, throwError, map } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PhimService {
  private getAllUrl   = 'http://127.0.0.1:3000/films/getfilm';
  private getByIdUrl  = 'http://127.0.0.1:3000/films/getfilmById';
  private createUrl   = 'http://127.0.0.1:3000/films/addfilm';
  private updateUrl   = 'http://127.0.0.1:3000/films/editfilm';
  private deleteUrl   = 'http://127.0.0.1:3000/films/deletefilm';
  private searchUrl   = 'http://127.0.0.1:3000/films/search';
  private getByGenreUrl = 'http://127.0.0.1:3000/films/genre';

  constructor(private http: HttpClient) { }

  getPhims(page: number = 1, limit: number = 10): Observable<PhimDto[]> {
    return this.http.get<any>(`${this.getAllUrl}?page=${page}&limit=${limit}`).pipe(
      map(response => {
        if (response && response.code === 200 && response.data) {
          return response.data.map((item: any) => PhimDto.fromJS(item));
        }
        throw new Error('Failed to fetch films');
      }),
      catchError(this.handleError)
    );
  }

  getPhimById(id: string): Observable<PhimDto> {
    return this.http.get<any>(`${this.getByIdUrl}/${id}`).pipe(
      map(response => {
        if (response && response.code === 200 && response.data) {
          return PhimDto.fromJS(response.data);
        }
        throw new Error('Failed to fetch film');
      }),
      catchError(this.handleError)
    );
  }

  getPhimsByGenre(genreId: string, page: number = 1, limit: number = 10): Observable<PhimDto[]> {
    return this.http.get<any>(`${this.getByGenreUrl}/${genreId}?page=${page}&limit=${limit}`).pipe(
      map(response => {
        if (response && response.code === 200 && response.data) {
          return response.data.map((item: any) => PhimDto.fromJS(item));
        }
        throw new Error('Failed to fetch films by genre');
      }),
      catchError(this.handleError)
    );
  }

  searchPhims(title: string): Observable<PhimDto[]> {
    return this.http.get<any>(`${this.searchUrl}?title=${title}`).pipe(
      map(response => {
        if (response && response.code === 200 && response.data) {
          return response.data.map((item: any) => PhimDto.fromJS(item));
        }
        throw new Error('Failed to search films');
      }),
      catchError(this.handleError)
    );
  }

  createPhim(phim: PhimDto): Observable<PhimDto> {
    return this.http.post<any>(this.createUrl, phim.toJSON()).pipe(
      map(response => {
        if (response && response.code === 200 && response.data) {
          return PhimDto.fromJS(response.data);
        }
        throw new Error('Failed to create film');
      }),
      catchError(this.handleError)
    );
  }

  updatePhim(id: string, phim: PhimDto): Observable<PhimDto> {
    return this.http.put<any>(`${this.updateUrl}/${id}`, phim.toJSON()).pipe(
      map(response => {
        if (response && response.code === 200 && response.data) {
          return PhimDto.fromJS(response.data);
        }
        throw new Error('Failed to update film');
      }),
      catchError(this.handleError)
    );
  }

  deletePhim(id: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('PhimService Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}