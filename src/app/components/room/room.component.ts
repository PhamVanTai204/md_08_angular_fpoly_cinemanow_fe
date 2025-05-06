import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SeatDto } from '../../../shared/dtos/seatDto.dto';
import { SeatService } from '../../../shared/services/seat.service';
import { ActivatedRoute } from '@angular/router';
import { TicketService } from '../../../shared/services/ticket.service';
import { ComboService } from '../../../shared/services/combo.service';
import { TicketDto } from '../../../shared/dtos/ticketDto.dto';
import { ComboDto } from '../../../shared/dtos/ComboDto.dto';
import { VNPaymentDto } from '../../../shared/dtos/vnpaymentDto.dto';
import { VNPaymentResponseDto } from '../../../shared/dtos/VNPaymentResponseDto.dto';
import { VNPaymentService } from '../../../shared/services/vnpayment.service';
import { CreatePaymentResponse, PaymentService } from '../../../shared/services/payment.service';
@Component({
  selector: 'app-room',
  standalone: false,
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
  idRoom: string = '';
  quanLyStatus: string = '0';
  seats: SeatDto[] = [];
  groupedSeats: { [key: string]: SeatDto[] } = {}; // Chứa các ghế đã nhóm theo hàng
  combos: ComboDto[] = [];
  isLoading = false;
  errorMessage = '';
  selectedSeats: SeatDto[] = []; // Mảng lưu các ghế đã chọn
  selectedCombos: ComboDto[] = [];  // Mảng lưu các combo đã chọn
  paymentData: VNPaymentDto = new VNPaymentDto();
  vnPayUrl: string = '';  // Biến để lưu URL VNPay
  amount: number = 0;
  orderId: string = '';
  orderInfo: string = '';
  paymentUrl: string = '';
  showtime_id: string = '';
  showSeatEditDialog = false;
  paymentMethod: string = 'bank';
  seatTypeLabels: { [key: string]: string } = {
    standard: 'Thường',
    vip: 'VIP',
    couple: 'Cặp đôi'
  };

  //biến cho seat
  selectedRowKey: string = '';
  selectedType = 'standard';
  selectedPrice = 40000;

  seatTypes = ['standard', 'vip'];
  // Thêm vào RoomComponent
  showPaymentSuccessDialog = false;
  paymentSuccessData: CreatePaymentResponse | null = null; // Sẽ chứa dữ liệu quan trọng từ payment
  printTicket(): void {
    // Logic để in vé
    window.print(); // Hoặc gọi API in vé nếu có
    this.closePaymentSuccessDialog();
  }
  // Phương thức hiển thị dialog
  openPaymentSuccessDialog(data: CreatePaymentResponse): void {
    this.paymentSuccessData = data;
    this.showPaymentSuccessDialog = true;
  }

  closePaymentSuccessDialog(): void {
    this.showPaymentSuccessDialog = false;
    this.paymentSuccessData = null;
  }
  constructor(
    public bsModalRef: BsModalRef,
    private seatService: SeatService,
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private comboService: ComboService,
    private vnPaymentService: VNPaymentService,
    private paymentService: PaymentService,
  ) { }
  // Thêm vào RoomComponent
  handlePaymentAction(action: 0 | 1): void {
    if (!this.paymentSuccessData) return;

    const actionName = action === 0 ? 'xác nhận' : 'hủy';

    this.paymentService.processPaymentAction(
      this.paymentSuccessData.data._id,
      action
    ).subscribe({
      next: (response) => {
        console.log(`Payment ${actionName} thành công:`, response);
        if (this.paymentSuccessData) {
          this.paymentSuccessData.data.status_order = action === 0 ? 'success' : 'cancelled';
        }
        alert(`${action === 0 ? 'Xác nhận' : 'Hủy'} thanh toán thành công`);
        this.closePaymentSuccessDialog();
        this.ngOnInit();
      },
      error: (err) => {
        console.error(`Error ${actionName} payment:`, err);
        alert(`Có lỗi xảy ra khi ${actionName} thanh toán`);
      }
    });
  }
  // Tăng số lượng combo
  increaseComboQuantity(combo: ComboDto): void {
    const index = this.selectedCombos.findIndex(c => c.combo_id === combo.combo_id);
    if (index !== -1) {
      this.selectedCombos[index].quantity = (this.selectedCombos[index].quantity ?? 0) + 1;
    }
  }

  // Giảm số lượng combo
  decreaseComboQuantity(combo: ComboDto): void {
    const index = this.selectedCombos.findIndex(c => c.combo_id === combo.combo_id);
    if (index !== -1) {
      const currentQuantity = this.selectedCombos[index].quantity ?? 0;
      if (currentQuantity > 1) {
        this.selectedCombos[index].quantity = currentQuantity - 1;
      } else {
        this.selectedCombos.splice(index, 1);
      }
    }
  }

  // Xóa combo khỏi danh sách
  removeCombo(combo: ComboDto): void {
    const index = this.selectedCombos.findIndex(c => c.combo_id === combo.combo_id);
    if (index !== -1) {
      this.selectedCombos.splice(index, 1);
    }
  }
  getSeatColor(seat: SeatDto): string {
    if (seat.seat_status === 'booked') {
      return '#ef4444'; // Màu đỏ cho ghế đã bán
    }
    if (this.isSelected(seat)) {
      return '#00F5FF'; // Màu xanh dương cho ghế đã chọn
    }

    switch (seat.seat_type) {
      case 'vip': return '#FFE066'; // Màu vàng cam cho VIP
      case 'couple': return '#00F5FF'; // Màu hồng cho ghế cặp đôi
      default: return '#D1D1D1'; // Màu xám cho ghế thường (standard)
    }
  }
  openSeatEditDialog(rowKey: string) {
    this.selectedRowKey = rowKey;
    this.showSeatEditDialog = true;
  }
  // Thêm vào RoomComponent để lấy tên combo từ combo_id
  getComboName(comboId: string): string {
    const combo = this.combos.find(c => c.combo_id === comboId);
    return combo ? combo.name_combo : 'Combo không xác định';
  }
  closeSeatEditDialog() {
    this.showSeatEditDialog = false;
  }

  saveSeatEdit() {
    const rowSeats = this.groupedSeats[this.selectedRowKey];
    const ids = rowSeats.map(seat => seat._id);

    this.seatService.updateMultipleSeats(ids, this.selectedType, this.selectedPrice).subscribe({
      next: res => {
        console.log('Cập nhật thành công:', res);
        this.list();
        this.closeSeatEditDialog();
      },
      error: err => {
        console.error('Lỗi cập nhật:', err);
      }
    });
  }

  selectAllSeatsInRow(rowKey: string): void {
    const rowSeats = this.groupedSeats[rowKey];

    // Tạo biến ids chứa danh sách _id của ghế trong hàng
    const ids = rowSeats.map(seat => seat._id);


    console.log('Danh sách _ids:', ids);
    this.seatService.updateMultipleSeats(
      ids,
      "standard",
      40000
    ).subscribe({
      next: res => {
        console.log('Cập nhật thành công:', res);
      },
      error: err => {
        console.error('Lỗi cập nhật:', err);
      }
    });

  }



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

  updateSeat(seatId: string) {
    const seatStatus = "booked"; // Trạng thái ghế muốn cập nhật

    this.seatService.updateSeatStatus(seatId, seatStatus).subscribe(
      response => {
        console.log('Cập nhật ghế thành công', response);
      },
      error => {
        console.error('Lỗi khi cập nhật ghế', error);
      }
    );
  }


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idRoomParam = params.get('idRoom');

      const showtimeId = params.get('showtimeId');
      this.idRoom = idRoomParam || '';
      this.showtime_id = showtimeId ?? '';
      this.quanLyStatus = params.get('quanLyStatus') ?? '0';

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

  // Thêm vào class RoomComponent

  // Cập nhật hàm createTicket()
  async createTicket(): Promise<void> {
    // Kiểm tra xem có ghế hoặc combo đã chọn hay không
    if (this.selectedSeats.length === 0 && this.selectedCombos.length === 0) {
      alert("Bạn chưa chọn ghế hoặc combo");

      return;
    }

    try {
      // Tạo đối tượng TicketDto từ dữ liệu
      const ticket = this.createTicketDto();
      console.log(ticket);

      // Gọi dịch vụ để tạo vé
      const ticketResponse = await this.ticketService.createTicket(ticket).toPromise();

      if (!ticketResponse) {
        throw new Error('Không nhận được phản hồi từ server');
      }

      // Xử lý theo phương thức thanh toán
      if (this.paymentMethod === 'bank') {
        // Thanh toán ngân hàng
        const paymentResponse = await this.vnPaymentService.createVNPayUrl(ticketResponse.id, ticketResponse.total_amount).toPromise();

        if (paymentResponse && paymentResponse.success) {
          this.paymentUrl = paymentResponse.paymentUrl || '';
          console.log(this.paymentUrl);
          window.open(this.paymentUrl, '_blank');
        } else {
          alert("Có lỗi xảy ra trong quá trình tạo liên kết thanh toán.");

        }
      } else {
        // Thanh toán tiền mặt
        const paymentResponse = await this.paymentService.createPayment(ticketResponse.id).toPromise();

        if (paymentResponse) {
          // Xử lý thành công thanh toán tiền mặt
          console.log("Thanh toán tiền mặt thành công:", paymentResponse);
          // Hiển thị dialog với dữ liệu quan trọng
          this.openPaymentSuccessDialog(paymentResponse);

          // Thêm thông báo thành công
          this.errorMessage = "Tạo vé thành công";

        }
      }

      // Reset các lựa chọn sau khi tạo vé thành công
      this.selectedSeats = [];
      this.selectedCombos = [];

    } catch (err: unknown) {
      console.error("Failed to create ticket:", err);
      if (err instanceof Error) {
        this.errorMessage = err.message || "Không thể tạo vé. Vui lòng thử lại sau.";
      } else {
        this.errorMessage = "Không thể tạo vé. Vui lòng thử lại sau.";
      }
    }
  }

  // Hàm tạo đối tượng TicketDto
  createTicketDto(): TicketDto {
    return new TicketDto({
      id: "", // Nếu cần, có thể điền giá trị mặc định hoặc gán giá trị sau khi tạo ticket
      user_id: "67ea1c5108d4e0d7db8e5d16", // User ID
      ticket_id: '',
      showtime_id: this.showtime_id, // Showtime ID
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
      const quantity = combo.quantity ?? 1;
      return sum + (combo.price_combo * quantity);
    }, 0);
    return seatTotal + comboTotal;
  }


}
