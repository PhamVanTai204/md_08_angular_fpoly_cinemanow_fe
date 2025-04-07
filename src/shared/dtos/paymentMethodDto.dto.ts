export interface IPaymentMethodDto {
    id?: string;
    payment_method_id: string;
    method_name: string;
}

export class PaymentMethodDto implements IPaymentMethodDto {
    id: string = '';
    payment_method_id: string = '';
    method_name: string = '';

    constructor(data?: IPaymentMethodDto) {
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
            this.method_name = _data["method_name"] || '';
        }
    }

    static fromJS(data: any): PaymentMethodDto {
        data = typeof data === 'object' ? data : {};
        let result = new PaymentMethodDto();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        if (this.id) {
            data["_id"] = this.id;
        }
        data["payment_method_id"] = this.payment_method_id;
        data["method_name"] = this.method_name;
        return data;
    }

    clone(): PaymentMethodDto {
        return PaymentMethodDto.fromJS(this.toJSON());
    }
}
