export interface IVNPaymentResponseDto {
    success: boolean;
    paymentUrl: string;
    order: {
        amount: number;
        id: string;
        orderInfo: string;
        returnUrl: string;
    };
}

export class VNPaymentResponseDto implements IVNPaymentResponseDto {
    success: boolean = false;
    paymentUrl: string = '';
    order: {
        amount: number;
        id: string;
        orderInfo: string;
        returnUrl: string;
    } = {
            amount: 0,
            id: '',
            orderInfo: '',
            returnUrl: ''
        };

    constructor(data?: IVNPaymentResponseDto) {
        if (data) {
            this.success = data.success || false;
            this.paymentUrl = data.paymentUrl || '';
            this.order = data.order ? { ...data.order } : {
                amount: 0,
                id: '',
                orderInfo: '',
                returnUrl: ''
            };
        }
    }

    static fromJS(data: any): VNPaymentResponseDto {
        data = typeof data === 'object' ? data : {};
        return new VNPaymentResponseDto(data);
    }

    toJSON(): any {
        return {
            success: this.success,
            paymentUrl: this.paymentUrl,
            order: this.order
        };
    }

    clone(): VNPaymentResponseDto {
        return VNPaymentResponseDto.fromJS(this.toJSON());
    }
}

