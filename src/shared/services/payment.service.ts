// payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

// Define your DTO interfaces
export interface PaymentDto {
    _id: string;
    payment_id: string;
    ticket_id: {
        _id: string;
        ticket_id: string;
        user_id: {
            _id: string;
            user_name: string;
            email: string;
            // ... other user fields
        };
        showtime_id: {
            _id: string;
            showtime_id: string;
            movie_id: {
                _id: string;
                title: string;
                image_film: string;
                // ... other movie fields
            };
            room_id: {
                _id: string;
                cinema_id: string;
                room_name: string;
                // ... other movie fields
            };
            // ... other showtime fields
        };
        seats: Array<{
            seat_id: string;
            price: number;
            _id: string;
        }>;
        combos: Array<{
            combo_id: string;
            quantity: number;
            price: number;
            _id: string;
        }>;
        total_amount: number;
        status: string;
    };
    payment_method_id: {
        _id: string;
        payment_method_id: string;
        method_name: string;
    } | null;
    payment_status_id: {
        _id: string;
        name: string;
    } | null;
    payment_time: string;
    status_order: string;
}

export interface PaymentApiResponseDto {
    payments: PaymentDto[];
    totalPayments: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}
export interface ApiResponse<T> {
    code: number;
    error: string | null;
    data: T;
}


@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private baseUrl = 'http://127.0.0.1:3000/payments';

    constructor(private http: HttpClient) { }

    getAllPayments(page: number = 1, limit: number = 10): Observable<PaymentApiResponseDto> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        return this.http.get<ApiResponse<PaymentApiResponseDto>>(`${this.baseUrl}/get-all`, { params })
            .pipe(
                map(response => response.data),
                catchError(this.handleError)
            );
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        console.error('PaymentService Error:', error);
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Client Error: ${error.error.message}`;
        } else {
            // Server-side error
            if (error.error && error.error.error) {
                errorMessage = error.error.error;
            } else {
                errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;
            }
        }
        return throwError(() => new Error(errorMessage));
    }
}