export interface IShowtimesDto {
  id?: string;
  showtime_id: string;
  movie_id: string | any; // Có thể là string hoặc object khi populate
  room_id: string | any; // Có thể là string hoặc object khi populate
  start_time: string;
  end_time: string;
  show_date: string | Date;
}

export class ShowtimesDto implements IShowtimesDto {
  id?: string;
  showtime_id: string = '';
  movie_id: string = '';
  room_id: string = '';
  start_time: string = '';
  end_time: string = '';
  show_date: string = '';

  constructor(data?: Partial<IShowtimesDto>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * Create a ShowtimesDto from JSON data
   */
  static fromJS(data: any): ShowtimesDto {
    data = typeof data === 'object' ? data : {};
    const result = new ShowtimesDto();
    
    // Map the properties from data to the DTO
    result.id = data['_id'] || data['id'];
    result.showtime_id = data['showtime_id'] || '';
    
    // Handle movie_id (can be string or object when populated)
    if (typeof data['movie_id'] === 'object' && data['movie_id'] !== null) {
      result.movie_id = data['movie_id']._id || data['movie_id'].id || '';
    } else {
      result.movie_id = data['movie_id'] || '';
    }
    
    // Handle room_id (can be string or object when populated)
    if (typeof data['room_id'] === 'object' && data['room_id'] !== null) {
      result.room_id = data['room_id']._id || data['room_id'].id || '';
    } else {
      result.room_id = data['room_id'] || '';
    }
    
    result.start_time = data['start_time'] || '';
    result.end_time = data['end_time'] || '';
    
    // Format date to YYYY-MM-DD
    if (data['show_date']) {
      const date = new Date(data['show_date']);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        result.show_date = `${year}-${month}-${day}`;
      } else {
        result.show_date = data['show_date'];
      }
    }
    
    return result;
  }

  /**
   * Convert to a plain JSON object
   */
  toJSON(): any {
    const data: any = {};
    
    // Only include id if it exists
    if (this.id) {
      data['_id'] = this.id;
    }
    
    data['showtime_id'] = this.showtime_id;
    data['movie_id'] = this.movie_id;
    data['room_id'] = this.room_id;
    data['start_time'] = this.start_time;
    data['end_time'] = this.end_time;
    
    // Convert date format to DD/MM/YYYY as expected by backend
    if (this.show_date) {
      const dateParts = this.show_date.toString().split('-');
      if (dateParts.length === 3) {
        data['show_date'] = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
      } else {
        data['show_date'] = this.show_date;
      }
    }
    
    return data;
  }

  /**
   * Create a copy of this DTO
   */
  clone(): ShowtimesDto {
    return new ShowtimesDto({
      id: this.id,
      showtime_id: this.showtime_id,
      movie_id: this.movie_id,
      room_id: this.room_id,
      start_time: this.start_time,
      end_time: this.end_time,
      show_date: this.show_date
    });
  }
}