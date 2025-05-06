// payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

// Define your DTO interfaces
export interface PaymentDto {
    _id: string;
    payment_id: string;
    ticket_id: string;
    payment_method: number;
    status_order: string;
    vnp_TransactionNo: string | null;
    vnp_ResponseCode: string | null;
    vnp_BankCode: string | null;
    vnp_PayDate: string | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
    ticket: {
        _id: string;
        ticket_id: string;
        user_id: string;
        showtime_id: string;
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
        voucher_id: string | null;
        total_amount: number;
        status: string;
        createdAt: string;
        updatedAt: string;
        __v: number;
        user: {
            _id: string;
            user_name: string;
            email: string;
            password: string;
            url_image: string;
            role: number;
            createdAt: string;
            updatedAt: string;
            __v: number;
            date_of_birth: string;
            full_name: string;
            gender: number;
            phone_number: number;
        };
    };
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
export interface CreatePaymentResponse {
    code: number;
    error: string | null;
    data: {
        payment_id: string;
        ticket_id: string;
        payment_method: number;
        status_order: string;
        vnp_TransactionNo: string | null;
        vnp_ResponseCode: string | null;
        vnp_BankCode: string | null;
        vnp_PayDate: string;
        _id: string;
        createdAt: string;
        updatedAt: string;
        __v: number;
        ticket: {
            _id: string;
            ticket_id: string;
            user_id: {
                _id: string;
                user_name: string;
                email: string;
                password: string;
                url_image: string;
                role: number;
                createdAt: string;
                updatedAt: string;
                __v: number;
            };
            showtime_id: {
                _id: string;
                showtime_id: string;
                movie_id: string;
                room_id: {
                    _id: string;
                    cinema_id: string;
                    room_name: string;
                    room_style: string;
                    total_seat: number;
                    status: string;
                    createdAt: string;
                    updatedAt: string;
                    __v: number;
                };
                cinema_id: string;
                start_time: string;
                end_time: string;
                show_date: string;
                createdAt: string;
                updatedAt: string;
                __v: number;
            };
            seats: Array<{
                seat_id: {
                    _id: string;
                    seat_id: string;
                    room_id: string;
                    seat_status: string;
                    seat_type: string;
                    price_seat: number;
                    column_of_seat: string;
                    row_of_seat: string;
                    __v: number;
                    createdAt: string;
                    updatedAt: string;
                    selected_by: string | null;
                    selection_time: string | null;
                };
                price: number;
                _id: string;
            }>;
            combos: Array<{
                combo_id: string;
                quantity: number;
                price: number;
                _id: string;
            }>;
            voucher_id: string | null;
            total_amount: number;
            status: string;
            createdAt: string;
            updatedAt: string;
            __v: number;
        };
    };
}

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private baseUrl = 'http://127.0.0.1:3000/payments';

    constructor(private http: HttpClient) { }

    createPayment(ticketId: string): Observable<CreatePaymentResponse> {
        const body = {
            ticket_id: ticketId
        };

        return this.http.post<CreatePaymentResponse>(
            `${this.baseUrl}/create`,
            body
        ).pipe(
            catchError(this.handleError)
        );
    }
    processPaymentAction(paymentId: string, action: 0 | 1): Observable<ApiResponse<string>> {
        const body = {
            payment_id: paymentId,
            action: action
        };

        return this.http.put<ApiResponse<string>>(
            `${this.baseUrl}/process-action`,
            body
        ).pipe(
            catchError(this.handleError)
        );
    }

    getAllPayments(page: number = 1, limit: number = 10, search: string = ''): Observable<PaymentApiResponseDto> {


        return this.http.get<ApiResponse<PaymentApiResponseDto>>(`${this.baseUrl}/get-all?search=${search}&page=${page}&limit=${limit}`)
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