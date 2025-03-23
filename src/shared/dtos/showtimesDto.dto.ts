export interface IShowtimesDto {
  // Các trường cần có, tương ứng dữ liệu server trả về
  id?: string;             // nếu server trả về _id, có thể map vào đây
  movieId: string;         // ánh xạ từ "movie_id"
  showtimeStatus: number;  // ánh xạ từ "showtime_status"
  startTime: string;       // ánh xạ từ "start_time"
  endTime: string;         // ánh xạ từ "end_time"
  price: number;           // ánh xạ từ "price"
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
   * Khởi tạo dữ liệu từ đối tượng JSON trả về từ server
   */
  init(_data?: any) {
    if (_data) {
      // Nếu server có trả về _id (hoặc id), bạn có thể gán vào this.id
      this.id = _data["_id"] || _data["id"];
      this.movieId = _data["movie_id"];
      this.showtimeStatus = _data["showtime_status"];
      this.startTime = _data["start_time"];
      this.endTime = _data["end_time"];
      this.price = _data["price"];
    }
  }

  /**
   * Tạo đối tượng ShowtimesDto từ một object JS (thường là JSON)
   */
  static fromJS(data: any): ShowtimesDto {
    data = typeof data === 'object' ? data : {};
    let result = new ShowtimesDto();
    result.init(data);
    return result;
  }

  /**
   * Chuyển đổi instance hiện tại thành object để gửi lên server
   */
  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    // Nếu cần gửi kèm _id (hoặc id) cho server, bạn có thể gán:
    data["_id"] = this.id;
    data["movie_id"] = this.movieId;
    data["showtime_status"] = this.showtimeStatus;
    data["start_time"] = this.startTime;
    data["end_time"] = this.endTime;
    data["price"] = this.price;
    return data;
  }

  /**
   * Tạo bản sao của đối tượng hiện tại
   */
  clone(): ShowtimesDto {
    return ShowtimesDto.fromJS(this.toJSON());
  }
}
