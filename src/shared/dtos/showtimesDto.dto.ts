export interface IShowtimesDto {
  id?: string;
  showtimeId: string;   // map từ showtime_id
  movieId: string;      // map từ movie_id
  movieName?: string;   // nếu server populate => lấy tên phim
  roomId: string;       // map từ room_id
  roomName?: string;    // nếu server populate => lấy tên phòng
  cinemaId: string;     // map từ cinema_id (mới thêm)
  startTime: string;    // map từ start_time
  endTime: string;      // map từ end_time
  showDate: string;     // map từ show_date (kiểu Date, nhưng hiển thị chuỗi ISO)
}

export class ShowtimesDto implements IShowtimesDto {
  id?: string;
  showtimeId!: string;
  movieId!: string;
  movieName?: string;
  roomId!: string;
  roomName?: string;
  cinemaId!: string;
  startTime!: string;
  endTime!: string;
  showDate!: string;

  constructor(data?: IShowtimesDto) {
    if (data) {
      Object.assign(this, data);
    }
  }

  init(_data?: any): void {
    if (_data) {
      this.id = _data["_id"] || _data["id"];
      this.showtimeId = _data["showtime_id"];
      if (typeof _data["movie_id"] === 'object' && _data["movie_id"] !== null) {
        this.movieId = _data["movie_id"]._id;
        this.movieName = _data["movie_id"].title || _data["movie_id"].name;
      } else {
        this.movieId = _data["movie_id"];
      }
      if (typeof _data["room_id"] === 'object' && _data["room_id"] !== null) {
        this.roomId = _data["room_id"]._id;
        this.roomName = _data["room_id"].room_name || _data["room_id"].name;
      } else {
        this.roomId = _data["room_id"];
      }
      this.cinemaId = _data["cinema_id"];
      this.startTime = _data["start_time"];
      this.endTime = _data["end_time"];
      if (_data["show_date"]) {
        this.showDate = typeof _data["show_date"] === 'string'
          ? _data["show_date"]
          : new Date(_data["show_date"]).toISOString();
      } else {
        this.showDate = "";
      }
    }
  }

  static fromJS(data: any): ShowtimesDto {
    const result = new ShowtimesDto();
    result.init(data);
    return result;
  }

  toJSON(): any {
    return {
      _id: this.id,
      showtime_id: this.showtimeId,
      movie_id: this.movieId,
      room_id: this.roomId,
      cinema_id: this.cinemaId,
      start_time: this.startTime,
      end_time: this.endTime,
      show_date: this.showDate
    };
  }

  clone(): ShowtimesDto {
    return ShowtimesDto.fromJS(this.toJSON());
  }
}
