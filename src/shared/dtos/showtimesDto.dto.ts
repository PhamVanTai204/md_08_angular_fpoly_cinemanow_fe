export interface IShowtimesDto {
  id?: string;             // map từ _id trong MongoDB
  movieId: string;         // map từ "movie_id"
  showtimeStatus: number;  // map từ "showtime_status"
  startTime: string;       // map từ "start_time"
  endTime: string;         // map từ "end_time"
  price: number;           // map từ "price"
}

export class ShowtimesDto implements IShowtimesDto {
  id?: string;
  movieId!: string;
  showtimeStatus!: number;
  startTime!: string;
  endTime!: string;
  price!: number;

  constructor(data?: IShowtimesDto) {
    if (data) {
      for (const property in data) {
        if (data.hasOwnProperty(property)) {
          (this as any)[property] = (data as any)[property];
        }
      }
    }
  }

  /**
   * Gán dữ liệu từ object JSON (thường trả về từ server)
   */
  init(_data?: any) {
    if (_data) {
      // Nếu server trả về _id
      this.id = _data["_id"] || _data["id"];
      this.movieId = _data["movie_id"];
      this.showtimeStatus = _data["showtime_status"];
      this.startTime = _data["start_time"];
      this.endTime = _data["end_time"];
      this.price = _data["price"];
    }
  }

  /**
   * Tạo ShowtimesDto từ một object JS
   */
  static fromJS(data: any): ShowtimesDto {
    data = typeof data === 'object' ? data : {};
    let result = new ShowtimesDto();
    result.init(data);
    return result;
  }

  /**
   * Chuyển đối tượng hiện tại thành object để gửi lên server
   */
  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data["_id"] = this.id;
    data["movie_id"] = this.movieId;
    data["showtime_status"] = this.showtimeStatus;
    data["start_time"] = this.startTime;
    data["end_time"] = this.endTime;
    data["price"] = this.price;
    return data;
  }

  /**
   * Tạo bản sao đối tượng hiện tại
   */
  clone(): ShowtimesDto {
    return ShowtimesDto.fromJS(this.toJSON());
  }
}
