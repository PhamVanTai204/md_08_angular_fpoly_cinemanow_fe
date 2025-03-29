import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BannersDto } from "../dtos/bannersDto.dto";
import { catchError, Observable, throwError, map } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BannersService {
  private getAllUrl = 'http://127.0.0.1:3000/banners/getAllBanner';
  private createUrl = 'http://127.0.0.1:3000/banners/addBanner';
  private deleteUrl = 'http://127.0.0.1:3000/banners/deleteBanner';

  constructor(private http: HttpClient) {}

  // Lấy danh sách banner
  getBanners(): Observable<BannersDto[]> {
    return this.http.get<any>(this.getAllUrl).pipe(
      map(response => {
        console.log('Original banners response:', response);
        if (response && response.code === 200 && response.data) {
          return response.data.map((item: any) => {
            const banner = BannersDto.fromJS(item);
            console.log('Mapped banner:', banner);
            return banner;
          });
        }
        throw new Error('Failed to fetch banners');
      }),
      catchError(this.handleError)
    );
  }

  // Tạo mới banner
  createBanner(banner: BannersDto): Observable<BannersDto> {
    return this.http.post<any>(this.createUrl, banner.toJSON()).pipe(
      map(response => {
        console.log('Create banner response:', response);

        // CHỈNH SỬA Ở ĐÂY: Chấp nhận code = 200 HOẶC code = 201 là thành công
        if (response && (response.code === 200 || response.code === 201)) {
          if (response.data) {
            // Nếu server trả về dữ liệu banner mới
            const newBanner = BannersDto.fromJS(response.data);
            return newBanner;
          } else {
            // Nếu server không trả về data, vẫn coi là thành công
            // Bạn có thể tùy chỉnh logic tại đây
            return new BannersDto({ id: '', imageUrl: banner.imageUrl });
          }
        }

        throw new Error('Failed to create banner');
      }),
      catchError(this.handleError)
    );
  }

  // Xoá banner
  deleteBanner(id: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteUrl}/${id}`).pipe(
      map(response => {
        console.log('Delete banner response:', response);
        if (response && response.code === 200) {
          return response;
        }
        throw new Error('Failed to delete banner');
      }),
      catchError(this.handleError)
    );
  }

  // Xử lý lỗi chung
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('BannersService Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
