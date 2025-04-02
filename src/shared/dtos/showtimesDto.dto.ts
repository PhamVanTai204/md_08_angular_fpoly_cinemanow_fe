export interface IShowtimesDto {
  id?: string;
  showtimeId: string;   // map từ showtime_id
  movieId: string;      // map từ movie_id
  movieName?: string;   // nếu server populate => lấy tên phim
  roomId: string;       // map từ room_id
  roomName?: string;    // nếu server populate => lấy tên phòng
  startTime: string;    // map từ start_time
  endTime: string;      // map từ end_time
  showDate: string;     // map từ show_date (kiểu Date, nhưng hiển thị chuỗi)
}

export class ShowtimesDto implements IShowtimesDto {
  id?: string;
  showtimeId!: string;
  movieId!: string;
  movieName?: string;
  roomId!: string;
  roomName?: string;
  startTime!: string;
  endTime!: string;
  showDate!: string;

  constructor(data?: IShowtimesDto) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * Gán dữ liệu từ object JSON (thường là kết quả trả về từ server)
   */
  init(_data?: any) {
    if (_data) {
      this.id = _data["_id"] || _data["id"];
      this.showtimeId = _data["showtime_id"];

      // Nếu movie_id được populate (object) => trích xuất ._id và .title/name
      if (typeof _data["movie_id"] === 'object' && _data["movie_id"] !== null) {
        this.movieId = _data["movie_id"]._id;
        // Ưu tiên sử dụng title, nếu không có thì dùng name
        this.movieName = _data["movie_id"].title || _data["movie_id"].name;
      } else {
        this.movieId = _data["movie_id"];
      }

      // Nếu room_id được populate (object) => trích xuất ._id và .room_name/name
      if (typeof _data["room_id"] === 'object' && _data["room_id"] !== null) {
        this.roomId = _data["room_id"]._id;
        // Ưu tiên sử dụng room_name, nếu không có thì dùng name
        this.roomName = _data["room_id"].room_name || _data["room_id"].name;
      } else {
        this.roomId = _data["room_id"];
      }

      this.startTime = _data["start_time"];
      this.endTime = _data["end_time"];

      // show_date là kiểu Date => chuyển sang chuỗi ISO
      if (_data["show_date"]) {
        // Nếu đã là chuỗi ISO thì giữ nguyên, nếu là Date thì chuyển
        this.showDate = typeof _data["show_date"] === 'string' 
          ? _data["show_date"]
          : new Date(_data["show_date"]).toISOString();
      } else {
        this.showDate = "";
      }
    }
  }

  /**
   * Tạo instance từ object JS
   */
  static fromJS(data: any): ShowtimesDto {
    const result = new ShowtimesDto();
    result.init(data);
    return result;
  }

  /**
   * Chuyển đối tượng hiện tại thành JSON để gửi lên server
   */
  toJSON() {
    // Đặt giá trị mặc định cho cinema_id (lấy từ ví dụ của bạn)
    const cinema_id = "67e7a459496d88d4883c43a0"; // ID mặc định của rạp chiếu phim
    
    // Định dạng lại ngày tháng từ ISO sang DD/MM/YYYY nếu có
    let formattedDate = this.showDate;
    if (this.showDate) {
      try {
        const date = new Date(this.showDate);
        if (!isNaN(date.getTime())) {
          // Định dạng thành DD/MM/YYYY
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString(); // Không cần padStart vì API dùng D/M/YYYY
          const year = date.getFullYear();
          formattedDate = `${day}/${month}/${year}`;
        }
      } catch (e) {
        console.error('Lỗi định dạng ngày tháng:', e);
      }
    }
    
    return {
      _id: this.id,
      showtime_id: this.showtimeId,
      movie_id: this.movieId,
      room_id: this.roomId,
      cinema_id: cinema_id, // Thêm cinema_id
      start_time: this.startTime,
      end_time: this.endTime,
      show_date: formattedDate
    };
  }

  /**
   * Tạo bản sao đối tượng hiện tại
   */
  clone(): ShowtimesDto {
    return ShowtimesDto.fromJS(this.toJSON());
  }
}