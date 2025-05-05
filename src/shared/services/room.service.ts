import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError, map, of } from "rxjs";
import { RoomDto } from "../dtos/roomDto.dto";

@Injectable({
    providedIn: 'root'
})
export class RoomService {
    private apiUrlGetAll = 'http://127.0.0.1:3000/room/getroom';
    private apiUrlGetByCinema = 'http://127.0.0.1:3000/room/getroomById/';
    private apiUrlCreate = 'http://127.0.0.1:3000/room/addRoom';
    private apiUrlGetById = 'http://127.0.0.1:3000/room/getRoomById/';
    private apiUrlEdit = 'http://127.0.0.1:3000/room/editRoom/';
    private apiUrlDelete = 'http://127.0.0.1:3000/room/deleteRoom/';
    private getByCinema = 'http://127.0.0.1:3000/room/cinema/';

    constructor(private http: HttpClient) { }

    /**
     * Lấy tất cả phòng
     */
    getAll(): Observable<RoomDto[]> {
        return this.http.get<any>(this.apiUrlGetAll).pipe(
            map(response => {
                if (response && response.code === 200 && response.data && response.data.rooms) {
                    // Make sure we're accessing the correct property in the response
                    return response.data.rooms.map((item: any) => RoomDto.fromJS(item));
                } else if (response && response.code === 200 && Array.isArray(response.data)) {
                    return response.data.map((item: any) => RoomDto.fromJS(item));
                }
                throw new Error('Lỗi khi lấy danh sách phòng: dữ liệu không hợp lệ');
            }),
            catchError(this.handleError)
        );
    }


    /**
    * Lấy phòng theo ID rạp
    * 
    * Lưu ý: API endpoint này có thể yêu cầu truyền tham số khác không phải ID rạp.
    * Nếu gặp vấn đề, cần xác nhận API hoạt động đúng cách.
    */
    getByCinemaId(id: string): Observable<RoomDto[]> {
        return this.http.get<any>(this.getByCinema + id).pipe(
            map(response => response.data.map((item: any) => RoomDto.fromJS(item))), // ✅ Chỉ lấy `data`
            catchError(this.handleError)
        );
    }

    /**
     * Lấy phòng theo ID
     */
    getRoomById(roomId: string): Observable<RoomDto> {
        return this.http.get<any>(`${this.apiUrlGetById}${roomId}`).pipe(
            map(response => {
                if (response && response.code === 200 && response.data) {
                    return RoomDto.fromJS(response.data);
                }
                throw new Error('Lỗi khi lấy thông tin phòng: dữ liệu không hợp lệ');
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Tạo phòng mới
     */
    createRoom(cinema_id: string, room_name: string, room_style: string, total_seat: number): Observable<RoomDto> {
        const body = {
            cinema_id,
            room_name,
            room_style,
            total_seat,
            status: 'active' // Mặc định là hoạt động
        };

        return this.http.post<any>(this.apiUrlCreate, body).pipe(
            map(response => {
                if (response && (response.code === 200 || response.code === 201) && response.data) {
                    return RoomDto.fromJS(response.data);
                }
                throw new Error('Lỗi khi tạo phòng mới: dữ liệu phản hồi không hợp lệ');
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Cập nhật phòng
     */
    editRoom(roomId: string, roomData: any): Observable<RoomDto> {
        return this.http.put<any>(`${this.apiUrlEdit}${roomId}`, roomData).pipe(
            map(response => {
                if (response && response.code === 200 && response.data) {
                    return RoomDto.fromJS(response.data);
                }
                throw new Error('Lỗi khi cập nhật thông tin phòng');
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Xóa phòng
     */
    deleteRoom(roomId: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrlDelete}${roomId}`).pipe(
            map(response => {
                if (response && response.code === 200) {
                    return response.data;
                }
                throw new Error('Lỗi khi xóa phòng');
            }),
            catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        console.error('RoomService Error:', error);
        let errorMessage = 'Đã xảy ra lỗi khi thực hiện thao tác.';

        if (error.error && error.error.message) {
            errorMessage = error.error.message;
        }

        return throwError(() => new Error(errorMessage));
    }
}