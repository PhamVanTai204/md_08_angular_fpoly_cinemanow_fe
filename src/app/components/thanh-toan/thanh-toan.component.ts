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
  currentPage: number = 0; // PrimeNG dùng chỉ số trang bắt đầu từ 0
  rows: number = 10;

  constructor(private paymentService: PaymentService) { }

  ngOnInit(): void {
    this.loadThanhToanData();
  }

  // Thêm vào class ThanhToanComponent
  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalRecords / this.rows);
    const current = this.currentPage + 1;
    const range = 2; // Số trang hiển thị mỗi bên của trang hiện tại
    const start = Math.max(1, current - range);
    const end = Math.min(totalPages, current + range);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(pageNumber: number): void {
    this.currentPage = pageNumber - 1;
    this.loadThanhToanData();
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadThanhToanData();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < Math.ceil(this.totalRecords / this.rows) - 1) {
      this.currentPage++;
      this.loadThanhToanData();
    }
  }

  onRowsPerPageChange(): void {
    this.currentPage = 0; // Reset về trang đầu tiên khi thay đổi số items/trang
    this.loadThanhToanData();
  }
  isLastPage(): boolean {
    return this.currentPage >= Math.ceil(this.totalRecords / this.rows) - 1;
  }
  loadThanhToanData(): void {
    const page = this.currentPage + 1; // API backend dùng chỉ số trang từ 1
    this.paymentService.getAllPayments(page, this.rows).subscribe({
      next: (data) => {
        this.thanhToanList = data.payments;
        this.totalRecords = data.totalPayments;
      },
      error: (err) => {
        console.error('Lỗi tải dữ liệu thanh toán:', err);
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.rows = event.rows;
    this.loadThanhToanData();
  }

  get filteredThanhToanList(): PaymentDto[] {
    if (!this.searchTerm.trim()) {
      return this.thanhToanList;
    }

    const lowerSearch = this.searchTerm.toLowerCase().trim();
    return this.thanhToanList.filter(item =>
      item.ticket_id?.showtime_id?.movie_id?.title?.toLowerCase().includes(lowerSearch)
    );
  }

  traCuuGD(): void {
    alert('Đang chuyển đến trang tra cứu giao dịch chi tiết');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  }
}

