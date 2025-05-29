import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError, map, tap } from "rxjs";
import { RoomDto } from "../dtos/roomDto.dto";
import { ISeatDto, SeatDto } from "../dtos/seatDto.dto";

@Injectable({
    providedIn: 'root'
})
export class SeatService {
    private apiUrlGetbyrom = "http://127.0.0.1:3000/cinema/rooms"; // Base URL
    private apiUrlAddMultiple = "http://127.0.0.1:3000/seats/addmuti"; // URL để tạo hàng loạt ghế
    private apiUrlUpdateSeat = "http://127.0.0.1:3000/seats/update/"; // URL để tạo hàng loạt ghế
    private apiUrlCreateMutiSeat = "http://127.0.0.1:3000/seats/addmuti"; // URL để tạo hàng loạt ghế

    constructor(private http: HttpClient) { }
    // URL cập nhật nhiều ghế
    private apiUrlUpdateMultiple = "http://127.0.0.1:3000/seats/updatemuti";

    // Phương thức cập nhật nhiều ghế
    updateMultipleSeats(_ids: string[], seat_type: string, price_seat: number): Observable<any> {
        const data = {
            _ids,
            seat_type,
            price_seat
        };

        return this.http.put(this.apiUrlUpdateMultiple, data).pipe(
            map(response => response),
            catchError(this.handleError)
        );
    }
    // Phương thức thêm nhiều ghế
    addMultipleSeats(room_id: string, rows: number, cols: number, price_seat: number): Observable<any> {
        const data = {
            room_id: room_id,
            rows: rows,
            cols: cols,
            price_seat: price_seat
        };

        return this.http.post(this.apiUrlAddMultiple, data)
            .pipe(
                map(response => {
                    // Xử lý phản hồi từ API nếu cần
                    return response;
                }),
                catchError(this.handleError)
            );
    }
    //   /rooms/seats1/:room_id/showtime1/:showtime_id
    getSeatByRoomId(roomId: string, showtimeId: string): Observable<SeatDto[]> {
        return this.http.get<{ code: number, error: any, data: SeatDto[] }>(`${this.apiUrlGetbyrom}/seats1/${roomId}/showtime1/${showtimeId}`)
            .pipe(
                map(response => {
                    if (response.code === 200 && response.data) {
                        return response.data.map(seat => new SeatDto(seat));
                    }
                    return [];
                }),
                catchError(this.handleError)
            );
    }

    // Phương thức cập nhật ghế
    updateSeatStatus(seatId: string, seat_status: string): Observable<any> {
        const data = {
            seat_status: seat_status
        };

        return this.http.put(`${this.apiUrlUpdateSeat}/${seatId}`, data)
            .pipe(
                map(response => {
                    return response;
                }),
                catchError(this.handleError)
            );
    }
    groupSeatsByRow(seats: any[]): { [key: string]: any[] } {
        return seats.reduce((acc, seat) => {
            const row_of_seat = seat.row_of_seat; // Sử dụng trực tiếp trường row_of_seat
            if (!acc[row_of_seat]) {
                acc[row_of_seat] = [];
            }
            acc[row_of_seat].push(seat);
            return acc;
        }, {});
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