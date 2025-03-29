export interface IVouchersDto {
  id: string;
  voucherId: string;
  voucherValue: number;
  startDateVoucher: string;
  endDateVoucher: string;
  totalVoucher: number;
  codeVoucher: string;
  statusVoucher: string;
  createdAt?: string;
  updatedAt?: string;
}

export class VouchersDto implements IVouchersDto {
  id!: string;
  voucherId!: string;
  voucherValue!: number;
  startDateVoucher!: string;
  endDateVoucher!: string;
  totalVoucher!: number;
  codeVoucher!: string;
  statusVoucher!: string;
  createdAt?: string;
  updatedAt?: string;

  constructor(data?: IVouchersDto) {
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
      this.id = _data['_id'];
      this.voucherId = _data['voucher_id'];
      this.voucherValue = _data['voucher_value'];
      // Chuyển đổi chuỗi ISO thành yyyy-MM-dd cho input date
      if (_data['start_date_voucher']) {
        this.startDateVoucher = _data['start_date_voucher'].split('T')[0];
      }
      if (_data['end_date_voucher']) {
        this.endDateVoucher = _data['end_date_voucher'].split('T')[0];
      }
      this.totalVoucher = _data['total_voucher'];
      this.codeVoucher = _data['code_voucher'];
      this.statusVoucher = _data['status_voucher'];
      this.createdAt = _data['createdAt'];
      this.updatedAt = _data['updatedAt'];
    }
  }

  static fromJS(data: any): VouchersDto {
    data = typeof data === 'object' ? data : {};
    let result = new VouchersDto();
    result.init(data);
    return result;
  }

  toJSON(data?: any) {
    data = typeof data === 'object' ? data : {};
    data['_id'] = this.id;
    data['voucher_id'] = this.voucherId;
    data['voucher_value'] = this.voucherValue;
    // Nếu backend cần ISO, nối T00:00:00.000Z, nếu không thì chỉ gửi yyyy-MM-dd
    data['start_date_voucher'] = this.startDateVoucher + 'T00:00:00.000Z';
    data['end_date_voucher'] = this.endDateVoucher + 'T00:00:00.000Z';
    data['total_voucher'] = this.totalVoucher;
    data['code_voucher'] = this.codeVoucher;
    data['status_voucher'] = this.statusVoucher;
    data['createdAt'] = this.createdAt;
    data['updatedAt'] = this.updatedAt;
    return data;
  }

  clone(): VouchersDto {
    return VouchersDto.fromJS(this.toJSON());
  }
}
