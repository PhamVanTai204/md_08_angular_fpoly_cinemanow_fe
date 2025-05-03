export interface IReviewsDto {
  id?: string;
  review_id: string;
  user_id: string;
  userEmail?: string;
  movie_id: string;
  comment?: string;
  date?: string;
}

export class ReviewsDto implements IReviewsDto {
  id?: string;
  review_id!: string;
  user_id!: string;
  userEmail?: string;
  movie_id!: string;
  comment?: string;
  date?: string;

  constructor(data?: IReviewsDto) {
    if (data) Object.assign(this, data);
  }

  init(data?: any): void {
    if (!data) return;
    this.id        = data._id;
    this.review_id = data.review_id;
    if (data.user_id && typeof data.user_id === 'object') {
      this.user_id   = data.user_id._id;
      this.userEmail = data.user_id.email;
    } else {
      this.user_id = data.user_id;
    }
    this.movie_id = (data.movie_id && typeof data.movie_id === 'object')
      ? data.movie_id._id
      : data.movie_id;
    this.comment = data.comment;
    this.date    = data.date
      ? (typeof data.date === 'string'
         ? data.date
         : new Date(data.date).toISOString())
      : '';
  }

  static fromJS(data: any): ReviewsDto {
    const dto = new ReviewsDto();
    dto.init(data);
    return dto;
  }

  toJSON(): any {
    return {
      review_id: this.review_id,
      user_id:   this.user_id,
      movie_id:  this.movie_id,
      comment:   this.comment,
      date:      this.date
    };
  }

  clone(): ReviewsDto {
    return ReviewsDto.fromJS(this.toJSON());
  }
}
