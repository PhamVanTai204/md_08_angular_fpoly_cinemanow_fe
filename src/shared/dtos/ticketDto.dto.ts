import { ShowtimesDto } from "./showtimesDto.dto";
import { SeatDto } from "./seatDto.dto";
import { ComboDto } from "./ComboDto.dto";



export interface ITicketDto {
    id: string;
    user_id: string;
    showtime_id: string;
    ticket_id: string;
    seats: SeatDto[];
    combos: ComboDto[];
    voucher_id?: string | null;
    total_amount: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    createdAt?: string;
    updatedAt?: string;
}

export class TicketDto implements ITicketDto {
    id!: string;
    user_id!: string;
    showtime_id!: string;
    ticket_id: string = '';
    seats: SeatDto[] = [];
    combos: ComboDto[] = [];
    voucher_id?: string | null;
    total_amount!: number;
    status!: 'pending' | 'confirmed' | 'cancelled';
    createdAt?: string;
    updatedAt?: string;

    constructor(data?: ITicketDto) {
        if (data) Object.assign(this, data);
    }

    init(_data?: any) {
        if (_data) {
            this.id = _data["_id"];
            this.ticket_id = _data["ticket_id"];
            this.user_id = _data["user_id"];
            this.showtime_id = _data["showtime_id"];
            this.voucher_id = _data["voucher_id"] ?? null;
            this.total_amount = _data["total_amount"];
            this.status = _data["status"];
            this.createdAt = _data["createdAt"];
            this.updatedAt = _data["updatedAt"];

            if (Array.isArray(_data["seats"])) {
                this.seats = _data["seats"].map((s: any) => SeatDto.fromJS(s));
            }

            if (Array.isArray(_data["combos"])) {
                this.combos = _data["combos"].map((c: any) => ComboDto.fromJS(c));
            }
        }
    }

    static fromJS(data: any): TicketDto {
        const result = new TicketDto();
        result.init(data);
        return result;
    }

    toJSON() {
        return {
            _id: this.id,
            user_id: this.user_id,
            ticket_id: this.ticket_id,
            showtime_id: this.showtime_id,
            seats: this.seats.map(s => s.toJSON()),
            combos: this.combos.map(c => c.toJSON()),
            voucher_id: this.voucher_id,
            total_amount: this.total_amount,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    clone(): TicketDto {
        return TicketDto.fromJS(this.toJSON());
    }
}
