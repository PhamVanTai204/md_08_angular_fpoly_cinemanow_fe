export interface ICinemaDto {
  id: string;          // _id từ MongoDB
  cinemaName: string;  // Tên rạp
  location: string;    // Địa chỉ
  totalRoom: number;   // Số phòng
}

export class CinemaDto implements ICinemaDto {
  id!: string;
  cinemaName!: string;
  location!: string;
  totalRoom!: number;

  constructor(data?: ICinemaDto) {
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
      this.cinemaName = _data["cinema_name"];
      this.location = _data["location"];
      this.totalRoom = _data["total_room"];
    }
  }

  static fromJS(data: any): CinemaDto {
    data = typeof data === 'object' ? data : {};
    let result = new CinemaDto();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data["_id"] = this.id;
    data["cinema_name"] = this.cinemaName;
    data["location"] = this.location;
    data["total_room"] = this.totalRoom;
    return data;
  }

  clone(): CinemaDto {
    return CinemaDto.fromJS(this.toJSON());
  }
}
