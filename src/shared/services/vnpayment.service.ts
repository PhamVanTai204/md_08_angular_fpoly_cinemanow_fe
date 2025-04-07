import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError, map } from "rxjs";
import { VNPaymentDto } from "../dtos/vnpaymentDto.dto";
import { IVNPaymentResponseDto, VNPaymentResponseDto } from "../dtos/VNPaymentResponseDto.dto"; // Import DTO mới

@Injectable({
    providedIn: 'root'
})
export class VNPaymentService {
    private createLinkVNpayUrl = 'http://127.0.0.1:3000/vnpay/createvnpayurl';

    constructor(private http: HttpClient) { }

    // Phương thức tạo URL VNPay và trả về VNPaymentResponseDto
    createVNPayUrl(amount: number, orderId: string, orderInfo: string): Observable<VNPaymentResponseDto | null> {
        const paymentData = new VNPaymentDto({ amount, orderId, orderInfo });
        return this.http.post(this.createLinkVNpayUrl, paymentData)
            .pipe(
                map((response: any) => {  // Type the response here
                    if (response && response.success) {
                        return new VNPaymentResponseDto(response as IVNPaymentResponseDto);  // Cast the response to the correct type
                    } else {
                        console.error('API Response is not valid or unsuccessful');
                        return null;
                    }
                }),
                catchError(this.handleError)  // Xử lý lỗi nếu có
            );
    }


    // Xử lý lỗi chung
    private handleError(error: HttpErrorResponse): Observable<never> {
        console.error('VNPaymentService Error:', error);
        return throwError(() => new Error(error.message || 'Server error'));
    }
}
