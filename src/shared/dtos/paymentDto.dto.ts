// payment.dto.ts

// Movie DTO
export class MovieDto {
    _id!: string;
    status_film!: number;
    genre_film!: string[];
    trailer_film!: string;
    duration!: string;
    release_date!: string;
    end_date!: string;
    image_film!: string;
    title!: string;
    describe!: string;
    cast!: string;
    ratings!: number;
    box_office!: number;
    director!: string;
    age_limit!: number;
    language!: string;
    __v!: number;
}

// Room DTO
export class RoomDto {
    _id!: string;
    cinema_id!: string;
    room_name!: string;
    room_style!: string;
    total_seat!: number;
    status!: string;
    createdAt!: string;
    updatedAt!: string;
    __v!: number;
}

// Showtime DTO
export class ShowtimeDto {
    _id!: string;
    showtime_id!: string;
    movie_id!: MovieDto;
    room_id!: RoomDto;
    cinema_id!: string;
    start_time!: string;
    end_time!: string;
    show_date!: string;
    createdAt!: string;
    updatedAt!: string;
    __v!: number;
}

// User DTO
export class UserDto {
    _id!: string;
    user_name!: string;
    email!: string;
    password!: string;
    url_image!: string;
    role!: number;
    createdAt!: string;
    updatedAt!: string;
    __v!: number;
    date_of_birth!: string;
    full_name!: string;
    gender!: number;
    phone_number!: number;
}

// Seat in Ticket DTO
export class SeatInTicketDto {
    seat_id!: string;
    price!: number;
    _id!: string;
}

// Combo in Ticket DTO
export class ComboInTicketDto {
    combo_id!: string;
    quantity!: number;
    price!: number;
    _id!: string;
}

// Ticket DTO
export class TicketDto {
    _id!: string;
    ticket_id!: string;
    user_id!: UserDto;
    showtime_id!: ShowtimeDto;
    seats!: SeatInTicketDto[];
    combos!: ComboInTicketDto[];
    voucher_id!: string | null;
    total_amount!: number;
    status!: string;
    createdAt!: string;
    updatedAt!: string;
    __v!: number;
}

// Payment Method DTO
export class PaymentMethodDto {
    _id!: string;
    payment_method_id!: string;
    method_name!: string;
    createdAt!: string;
    updatedAt!: string;
    __v!: number;
}

// Payment Status DTO
export class PaymentStatusDto {
    _id!: string;
    name!: string;
}

// Main Payment DTO
export class PaymentDto {
    _id!: string;
    payment_id!: string;
    ticket_id!: TicketDto;
    payment_method_id!: PaymentMethodDto | null;
    payment_status_id!: PaymentStatusDto | null;
    payment_time!: string;
    status_order!: string;
    createdAt!: string;
    updatedAt!: string;
    __v?: number;
}

// API Response DTO
export class PaymentApiResponseDto {
    code!: number;
    error!: string | null;
    data!: PaymentDto[];
}