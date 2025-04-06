export interface ISeatDto {
    _id?: string;  // Chuyển từ id thành _id
    seat_id: string;
    room_id: string;
    seat_status: 'available' | 'booked' | 'unavailable';
    seat_type: 'standard' | 'vip' | 'couple';
    price_seat: number;
    column_of_seat: string;
    row_of_seat: string;
    createdAt?: string;  // Cập nhật tên trường
    updatedAt?: string;  // Cập nhật tên trường
}

export class SeatDto implements ISeatDto {
    _id: string = '';  // Chuyển từ id thành _id
    seat_id: string = '';
    room_id: string = '';
    seat_status: 'available' | 'booked' | 'unavailable' = 'available';
    seat_type: 'standard' | 'vip' | 'couple' = 'standard';
    price_seat: number = 0;
    column_of_seat: string = '';
    row_of_seat: string = '';
    createdAt?: string;  // Cập nhật tên trường
    updatedAt?: string;  // Cập nhật tên trường

    constructor(data?: ISeatDto) {
        if (data) {
            for (const property in data) {
                if (data.hasOwnProperty(property)) {
                    (this as any)[property] = (data as any)[property];
                }
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            this._id = _data["_id"];  // Sử dụng _id thay vì id
            this.seat_id = _data["seat_id"];
            this.room_id = _data["room_id"];
            this.seat_status = _data["seat_status"];
            this.seat_type = _data["seat_type"];
            this.price_seat = _data["price_seat"];
            this.column_of_seat = _data["column_of_seat"];
            this.row_of_seat = _data["row_of_seat"];
            this.createdAt = _data["createdAt"];  // Cập nhật tên trường
            this.updatedAt = _data["updatedAt"];  // Cập nhật tên trường
        }
    }

    static fromJS(data: any): SeatDto {
        data = typeof data === 'object' ? data : {};
        let result = new SeatDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        if (this._id) {  // Sử dụng _id thay vì id
            data["_id"] = this._id;
        }
        data["seat_id"] = this.seat_id;
        data["room_id"] = this.room_id;
        data["seat_status"] = this.seat_status;
        data["seat_type"] = this.seat_type;
        data["price_seat"] = this.price_seat;
        data["column_of_seat"] = this.column_of_seat;
        data["row_of_seat"] = this.row_of_seat;
        data["createdAt"] = this.createdAt;  // Cập nhật tên trường
        data["updatedAt"] = this.updatedAt;  // Cập nhật tên trường
        return data;
    }

    clone(): SeatDto {
        return SeatDto.fromJS(this.toJSON());
    }
}
