export interface IRoomDto {
    id: string;
    cinema_id: string;
    room_name: string;
    room_style: string;
    total_seat: number;
    status: string;
  }
  
  export class RoomDto implements IRoomDto {
    id: string = '';
    cinema_id: string = '';
    room_name: string = '';
    room_style: string = '';
    total_seat: number = 0;
    status: string = 'active';
  
    constructor(data?: IRoomDto) {
      if (data) {
        Object.assign(this, data);
      }
    }
  
    init(_data?: any) {
      if (_data) {
        this.id = _data["_id"] || _data["id"] || '';
        this.cinema_id = _data["cinema_id"] || '';
        this.room_name = _data["room_name"] || '';
        this.room_style = _data["room_style"] || '';
        this.total_seat = _data["total_seat"] || 0;
        this.status = _data["status"] || 'active';
      }
    }
  
    static fromJS(data: any): RoomDto {
      const result = new RoomDto();
      result.init(data);
      return result;
    }
  
    toJSON() {
      const data: any = {};
      
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