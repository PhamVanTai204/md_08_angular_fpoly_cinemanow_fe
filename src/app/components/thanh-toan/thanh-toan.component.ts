// thanh-toan.component.ts - Enhanced with detail dialog
import { Component, OnInit } from "@angular/core";
import { PaymentService, PaymentDto } from "../../../shared/services/payment.service";

@Component({
  selector: 'app-thanh-toan',
  templateUrl: './thanh-toan.component.html',
  styleUrls: ['./thanh-toan.component.css'],
  standalone: false
})
export class ThanhToanComponent implements OnInit {
  searchTerm: string = '';
  thanhToanList: PaymentDto[] = [];

  // Pagination
  totalRecords: number = 0;
  currentPage: number = 0;
  rows: number = 10;
  totalPages: number = 1;
  currentUser: any;

  // Dialog state
  isDetailDialogOpen: boolean = false;
  selectedPayment: PaymentDto | null = null;
  isLoadingDetail: boolean = false;

  constructor(private paymentService: PaymentService) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    console.log(this.currentUser.cinema_id);
    this.loadThanhToanData(this.currentUser.cinema_id);
  }

  // ========== DIALOG METHODS ==========

  /**
   * Open payment detail dialog
   */
  openDetailDialog(payment: PaymentDto): void {
    this.selectedPayment = payment;
    this.isDetailDialogOpen = true;
    console.log('Selected payment for detail:', payment);
  }

  /**
   * Close payment detail dialog
   */
  closeDetailDialog(): void {
    this.isDetailDialogOpen = false;
    this.selectedPayment = null;
  }

  /**
   * Check if payment is completed and can print tickets
   */
  canPrintTickets(payment: PaymentDto): boolean {
    return payment && payment.status_order === 'completed';
  }

  /**
   * Get total items count (seats + combos)
   */
  getTotalItems(payment: PaymentDto): number {
    if (!payment || !payment.ticket) return 0;
    const seatsCount = payment.ticket.seats?.length || 0;
    const combosCount = payment.ticket.combos?.length || 0;
    return seatsCount + combosCount;
  }

  /**
   * Get payment method text
   */
  getPaymentMethodText(method: number): string {
    switch (method) {
      case 0:
        return 'Tiền mặt';
      case 1:
        return 'Chuyển khoản (VNPay)';
      case 2:
        return 'Momo';
      default:
        return 'Không xác định';
    }
  }

  /**
  * Get payment method icon for display
  */
  getPaymentMethodIcon(method: number): string {
    switch (method) {
      case 0:
        return 'fas fa-money-bill-wave'; // Tiền mặt
      case 1:
        return 'fas fa-credit-card'; // VNPay
      case 2:
        return 'fas fa-mobile-alt'; // Momo
      default:
        return 'fas fa-question-circle';
    }
  }

  /**
  * Get payment method color class
  */
  getPaymentMethodColorClass(method: number): string {
    switch (method) {
      case 0:
        return 'text-green-600'; // Tiền mặt - xanh lá
      case 1:
        return 'text-blue-600'; // VNPay - xanh dương
      case 2:
        return 'text-pink-600'; // Momo - hồng
      default:
        return 'text-gray-600';
    }
  }

  /**
  * Format VNPay response code to Vietnamese text
  */
  getVNPayResponseText(responseCode: string): string {
    switch (responseCode) {
      case '00':
        return 'Giao dịch thành công';
      case '07':
        return 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)';
      case '09':
        return 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng';
      case '10':
        return 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần';
      case '11':
        return 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán';
      case '12':
        return 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa';
      case '13':
        return 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)';
      case '24':
        return 'Giao dịch không thành công do: Khách hàng hủy giao dịch';
      case '51':
        return 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư thực hiện giao dịch';
      case '65':
        return 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày';
      case '75':
        return 'Ngân hàng thanh toán đang bảo trì';
      case '79':
        return 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định';
      case '99':
        return 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)';
      default:
        return responseCode ? `Mã lỗi: ${responseCode}` : 'Không có thông tin';
    }
  }

  /**
   * Get bank name from VNPay bank code
   */
  getBankName(bankCode: string): string {
    const bankNames: { [key: string]: string } = {
      'NCB': 'Ngân hàng NCB',
      'AGRIBANK': 'Ngân hàng Agribank',
      'SCB': 'Ngân hàng SCB',
      'SACOMBANK': 'Ngân hàng SacomBank',
      'EXIMBANK': 'Ngân hàng EximBank',
      'MSBANK': 'Ngân hàng MS Bank',
      'NAMABANK': 'Ngân hàng NamA Bank',
      'VNMART': 'Ví VnMart',
      'VIETINBANK': 'Ngân hàng Vietinbank',
      'VIETCOMBANK': 'Ngân hàng VCB',
      'HDBANK': 'Ngân hàng HDBank',
      'DONGABANK': 'Ngân hàng Dong A',
      'TPBANK': 'Ngân hàng TPBank',
      'OJB': 'Ngân hàng OceanBank',
      'BIDV': 'Ngân hàng BIDV',
      'TECHCOMBANK': 'Ngân hàng Techcombank',
      'VPBANK': 'Ngân hàng VPBank',
      'MBBANK': 'Ngân hàng MBBank',
      'ACB': 'Ngân hàng ACB',
      'OCB': 'Ngân hàng OCB',
      'IVB': 'Ngân hàng IVB',
      'VISA': 'Thanh toán qua VISA/MASTER'
    };
    return bankNames[bankCode] || bankCode || 'Không xác định';
  }
  
  /**
   * Get total combo quantity
   */
  getTotalComboQuantity(combos: any[]): number {
    if (!combos || combos.length === 0) return 0;
    return combos.reduce((total, combo) => total + (combo.quantity || 0), 0);
  }

  /**
   * Calculate total combo price
   */
  getTotalComboPrice(combos: any[]): number {
    if (!combos || combos.length === 0) return 0;
    return combos.reduce((total, combo) => total + (combo.price || 0), 0);
  }

  /**
   * Calculate total seat price
   */
  getTotalSeatPrice(seats: any[]): number {
    if (!seats || seats.length === 0) return 0;
    return seats.reduce((total, seat) => total + (seat.price || 0), 0);
  }

  /**
   * Get seat list as string
   */
  getSeatListString(seats: any[]): string {
    if (!seats || seats.length === 0) return 'Không có';
    return seats.map(seat =>
      `${seat.seatDetails?.row_of_seat}${seat.seatDetails?.column_of_seat}`
    ).join(', ');
  }

  /**
   * Get combo list as string
   */
  getComboListString(combos: any[]): string {
    if (!combos || combos.length === 0) return 'Không có';
    return combos.map(combo =>
      `${combo.comboDetails?.name_combo} (x${combo.quantity})`
    ).join(', ');
  }

  /**
   * Print tickets from dialog
   */
  printTicketsFromDialog(): void {
    if (this.selectedPayment && this.canPrintTickets(this.selectedPayment)) {
      this.printAllInOneWindow(this.selectedPayment);
      this.closeDetailDialog();
    }
  }

  /**
   * Get status badge class for dialog
   */
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // ========== EXISTING METHODS ==========

  // Alternative: In tất cả trong một cửa sổ
  printAllInOneWindow(payment: PaymentDto): void {
    if (!payment.ticket) return;

    let allContent = '';

    // Thêm vé ghế
    if (payment.ticket.seats?.length) {
      payment.ticket.seats.forEach(seat => {
        allContent += this.generateSeatTicket(payment, seat);
        allContent += '<div style="page-break-after: always;"></div>'; // Ngắt trang
      });
    }

    // Thêm vé combo
    if (payment.ticket.combos?.length) {
      payment.ticket.combos.forEach(combo => {
        allContent += this.generateComboTicket(payment, combo);
        allContent += '<div style="page-break-after: always;"></div>'; // Ngắt trang
      });
    }

    // Thêm vé cơ bản nếu cần
    if (allContent === '') {
      allContent = this.generateBasicTicket(payment);
    }

    this.openPrintWindow(allContent, 'all_tickets');
  }

  private openPrintWindow(content: string, windowName: string): void {
    const printWindow = window.open('', windowName);
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        // Không đóng cửa sổ ngay để người dùng có thể xem trước khi in
        // printWindow.close();
      }, 500);
    }
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return 'N/A'; // Xử lý cả null và undefined
    return new Date(dateStr).toLocaleDateString('vi-VN');
  }

  formatDateTime(dateStr: string | null | undefined): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('vi-VN');
  }

  private generateSeatTicket(payment: PaymentDto, seat: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vé xem phim</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 20px;
            background-color: #f5f5f5;
          }
          .ticket { 
            border: 2px solid #000; 
            padding: 25px; 
            max-width: 350px; 
            margin: 0 auto;
            background-color: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .header { 
            text-align: center; 
            font-weight: bold; 
            margin-bottom: 15px;
            font-size: 1.2em;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .p1 { 
            text-align: center;  
            margin-bottom: 15px;
            font-size: 0.9em;
            color: #333;
          }
          .info { 
            margin: 12px 0;
            font-size: 0.95em;
            line-height: 1.4;
          }
          .divider { 
            border-top: 1px solid #000; 
            margin: 15px 0;
          }
          .highlight {
            background-color: #f8f8f8;
            padding: 8px 12px;
            border-radius: 4px;
            font-weight: bold;
            display: inline-block;
            margin: 5px 0;
          }
          .price {
            font-size: 1.2em;
            font-weight: bold;
            color: #000;
          }
          .seat-info {
            font-size: 1.3em;
            font-weight: bold;
            color: #000;
            text-align: center;
            margin: 15px 0;
            padding: 10px;
            border: 2px solid #000;
            border-radius: 4px;
          }
          .room-info {
            font-size: 1.1em;
            font-weight: bold;
            color: #000;
            margin: 10px 0;
          }
          .barcode-container {
            text-align: center;
            margin: 20px 0;
          }
          .barcode {
            max-width: 100%;
            height: 60px;
          }
          .ticket-id {
            font-size: 0.8em;
            color: #666;
            text-align: center;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            ${payment.ticket?.showtime?.room?.cinema?.cinema_name || 'RẠP CHIẾU PHIM'}
          </div>          
          <p class="p1">${payment.ticket?.showtime?.room?.cinema?.location || 'Địa chỉ Rạp'}</p> 
          
          <div class="header">
            <h4>VÉ XEM PHIM</h4>
          </div>
          
          <div class="info"><strong>Phim:</strong> ${payment.ticket.showtime.movie.title}</div>
          <div class="room-info">Phòng: ${payment.ticket?.showtime?.room?.room_name || ''} - ${payment.ticket?.showtime?.room?.room_style || ''}</div>
          <div class="info"><strong>Suất chiếu:</strong> ${payment.ticket?.showtime?.start_time || ''} - ${this.formatDate(payment.ticket?.showtime?.show_date)}</div>
          
          <div class="divider"></div>
          
          <div class="barcode-container">
            <svg class="barcode" id="barcode-${payment.ticket?.ticket_id}"></svg>
            <div class="ticket-id">${payment.ticket?.ticket_id || ''}</div>
          </div>
          
          <div class="seat-info">Ghế: ${seat.seatDetails?.row_of_seat}${seat.seatDetails?.column_of_seat}</div>
          <div class="price">Giá vé: ${seat.price?.toLocaleString('vi-VN') || '0'} VND</div>
          
          <div class="divider"></div>
          
          <div class="info"><strong>Khách hàng:</strong> ${payment.ticket?.user?.full_name || ''}</div>
          <div class="info"><strong>SĐT:</strong> 0${payment.ticket?.user?.phone_number || ''}</div>
          <div class="info"><strong>Email:</strong> ${payment.ticket?.user?.email || ''}</div>
          
          <div class="divider"></div>
          
          <div class="info"><strong>Ngày đặt:</strong> ${this.formatDate(payment.vnp_PayDate)}</div>
          <div class="info"><strong>Trạng thái:</strong> ${this.getStatusText(payment.status_order)}</div>
          
          <div class="divider"></div>
          
          <div class="header">
            Xin chân thành cảm ơn quý khách
          </div> 
        </div>
        <script>
          JsBarcode("#barcode-${payment.ticket?.ticket_id}", "${payment.ticket?.ticket_id}", {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: false
          });
        </script>
      </body>
      </html>
    `;
  }

  private generateComboTicket(payment: PaymentDto, combo: any): string {
    const comboName = combo.comboDetails?.name_combo || 'Combo';
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vé combo</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 20px;
            background-color: #f5f5f5;
          }
          .ticket { 
            border: 2px solid #000; 
            padding: 25px; 
            max-width: 350px; 
            margin: 0 auto;
            background-color: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .header { 
            text-align: center; 
            font-weight: bold; 
            margin-bottom: 15px;
            font-size: 1.2em;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .p1 { 
            text-align: center;  
            margin-bottom: 15px;
            font-size: 0.9em;
            color: #333;
          }
          .info { 
            margin: 12px 0;
            font-size: 0.95em;
            line-height: 1.4;
          }
          .divider { 
            border-top: 1px solid #000; 
            margin: 15px 0;
          }
          .highlight {
            background-color: #f8f8f8;
            padding: 8px 12px;
            border-radius: 4px;
            font-weight: bold;
            display: inline-block;
            margin: 5px 0;
          }
          .price {
            font-size: 1.2em;
            font-weight: bold;
            color: #000;
          }
          .combo-info {
            font-size: 1.3em;
            font-weight: bold;
            color: #000;
            text-align: center;
            margin: 15px 0;
            padding: 10px;
            border: 2px solid #000;
            border-radius: 4px;
          }
          .barcode-container {
            text-align: center;
            margin: 20px 0;
          }
          .barcode {
            max-width: 100%;
            height: 60px;
          }
          .ticket-id {
            font-size: 0.8em;
            color: #666;
            text-align: center;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            ${payment.ticket?.showtime?.room?.cinema?.cinema_name || 'RẠP CHIẾU PHIM'}
          </div>          
          <p class="p1">${payment.ticket?.showtime?.room?.cinema?.location || 'Địa chỉ Rạp'}</p>
          
          <div class="header">
            <h4>HÓA ĐƠN BÁN HÀNG</h4>
          </div>
          
          <div class="combo-info">
            ${comboName}
          </div>
          <div class="info"><strong>Số lượng:</strong> ${combo.quantity || 1}</div>
          <div class="price">Giá: ${combo.price?.toLocaleString('vi-VN') || '0'} VND</div>
          
          <div class="barcode-container">
            <svg class="barcode" id="barcode-${payment.ticket?.ticket_id}"></svg>
            <div class="ticket-id">${payment.ticket?.ticket_id || ''}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="info"><strong>Khách hàng:</strong> ${payment.ticket?.user?.full_name || ''}</div>
          <div class="info"><strong>SĐT:</strong> 0${payment.ticket?.user?.phone_number || ''}</div>
          <div class="info"><strong>Email:</strong> ${payment.ticket?.user?.email || ''}</div>
          
          <div class="divider"></div>
          
          <div class="info"><strong>Ngày đặt:</strong> ${this.formatDate(payment.vnp_PayDate)}</div>
          <div class="info"><strong>Trạng thái:</strong> ${this.getStatusText(payment.status_order)}</div>
          
          <div class="divider"></div>
          
          <div class="header">
            Xin chân thành cảm ơn quý khách
          </div>
        </div>
        <script>
          JsBarcode("#barcode-${payment.ticket?.ticket_id}", "${payment.ticket?.ticket_id}", {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: false
          });
        </script>
      </body>
      </html>
    `;
  }

  private generateBasicTicket(payment: PaymentDto): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vé xem phim</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 20px;
            background-color: #f5f5f5;
          }
          .ticket { 
            border: 2px solid #000; 
            padding: 25px; 
            max-width: 350px; 
            margin: 0 auto;
            background-color: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .header { 
            text-align: center; 
            font-weight: bold; 
            margin-bottom: 15px;
            font-size: 1.2em;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .p1 { 
            text-align: center;  
            margin-bottom: 15px;
            font-size: 0.9em;
            color: #333;
          }
          .info { 
            margin: 12px 0;
            font-size: 0.95em;
            line-height: 1.4;
          }
          .divider { 
            border-top: 1px solid #000; 
            margin: 15px 0;
          }
          .highlight {
            background-color: #f8f8f8;
            padding: 8px 12px;
            border-radius: 4px;
            font-weight: bold;
            display: inline-block;
            margin: 5px 0;
          }
          .price {
            font-size: 1.2em;
            font-weight: bold;
            color: #000;
            text-align: center;
            margin: 15px 0;
            padding: 10px;
            border: 2px solid #000;
            border-radius: 4px;
          }
          .barcode-container {
            text-align: center;
            margin: 20px 0;
          }
          .barcode {
            max-width: 100%;
            height: 60px;
          }
          .ticket-id {
            font-size: 0.8em;
            color: #666;
            text-align: center;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            ${payment.ticket?.showtime?.room?.cinema?.cinema_name || 'RẠP CHIẾU PHIM'}
          </div>          
          <p class="p1">${payment.ticket?.showtime?.room?.cinema?.location || 'Địa chỉ Rạp'}</p>
          
          <div class="header">
            <h4>VÉ XEM PHIM</h4>
          </div>
          
          <div class="barcode-container">
            <svg class="barcode" id="barcode-${payment.ticket?.ticket_id}"></svg>
            <div class="ticket-id">${payment.ticket?.ticket_id || ''}</div>
          </div>
          
          <div class="price">Tổng tiền: ${payment.ticket?.total_amount?.toLocaleString('vi-VN') || '0'} VND</div>
          
          <div class="divider"></div>
          
          <div class="info"><strong>Khách hàng:</strong> ${payment.ticket?.user?.full_name || ''}</div>
          <div class="info"><strong>SĐT:</strong> 0${payment.ticket?.user?.phone_number || ''}</div>
          <div class="info"><strong>Email:</strong> ${payment.ticket?.user?.email || ''}</div>
          
          <div class="divider"></div>
          
          <div class="info"><strong>Ngày đặt:</strong> ${this.formatDate(payment.vnp_PayDate)}</div>
          <div class="info"><strong>Trạng thái:</strong> ${this.getStatusText(payment.status_order)}</div>
          
          <div class="divider"></div>
          
          <div class="header">
            Xin chân thành cảm ơn quý khách
          </div>
        </div>
        <script>
          JsBarcode("#barcode-${payment.ticket?.ticket_id}", "${payment.ticket?.ticket_id}", {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: false
          });
        </script>
      </body>
      </html>
    `;
  }

  // ========== PAGINATION METHODS ==========

  getPageNumbers(): number[] {
    const current = this.currentPage + 1;
    const range = 2;
    const start = Math.max(1, current - range);
    const end = Math.min(this.totalPages, current + range);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(pageNumber: number): void {
    this.currentPage = pageNumber - 1;
    this.loadThanhToanData(this.currentUser.cinema_id);
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadThanhToanData(this.currentUser.cinema_id);
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadThanhToanData(this.currentUser.cinema_id);
    }
  }

  onRowsPerPageChange(): void {
    this.currentPage = 0;
    this.loadThanhToanData(this.currentUser.cinema_id);
  }

  isLastPage(): boolean {
    return this.currentPage >= this.totalPages - 1;
  }

  loadThanhToanData(cinema_id: string): void {
    const page = this.currentPage + 1;
    this.paymentService.getAllPayments(page, this.rows, this.searchTerm, cinema_id).subscribe({
      next: (data) => {
        this.thanhToanList = data.payments;
        this.totalRecords = data.totalPayments;
        this.totalPages = data.totalPages;
        console.log(this.thanhToanList);
      },
      error: (err) => {
        console.error('Lỗi tải dữ liệu thanh toán:', err);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadThanhToanData(this.currentUser.cinema_id);
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.rows = event.rows;
    this.loadThanhToanData(this.currentUser.cinema_id);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'pending':
        return 'Đang chờ';
      case 'failed':
        return 'Thất bại';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  traCuuGD(): void {
    alert('Đang chuyển đến trang tra cứu giao dịch chi tiết');
  }
}