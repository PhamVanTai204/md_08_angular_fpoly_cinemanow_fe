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
    private verifyPaymentUrl = 'http://127.0.0.1:3000/vnpay/verifypayment'; // API verify

    constructor(private http: HttpClient) { }
    // Phương thức verify Payment từ VNPay return URL
    verifyPayment(queryParams: any): Observable<VNPaymentResponseDto | null> {
        return this.http.get(this.verifyPaymentUrl, { params: queryParams })
            .pipe(
                map((response: any) => {
                    if (response && response.success) {
                        return new VNPaymentResponseDto(response as IVNPaymentResponseDto);  // Map về DTO mới
                    } else {
                        console.error('Verify payment failed');
                        return null;
                    }
                }),
                catchError(this.handleError)  // Xử lý lỗi nếu có
            );
    }
    // Phương thức tạo URL VNPay và trả về VNPaymentResponseDto
    createVNPayUrl(ticket_id: string, amount: number): Observable<VNPaymentResponseDto | null> {
        const paymentData = new VNPaymentDto({ ticket_id, amount });
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
