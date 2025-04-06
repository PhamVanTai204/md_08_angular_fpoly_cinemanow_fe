import { ShowtimesDto } from "./showtimesDto.dto"; // import đúng đường dẫn

export interface ICinemaDto {
  id: string;
  cinemaName: string;
  location: string;
  totalRoom: number;
  showtimes?: ShowtimesDto[]; // Thêm dòng này
}

export class CinemaDto implements ICinemaDto {
  id!: string;
  cinemaName!: string;
  location!: string;
  totalRoom!: number;
  showtimes?: ShowtimesDto[]; // Thêm dòng này

  constructor(data?: ICinemaDto) {
    if (data) {
      Object.assign(this, data);
    }
  }

  init(_data?: any) {
    if (_data) {
      this.id = _data["_id"];
      this.cinemaName = _data["cinema_name"];
      this.location = _data["location"];
      this.totalRoom = _data["total_room"];

      // Map showtimes nếu có
      if (Array.isArray(_data["showtimes"])) {
        this.showtimes = _data["showtimes"].map((s: any) => ShowtimesDto.fromJS(s));
      } else {
        this.showtimes = [];
      }
    }
  }

  static fromJS(data: any): CinemaDto {
    const result = new CinemaDto();
    result.init(data);
    return result;
  }

  toJSON() {
    const data: any = {};
    data["_id"] = this.id;
    data["cinema_name"] = this.cinemaName;
    data["location"] = this.location;
    data["total_room"] = this.totalRoom;
    data["showtimes"] = this.showtimes?.map(s => s.toJSON()); // optional
    return data;
  }

  clone(): CinemaDto {
    return CinemaDto.fromJS(this.toJSON());
  }
}
