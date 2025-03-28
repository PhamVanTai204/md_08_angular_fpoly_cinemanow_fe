export interface IGenresDto {
  id: string;
  genreName: string;
}

export class GenresDto implements IGenresDto {
  id!: string;
  genreName!: string;

  constructor(data?: IGenresDto) {
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
      // Check if _id exists in the response
      console.log('Genre data raw:', _data);
      this.id = _data["_id"];
      this.genreName = _data["name"];
    }
  }

  static fromJS(data: any): GenresDto {
    data = typeof data === 'object' ? data : {};
    let result = new GenresDto();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data["_id"] = this.id;
    data["name"] = this.genreName;
    return data;
  }

  clone(): GenresDto {
    return GenresDto.fromJS(this.toJSON());
  }
}
