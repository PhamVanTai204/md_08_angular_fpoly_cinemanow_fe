import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SeatDto } from '../../../shared/dtos/seatDto.dto';
import { SeatService } from '../../../shared/services/seat.service';
import { ActivatedRoute } from '@angular/router';
import { TicketService } from '../../../shared/services/ticket.service';
import { ComboService } from '../../../shared/services/combo.service';
import { TicketDto } from '../../../shared/dtos/ticketDto.dto';
import { ComboDto } from '../../../shared/dtos/ComboDto.dto';

@Component({
  selector: 'app-room',
  standalone: false,
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
  idRoom: string = '';
  seats: SeatDto[] = [];
  groupedSeats: { [key: string]: SeatDto[] } = {}; // Chứa các ghế đã nhóm theo hàng
  combos: ComboDto[] = [];
  isLoading = false;
  errorMessage = '';
  selectedSeats: SeatDto[] = []; // Mảng lưu các ghế đã chọn
  selectedCombos: ComboDto[] = [];  // Mảng lưu các combo đã chọn

  constructor(
    public bsModalRef: BsModalRef,
    private seatService: SeatService,
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private comboService: ComboService,
  ) { }
  addToCart(combo: ComboDto): void {
    // Kiểm tra xem combo đã có trong selectedCombos chưa
    const existingComboIndex = this.selectedCombos.findIndex(existingCombo => existingCombo.combo_id === combo.combo_id);

    if (existingComboIndex !== -1) {
      // Nếu combo đã tồn tại, tăng số lượng của combo đó lên
      this.selectedCombos[existingComboIndex].quantity = (this.selectedCombos[existingComboIndex].quantity ?? 0) + 1;
    } else {
      // Nếu combo chưa có, tạo đối tượng ComboDto mới và thêm vào
      const newCombo = new ComboDto({
        ...combo,
        quantity: 1, // Thiết lập số lượng mặc định là 1
      });
      this.selectedCombos.push(newCombo);
    }

    console.log('Selected Combos:', this.selectedCombos);
  }




  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idRoomParam = params.get('idRoom');
      this.idRoom = idRoomParam || '';

      if (this.idRoom) {
        this.list();
      } else {
        console.error('idRoom is missing');
      }
    });
    this.loadAllCombos();
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  close(): void {
    this.bsModalRef.hide();
  }

  list(): void {
    console.log("Fetching seats for Room ID:", this.idRoom);
    this.seatService.getSeatByRoomId(this.idRoom).subscribe(
      data => {
        this.seats = data;
        console.log('Seats:', this.seats);
        // Nhóm ghế theo hàng
        this.groupedSeats = this.seatService.groupSeatsByRow(this.seats);
        console.log('Grouped Seats:', this.groupedSeats);
      },
      error => console.error('Error fetching seats:', error)
    );
  }

  loadAllCombos(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.comboService.getAllCombos1().subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.combos = response;
          console.log(this.combos, "combo");
        } else {
          console.error('API response is not an array:', response);
          this.combos = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Không thể tải dữ liệu combo. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Error loading combos:', error);
        this.combos = [];
      }
    });
  }

  selectSeat(seat: SeatDto): void {
    const index = this.selectedSeats.indexOf(seat);
    if (index === -1) {
      this.selectedSeats.push(seat); // Thêm ghế vào danh sách
    } else {
      this.selectedSeats.splice(index, 1); // Xóa ghế khỏi danh sách nếu đã chọn
    }
    console.log('Selected Seats:', this.selectedSeats);
  }

  isSelected(seat: SeatDto): boolean {
    return this.selectedSeats.includes(seat);
  }

  createTicket(): void {
    // Kiểm tra xem có ghế và combo đã chọn hay không
    if (this.selectedSeats.length === 0 || this.selectedCombos.length === 0) {
      this.errorMessage = "Bạn chưa chọn ghế hoặc combo.";
      console.error(this.errorMessage);
      return;
    }

    // Tạo đối tượng TicketDto từ dữ liệu
    const ticket = this.createTicketDto();
    console.log(ticket);

    // Gọi dịch vụ để tạo vé
    this.ticketService.createTicket(ticket).subscribe({
      next: (res) => {
        console.log("Ticket created:", res);
        // Sau khi tạo vé thành công, bạn có thể làm gì đó (chuyển hướng, thông báo, v.v...)
      },
      error: (err) => {
        console.error("Failed to create ticket:", err);
        this.errorMessage = "Không thể tạo vé. Vui lòng thử lại sau.";
      }
    });
  }

  // Hàm tạo đối tượng TicketDto
  createTicketDto(): TicketDto {
    return new TicketDto({
      id: "", // Nếu cần, có thể điền giá trị mặc định hoặc gán giá trị sau khi tạo ticket
      user_id: "67ea1c5108d4e0d7db8e5d16", // User ID
      showtime_id: "67ea64f835e3725cd9edd1f1", // Showtime ID
      seats: this.selectedSeats.map(seat => new SeatDto({
        seat_id: seat._id,
        price_seat: seat.price_seat,
        room_id: seat.room_id,
        seat_status: seat.seat_status,
        seat_type: seat.seat_type,
        column_of_seat: seat.column_of_seat,
        row_of_seat: seat.row_of_seat
      })),
      combos: this.selectedCombos.map(combo => new ComboDto({
        combo_id: combo.id,
        user_id: combo.user_id, // Nếu có
        name_combo: combo.name_combo, // Nếu có
        price_combo: combo.price_combo,
        description_combo: combo.description_combo, // Nếu có
        image_combo: combo.image_combo, // Nếu có
        quantity: combo.quantity ?? 1, // Nếu không có, fallback = 1
      })),
      total_amount: this.calculateTotalAmount(),
      status: "pending" // Bạn có thể thay đổi giá trị status nếu cần thiết
    });
  }





  // Hàm tính tổng tiền của vé
  calculateTotalAmount(): number {
    const seatTotal = this.selectedSeats.reduce((sum, seat) => sum + seat.price_seat, 0);
    const comboTotal = this.selectedCombos.reduce((sum, combo) => {
      const quantity = combo.quantity ?? 1; // Sử dụng giá trị mặc định là 1 nếu quantity là undefined
      return sum + (combo.price_combo * quantity);
    }, 0);
    return seatTotal + comboTotal;
  }


}
