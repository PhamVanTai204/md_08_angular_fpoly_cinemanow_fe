export interface ISeatDto {
    id?: string;
    seat_id: string;
    room_id: string;
    seat_status: 'available' | 'booked' | 'unavailable';
    seat_type: 'standard' | 'vip' | 'couple';
    price_seat: number;
    column_of_seat: string;
    row_of_seat: string;
    created_at?: string;
    updated_at?: string;
}

export class SeatDto implements ISeatDto {
    id?: string;
    seat_id: string = '';
    room_id: string = '';
    seat_status: 'available' | 'booked' | 'unavailable' = 'available';
    seat_type: 'standard' | 'vip' | 'couple' = 'standard';
    price_seat: number = 0;
    column_of_seat: string = '';
    row_of_seat: string = '';
    created_at?: string;
    updated_at?: string;

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
            this.id = _data["_id"];
            this.seat_id = _data["seat_id"];
            this.room_id = _data["room_id"];
            this.seat_status = _data["seat_status"];
            this.seat_type = _data["seat_type"];
            this.price_seat = _data["price_seat"];
            this.column_of_seat = _data["column_of_seat"];
            this.row_of_seat = _data["row_of_seat"];
            this.created_at = _data["createdAt"];
            this.updated_at = _data["updatedAt"];
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
        if (this.id) {
            data["_id"] = this.id;
        }
        data["seat_id"] = this.seat_id;
        data["room_id"] = this.room_id;
        data["seat_status"] = this.seat_status;
        data["seat_type"] = this.seat_type;
        data["price_seat"] = this.price_seat;
        data["column_of_seat"] = this.column_of_seat;
        data["row_of_seat"] = this.row_of_seat;
        data["createdAt"] = this.created_at;
        data["updatedAt"] = this.updated_at;
        return data;
    }

    clone(): SeatDto {
        return SeatDto.fromJS(this.toJSON());
    }
}
