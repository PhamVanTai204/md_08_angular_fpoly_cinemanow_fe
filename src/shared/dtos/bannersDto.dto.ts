export interface IBannersDto {
  id: string;
  imageUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BannersDto implements IBannersDto {
  id!: string;
  imageUrl!: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data?: IBannersDto) {
    if (data) {
      Object.assign(this, data);
    }
  }

  init(data?: any) {
    if (data) {
      console.log('Banner data raw:', data);
      this.id = data['_id'] || '';
      this.imageUrl = data['image_url'] || '';
      this.createdAt = data['createdAt'] ? new Date(data['createdAt']) : undefined;
      this.updatedAt = data['updatedAt'] ? new Date(data['updatedAt']) : undefined;
    }
  }

  static fromJS(data: any): BannersDto {
    const result = new BannersDto();
    result.init(data);
    return result;
  }

  toJSON() {
    return {
      _id: this.id,
      image_url: this.imageUrl,
      createdAt: this.createdAt ? this.createdAt.toISOString() : undefined,
      updatedAt: this.updatedAt ? this.updatedAt.toISOString() : undefined,
    };
  }
}
