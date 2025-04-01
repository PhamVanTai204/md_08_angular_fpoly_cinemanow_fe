import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError, map, tap } from "rxjs";
import { RoomDto } from "../dtos/roomDto.dto";
import { ISeatDto, SeatDto } from "../dtos/seatDto.dto";

@Injectable({
    providedIn: 'root'
})
export class SeatService {
    private apiUrlGetbyrom = "http://127.0.0.1:3000/cinema/rooms/seats"; // Base URL

    constructor(private http: HttpClient) { }
    getSeatByRoomId(roomId: string): Observable<SeatDto[]> {
        return this.http.get<{ code: number, error: any, data: ISeatDto[] }>(`${this.apiUrlGetbyrom}/${roomId}`)
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

    groupSeatsByRow(seats: any[]): { [key: string]: any[] } {
        return seats.reduce((acc, seat) => {
            const row = seat.row; // Sử dụng trực tiếp trường row
            if (!acc[row]) {
                acc[row] = [];
            }
            acc[row].push(seat);
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