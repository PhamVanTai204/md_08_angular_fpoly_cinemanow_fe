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

  constructor(private paymentService: PaymentService) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    console.log(this.currentUser.cinema_id);
    this.loadThanhToanData(this.currentUser.cinema_id);
  }



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
  private generateSeatTicket(payment: PaymentDto, seat: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vé xem phim</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .ticket { border: 2px dashed #000; padding: 15px; max-width: 300px; margin: 0 auto; }
          .header { text-align: center; font-weight: bold; margin-bottom: 3px; }
                              .p1 { text-align: center;  margin-bottom: 3px; }

          .info { margin: 5px 0; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="ticket">
   <div class="header">
           ${payment.ticket?.showtime?.room?.cinema?.cinema_name || 'RẠP CHIẾU PHIM'}
       </div>          
                 <p class="p1" > ${payment.ticket?.showtime?.room?.cinema?.location || 'Địa chỉ Rạp'} </p> 
 
                <div class="header"> 
                <h4> VÉ XEM PHIM </h4>
                </div>
          
          <div class="info"><strong>Phim:</strong> ${payment.ticket.showtime.movie.title}</div>
          <div class="info"><strong>Phòng:</strong> ${payment.ticket?.showtime?.room?.room_name || ''} - ${payment.ticket?.showtime?.room?.room_style || ''}</div>
          <div class="info"><strong>Suất chiếu:</strong> ${payment.ticket?.showtime?.start_time || ''} - ${this.formatDate(payment.ticket?.showtime?.show_date)}</div>
          
          <div class="divider"></div>
          
          <div class="info"><strong>Mã vé:</strong> ${payment.ticket?.ticket_id || ''}</div>
          <div class="info"><strong>Ghế:</strong> ${seat.seatDetails?.row_of_seat}${seat.seatDetails?.column_of_seat}</div>
          <div class="info"><strong>Giá vé:</strong> ${seat.price?.toLocaleString('vi-VN') || '0'} VND</div>
          
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
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .ticket { border: 2px dashed #000; padding: 15px; max-width: 300px; margin: 0 auto; }
                              .p1 { text-align: center;  margin-bottom: 3px; }

          .header { text-align: center; font-weight: bold; margin-bottom: 3px; }
          .info { margin: 5px 0; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="ticket">
             <div class="header">
           ${payment.ticket?.showtime?.room?.cinema?.cinema_name || 'RẠP CHIẾU PHIM'} 
       </div>          
                 <p class="p1" > ${payment.ticket?.showtime?.room?.cinema?.location || 'Địa chỉ Rạp'} </p> 

          <div class="header">                <h4> Hóa đơn bán hàng </h4>
</div>
          
           <div class="info"><strong>Tên mặt hàng:</strong>  ${comboName}</div>
          <div class="info"><strong>Số lượng:</strong> ${combo.quantity || 1}</div>
          <div class="info"><strong>Giá:</strong> ${combo.price?.toLocaleString('vi-VN') || '0'} VND</div>
          
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
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .ticket { border: 2px dashed #000; padding: 15px; max-width: 300px; margin: 0 auto; }
          .header { text-align: center; font-weight: bold; margin-bottom: 3px; }
                    .p1 { text-align: center;  margin-bottom: 3px; }

          .info { margin: 5px 0; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="ticket">
       <div class="header">
           ${payment.ticket?.showtime?.room?.cinema?.cinema_name || 'RẠP CHIẾU PHIM'} 
       </div>          
                 <p class="p1" > ${payment.ticket?.showtime?.room?.cinema?.location || 'Địa chỉ Rạp'} </p> 

       <div class="header">                <h4> VÉ XEM PHIM </h4>
</div>
          
          <div class="info"><strong>Mã vé:</strong> ${payment.ticket?.ticket_id || ''}</div>
          <div class="info"><strong>Tổng tiền:</strong> ${payment.ticket?.total_amount?.toLocaleString('vi-VN') || '0'} VND</div>
          
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
      </body>
      </html>
    `;
  }














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