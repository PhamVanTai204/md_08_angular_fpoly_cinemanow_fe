export interface IPhimDto {
  id?: string;
  status_film: number;
  genre_film: string[];
  trailer_film: string;
  duration: string;
  release_date: string;
  end_date: string;
  image_film: string;
  title: string;
  describe: string;
  director: string;
  age_limit: number;
  language: string;
}

export class PhimDto implements IPhimDto {
  id?: string;
  status_film: number = 1;
  genre_film: string[] = [];
  trailer_film: string = '';
  duration: string = '';
  release_date: string = '';
  end_date: string = '';
  image_film: string = '';
  title: string = '';
  describe: string = '';
  director: string = '';
  age_limit: number = 0;
  language: string = '';

  constructor(data?: IPhimDto) {
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
      this.status_film = _data["status_film"];
      this.genre_film = _data["genre_film"];
      this.trailer_film = _data["trailer_film"];
      this.duration = _data["duration"];
      this.release_date = _data["release_date"];
      this.end_date = _data["end_date"];
      this.image_film = _data["image_film"];
      this.title = _data["title"];
      this.describe = _data["describe"];
      this.director = _data["director"];
      this.age_limit = _data["age_limit"];
      this.language = _data["language"];
    }
  }

  static fromJS(data: any): PhimDto {
    data = typeof data === 'object' ? data : {};
    let result = new PhimDto();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    if (this.id) {
      data["_id"] = this.id;
    }
    data["status_film"] = this.status_film;
    data["genre_film"] = this.genre_film;
    data["trailer_film"] = this.trailer_film;
    data["duration"] = this.duration;
    data["release_date"] = this.release_date;
    data["end_date"] = this.end_date;
    data["image_film"] = this.image_film;
    data["title"] = this.title;
    data["describe"] = this.describe;
    data["director"] = this.director;
    data["age_limit"] = this.age_limit;
    data["language"] = this.language;
    return data;
  }

  clone(): PhimDto {
    return PhimDto.fromJS(this.toJSON());
  }
}
