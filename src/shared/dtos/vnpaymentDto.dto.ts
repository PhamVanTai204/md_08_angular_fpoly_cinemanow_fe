export interface IVNPaymentDto {
    amount: number;
    orderId: string;
    orderInfo: string;
}

export class VNPaymentDto implements IVNPaymentDto {
    amount: number = 0;
    orderId: string = '';
    orderInfo: string = '';

    constructor(data?: IVNPaymentDto) {
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
            this.amount = _data["amount"];
            this.orderId = _data["orderId"];
            this.orderInfo = _data["orderInfo"];
        }
    }

    static fromJS(data: any): VNPaymentDto {
        data = typeof data === 'object' ? data : {};
        let result = new VNPaymentDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["amount"] = this.amount;
        data["orderId"] = this.orderId;
        data["orderInfo"] = this.orderInfo;
        return data;
    }

    clone(): VNPaymentDto {
        return VNPaymentDto.fromJS(this.toJSON());
    }
}
