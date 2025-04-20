import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError, map, tap } from "rxjs";
import { RoomDto } from "../dtos/roomDto.dto";
import { ISeatDto, SeatDto } from "../dtos/seatDto.dto";
import { ITicketDto, TicketDto } from "../dtos/ticketDto.dto";

@Injectable({
    providedIn: 'root'
})

export class TicketService {
    private apiUrlCreateTicket = "http://127.0.0.1:3000/tickets/web-booking"; // Base URL

    constructor(private http: HttpClient) { }
    createTicket(ticket: TicketDto): Observable<TicketDto> {
        const payload = {
            user_id: ticket.user_id,
            showtime_id: ticket.showtime_id,
            seats: ticket.seats.map(seat => ({
                seat_id: seat.seat_id,
                price: seat.price_seat
            })),
            combos: ticket.combos.map(combo => ({
                combo_id: combo.combo_id,
                quantity: combo.quantity ?? 1, // fallback nếu không có
                price: combo.price_combo
            })),
            total_amount: ticket.total_amount
        };

        // Đảm bảo seats được khởi tạo đúng
        const seats = ticket.seats.map(seat => SeatDto.fromJS(seat));

        return this.http.post<any>(this.apiUrlCreateTicket, payload).pipe(
            map(res => {
                // Ánh xạ dữ liệu trả về từ API vào TicketDto
                return new TicketDto({
                    ...res.data,  // Giả sử 'data' chứa thông tin vé
                    user_id: res.data.user_id,
                    showtime_id: res.data.showtime_id,
                    ticket_id: res.data.ticket_id
                    // Thêm các trường dữ liệu cần thiết từ API vào đây
                });
                console.log();

            }),
            catchError(this.handleError)
        );
    }



    private handleError(error: HttpErrorResponse): Observable<never> {
        console.error('SeatService Error:', error);
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