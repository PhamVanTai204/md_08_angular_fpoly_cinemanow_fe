import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ReviewsDto } from '../dtos/reviewsDto.dto';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private reviewsUrl = 'http://127.0.0.1:3000/reviews';
  private usersUrl   = 'http://127.0.0.1:3000/users';
  private filmsUrl   = 'http://127.0.0.1:3000/films/getfilm';

  /* ========= PHIM (có phân trang) ========= */
  getMoviesPage(
    page  = 1,
    limit = 10,
    search = ''
  ): Observable<{
    items: { movieId: string; movieName: string }[];
    total: number;
    totalPages: number;
  }> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search.trim()) params = params.set('search', search.trim());

    return this.http.get<any>(this.filmsUrl, { params }).pipe(
      map(resp => {
        // ---- tuỳ cấu trúc backend ----
        const root       = resp.data ?? resp;                // data | root
        const filmsRaw   = root.films ?? root.items ?? root; // mảng phim
        const total      =
          root.total ?? root.totalItems ?? root.count ?? root.pagination?.totalItems ?? filmsRaw.length;

        /* 👇 thêm ngoặc quanh chuỗi ?? trước khi dùng || */
        const totalPages =
          (root.totalPages ??
           root.lastPage ??
           root.pagination?.totalPages ??
           Math.ceil(total / limit)) || 1;

        const items = (filmsRaw as any[]).map(f => ({
          movieId:   f._id,
          movieName: f.title || f.name
        }));

        return { items, total, totalPages };
      }),
      catchError(this.handleError)
    );
  }

  /* ========= REVIEWS ========= */
  getReviewsByMovie(movieId: string): Observable<ReviewsDto[]> {
    return this.http
      .get<any>(`${this.reviewsUrl}/get-by-movie/${movieId}`)
      .pipe(
        map(resp => (resp.data ?? resp).map((r: any) => ReviewsDto.fromJS(r))),
        switchMap((reviews: ReviewsDto[]) => {
          const ids = Array.from(new Set(reviews.map(r => r.user_id).filter(id => !!id)));
          if (!ids.length) return of(reviews);

          const calls = ids.map(id =>
            this.http.get<any>(`${this.usersUrl}/getById/${id}`).pipe(catchError(() => of(null)))
          );

          return forkJoin(calls).pipe(
            map(users => {
              users.forEach((u, i) => {
                if (!u) return;
                const email = u.data?.email ?? u.email;
                const uid   = ids[i];
                reviews
                  .filter(r => r.user_id === uid)
                  .forEach(r => (r.userEmail = email));
              });
              return reviews;
            })
          );
        }),
        catchError(this.handleError)
      );
  }

  deleteReview(id: string): Observable<any> {
    return this.http
      .delete<any>(`${this.reviewsUrl}/delete/${id}`)
      .pipe(catchError(this.handleError));
  }

  /* ========= COMMON ========= */
  constructor(private http: HttpClient) {}

  private handleError(err: HttpErrorResponse) {
    console.error('ReviewsService Error:', err);
    return throwError(() => err);
  }
}
