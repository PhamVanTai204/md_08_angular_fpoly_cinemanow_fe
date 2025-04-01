export interface IRoomDto {
    id?: string;
    cinema_id: string;
    room_name: string;
    room_style: '2D' | '3D' | '4DX' | 'IMAX';
    total_seat: number;
    status: 'active' | 'maintenance' | 'inactive';
}

export class RoomDto implements IRoomDto {
    id: string = 's';
    cinema_id: string = '';
    room_name: string = '';
    room_style: '2D' | '3D' | '4DX' | 'IMAX' = '2D';
    total_seat: number = 0;
    status: 'active' | 'maintenance' | 'inactive' = 'active';

    constructor(data?: IRoomDto) {
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
            this.cinema_id = _data["cinema_id"];
            this.room_name = _data["room_name"];
            this.room_style = _data["room_style"];
            this.total_seat = _data["total_seat"];
            this.status = _data["status"];
        }
    }

    static fromJS(data: any): RoomDto {
        data = typeof data === 'object' ? data : {};
        let result = new RoomDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        if (this.id) {
            data["_id"] = this.id;
        }
        data["cinema_id"] = this.cinema_id;
        data["room_name"] = this.room_name;
        data["room_style"] = this.room_style;
        data["total_seat"] = this.total_seat;
        data["status"] = this.status;
        return data;
    }

    clone(): RoomDto {
        return RoomDto.fromJS(this.toJSON());
    }
}
