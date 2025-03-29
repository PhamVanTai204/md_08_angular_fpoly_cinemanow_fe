import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VouchersDto } from '../dtos/vouchersDto.dto';
import { catchError, Observable, throwError, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VouchersService {
  private getAllUrl = 'http://127.0.0.1:3000/vouchers/get-all';
  private getByIdUrl = 'http://127.0.0.1:3000/vouchers/get-by-id';
  private createUrl = 'http://127.0.0.1:3000/vouchers/create';
  private updateUrl = 'http://127.0.0.1:3000/vouchers/update';
  private deleteUrl = 'http://127.0.0.1:3000/vouchers/delete';

  constructor(private http: HttpClient) { }

  getVouchers(): Observable<VouchersDto[]> {
    return this.http.get<any>(this.getAllUrl).pipe(
      map(response => {
        console.log('Response:', response);
        if (response && response.code === 200 && response.data) {
          return response.data.map((item: any) => VouchersDto.fromJS(item));
        }
        throw new Error('Lỗi tải voucher');
      }),
      catchError(this.handleError)
    );
  }

  getVoucherById(id: string): Observable<VouchersDto> {
    return this.http.get<any>(`${this.getByIdUrl}/${id}`).pipe(
      map(response => VouchersDto.fromJS(response)),
      catchError(this.handleError)
    );
  }

  createVoucher(voucher: VouchersDto): Observable<VouchersDto> {
    const payload = voucher.toJSON();
    // Xóa các trường không cần thiết khi tạo mới
    delete payload['_id'];
    delete payload['createdAt'];
    delete payload['updatedAt'];
    return this.http.post<any>(this.createUrl, payload).pipe(
      map(response => VouchersDto.fromJS(response)),
      catchError(this.handleError)
    );
  }

  updateVoucher(id: string, voucher: VouchersDto): Observable<VouchersDto> {
    const payload = voucher.toJSON();
    delete payload['_id'];
    delete payload['createdAt'];
    delete payload['updatedAt'];
    return this.http.put<any>(`${this.updateUrl}/${id}`, payload).pipe(
      map(response => VouchersDto.fromJS(response)),
      catchError(this.handleError)
    );
  }

  deleteVoucher(id: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Lỗi service:', error);
    return throwError(() => new Error(error.message || 'Lỗi server'));
  }
}
