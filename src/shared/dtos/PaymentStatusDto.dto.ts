export interface IPaymentStatusDto {
    id?: string;
    payment_method_id: string;
    status_order: string;
}

export class PaymentStatusDto implements IPaymentStatusDto {
    id: string = '';
    payment_method_id: string = '';
    status_order: string = '';

    constructor(data?: IPaymentStatusDto) {
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
            this.id = _data["_id"] || _data["id"] || '';
            this.payment_method_id = _data["payment_method_id"] || '';
            this.status_order = _data["status_order"] || '';
        }
    }

    static fromJS(data: any): PaymentStatusDto {
        data = typeof data === 'object' ? data : {};
        let result = new PaymentStatusDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        if (this.id) {
            data["_id"] = this.id;
        }
        data["payment_method_id"] = this.payment_method_id;
        data["status_order"] = this.status_order;
        return data;
    }

    clone(): PaymentStatusDto {
        return PaymentStatusDto.fromJS(this.toJSON());
    }
}
