export interface IVNPaymentDto {
    ticket_id: string;
    amount: number;
}

export class VNPaymentDto implements IVNPaymentDto {
    ticket_id: string = '';
    amount: number = 0;

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
            this.ticket_id = _data["ticket_id"];
            this.amount = _data["amount"];
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
        data["ticket_id"] = this.ticket_id;
        data["amount"] = this.amount;
        return data;
    }

    clone(): VNPaymentDto {
        return VNPaymentDto.fromJS(this.toJSON());
    }
}
