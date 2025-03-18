export interface IPhimDto {
    id: string;
    statusFilm: number;
    genreFilm: string[];
    trailerFilm: string;
    duration: string;
    releaseDate: string;
    endDate: string;
    imageFilm: string;
    title: string;
    describe: string;
  }
  
  export class PhimDto implements IPhimDto {
    id!: string;
    statusFilm!: number;
    genreFilm!: string[];
    trailerFilm!: string;
    duration!: string;
    releaseDate!: string;
    endDate!: string;
    imageFilm!: string;
    title!: string;
    describe!: string;
  
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
        this.statusFilm = _data["status_film"];
        this.genreFilm = _data["genre_film"];
        this.trailerFilm = _data["trailer_film"];
        this.duration = _data["duration"];
        this.releaseDate = _data["release_date"];
        this.endDate = _data["end_date"];
        this.imageFilm = _data["image_film"];
        this.title = _data["title"];
        this.describe = _data["describe"];
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
      data["_id"] = this.id;
      data["status_film"] = this.statusFilm;
      data["genre_film"] = this.genreFilm;
      data["trailer_film"] = this.trailerFilm;
      data["duration"] = this.duration;
      data["release_date"] = this.releaseDate;
      data["end_date"] = this.endDate;
      data["image_film"] = this.imageFilm;
      data["title"] = this.title;
      data["describe"] = this.describe;
      return data;
    }
  
    clone(): PhimDto {
      return PhimDto.fromJS(this.toJSON());
    }
  }