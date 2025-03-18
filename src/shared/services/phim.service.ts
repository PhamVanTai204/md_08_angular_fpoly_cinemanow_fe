import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PhimDto } from "../dtos/phimDto.dto";
import { catchError, Observable, throwError, map, tap } from "rxjs";

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
      tap(response => console.log('Films API Response:', response)),
      map(response => {
        if (response && response.data) {
          return response.data.map((item: any) => PhimDto.fromJS(item));
        }
        if (Array.isArray(response)) {
          return response.map((item: any) => PhimDto.fromJS(item));
        }
        console.error('Unexpected API response format:', response);
        return [];
      }),
      catchError(this.handleError)
    );
  }

  getPhimById(id: string): Observable<PhimDto> {
    return this.http.get<any>(`${this.getByIdUrl}/${id}`).pipe(
      tap(response => console.log('Get Film By ID Response:', response)),
      map(response => {
        if (response && response.data) {
          return PhimDto.fromJS(response.data);
        }
        return PhimDto.fromJS(response);
      }),
      catchError(this.handleError)
    );
  }

  getPhimsByGenre(genreId: string, page: number = 1, limit: number = 10): Observable<PhimDto[]> {
    return this.http.get<any>(`${this.getByGenreUrl}/${genreId}?page=${page}&limit=${limit}`).pipe(
      map(response => {
        if (response && response.data) {
          return response.data.map((item: any) => PhimDto.fromJS(item));
        }
        if (Array.isArray(response)) {
          return response.map((item: any) => PhimDto.fromJS(item));
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  searchPhims(title: string): Observable<PhimDto[]> {
    return this.http.get<any>(`${this.searchUrl}?title=${title}`).pipe(
      tap(response => console.log('Search Films Response:', response)),
      map(response => {
        if (response && response.data) {
          return response.data.map((item: any) => PhimDto.fromJS(item));
        }
        if (Array.isArray(response)) {
          return response.map((item: any) => PhimDto.fromJS(item));
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  createPhim(phim: PhimDto): Observable<PhimDto> {
    const requestData = phim.toJSON();
    console.log('Create Film Request Payload:', requestData);
    
    return this.http.post<any>(this.createUrl, requestData).pipe(
      tap(response => console.log('Create Film Response:', response)),
      map(response => {
        if (response && response.data) {
          return PhimDto.fromJS(response.data);
        }
        return PhimDto.fromJS(response);
      }),
      catchError(this.handleError)
    );
  }

  updatePhim(id: string, phim: PhimDto): Observable<PhimDto> {
    const requestData = phim.toJSON();
    console.log(`Update Film ${id} Request Payload:`, requestData);
    
    return this.http.put<any>(`${this.updateUrl}/${id}`, requestData).pipe(
      tap(response => console.log('Update Film Response:', response)),
      map(response => {
        if (response && response.data) {
          return PhimDto.fromJS(response.data);
        }
        return PhimDto.fromJS(response);
      }),
      catchError(this.handleError)
    );
  }

  deletePhim(id: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteUrl}/${id}`).pipe(
      tap(response => console.log('Delete Film Response:', response)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('PhimService Error:', error);
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      console.error('Client error:', error.error.message);
    } else {
      // Server-side error
      console.error(
        `Backend returned code ${error.status}, body:`, error.error
      );
    }
    return throwError(() => error);
  }
}