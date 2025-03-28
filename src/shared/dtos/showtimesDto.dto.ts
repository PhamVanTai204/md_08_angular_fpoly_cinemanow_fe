export interface IShowtimesDto {
  id?: string;
  showtime_id: string;
  movie_id: string;
  room_id: string;
  show_date: string;
  start_time: string;
  end_time: string;
}

export class ShowtimesDto implements IShowtimesDto {
  id?: string;
  showtime_id: string = '';
  movie_id: string = '';
  room_id: string = '';
  show_date: string = '';
  start_time: string = '';
  end_time: string = '';

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
    result.movie_id = data['movie_id'] || '';
    result.room_id = data['room_id'] || '';
    result.show_date = data['show_date'] || '';
    result.start_time = data['start_time'] || '';
    result.end_time = data['end_time'] || '';
    
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
    data['show_date'] = this.show_date;
    data['start_time'] = this.start_time;
    data['end_time'] = this.end_time;
    
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
      show_date: this.show_date,
      start_time: this.start_time,
      end_time: this.end_time
    });
  }
}