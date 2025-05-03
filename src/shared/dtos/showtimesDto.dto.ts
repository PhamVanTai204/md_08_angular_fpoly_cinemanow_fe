export interface IShowtimesDto {
  id?: string;
  showtimeId: string;   // map từ showtime_id
  movieId: string;      // map từ movie_id
  movieName?: string;   // nếu server populate => lấy tên phim
  roomId: string;       // map từ room_id
  roomName?: string;    // nếu server populate => lấy tên phòng
  cinemaId: string;     // map từ cinema_id
  startTime: string;    // map từ start_time
  endTime: string;      // map từ end_time
  showDate: string;     // map từ show_date
  createdAt?: string;   // thời gian tạo (nếu có)
  updatedAt?: string;   // thời gian cập nhật (nếu có)
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
  createdAt?: string;
  updatedAt?: string;

  constructor(data?: Partial<IShowtimesDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * Khởi tạo đối tượng ShowtimesDto từ dữ liệu API
   * @param _data Dữ liệu từ API
   */
  init(_data?: any): void {
    if (_data) {
      // Handle ID field
      this.id = _data["_id"] || _data["id"];
      
      // Handle showtime_id
      this.showtimeId = _data["showtime_id"] || _data["showtimeId"] || '';
      
      // Handle movie_id - can be string or object with _id property
      if (typeof _data["movie_id"] === 'object' && _data["movie_id"] !== null) {
        this.movieId = _data["movie_id"]._id || '';
        // Get movie name if available
        this.movieName = _data["movie_id"].title || _data["movie_id"].name || '';
      } else {
        this.movieId = _data["movie_id"] || _data["movieId"] || '';
      }
      
      // Handle room_id - can be string or object with _id property
      if (typeof _data["room_id"] === 'object' && _data["room_id"] !== null) {
        this.roomId = _data["room_id"]._id || '';
        // Get room name if available
        this.roomName = _data["room_id"].room_name || _data["room_id"].name || '';
      } else {
        this.roomId = _data["room_id"] || _data["roomId"] || '';
      }
      
      // Handle cinema_id
      if (typeof _data["cinema_id"] === 'object' && _data["cinema_id"] !== null) {
        this.cinemaId = _data["cinema_id"]._id || '';
      } else {
        this.cinemaId = _data["cinema_id"] || _data["cinemaId"] || '';
      }
      
      // Handle times
      this.startTime = _data["start_time"] || _data["startTime"] || '';
      this.endTime = _data["end_time"] || _data["endTime"] || '';
      
      // Handle date - can be string or Date object
      if (_data["show_date"]) {
        // If it's already a string in expected format, use it directly
        if (typeof _data["show_date"] === 'string') {
          this.showDate = _data["show_date"];
        } else {
          // If it's a Date object or timestamp, convert to ISO string
          try {
            this.showDate = new Date(_data["show_date"]).toISOString();
          } catch (error) {
            console.error('Error parsing date:', error);
            this.showDate = _data["show_date"].toString();
          }
        }
      } else {
        this.showDate = _data["showDate"] || '';
      }
      
      // Handle audit fields
      this.createdAt = _data["createdAt"] || _data["created_at"];
      this.updatedAt = _data["updatedAt"] || _data["updated_at"];
      
      // Handle movieName and roomName if provided directly
      if (_data["movieName"] && !this.movieName) {
        this.movieName = _data["movieName"];
      }
      
      if (_data["roomName"] && !this.roomName) {
        this.roomName = _data["roomName"];
      }
    }
  }

  /**
   * Tạo đối tượng ShowtimesDto từ JSON
   * @param data Dữ liệu JSON
   * @returns ShowtimesDto
   */
  static fromJS(data: any): ShowtimesDto {
    const result = new ShowtimesDto();
    result.init(data);
    return result;
  }

  /**
   * Chuyển đối tượng thành JSON để gửi đến API
   * @returns Đối tượng JSON
   */
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

  /**
   * Tạo bản sao của đối tượng
   * @returns Bản sao của ShowtimesDto
   */
  clone(): ShowtimesDto {
    return ShowtimesDto.fromJS(this.toJSON());
  }
}