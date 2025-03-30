import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError, map, tap } from "rxjs";
import { RoomDto } from "../dtos/roomDto.dto";

@Injectable({
    providedIn: 'root'
})
export class RoomService {

    constructor(private http: HttpClient) { }
    private getAllUrl = 'http://127.0.0.1:3000/room/getroom';
    private getByCinema = 'http://127.0.0.1:3000/room/cinema/';

    private createUrlRoom = 'http://127.0.0.1:3000/room/addroom';

    createRoom(cinema_id: string, room_name: string, room_style: string, total_seat: number): Observable<RoomDto> {
        const body = { cinema_id, room_name, room_style, total_seat }
        return this.http.post<RoomDto>(this.createUrlRoom, body).pipe(
            map(response => new RoomDto(response)), // Chuyển đổi phản hồi thành RoomDto
            catchError(this.handleError)
        );
    }

    getByCinemaId(id: string): Observable<RoomDto[]> {
        return this.http.get<any>(this.getByCinema + id).pipe(
            map(response => response.data.map((item: any) => RoomDto.fromJS(item))), // ✅ Chỉ lấy `data`
            catchError(this.handleError)
        );
    }
    getAll(): Observable<RoomDto[]> {
        return this.http.get<RoomDto[]>(this.getAllUrl).pipe(
            map(response => response.map(room => new RoomDto(room))),
            catchError(this.handleError)
        );
    }
    private handleError(error: HttpErrorResponse): Observable<never> {
        console.error('RoomService Error:', error);
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