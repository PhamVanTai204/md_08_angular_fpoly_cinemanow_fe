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

  constructor(private paymentService: PaymentService) { }

  ngOnInit(): void {
    this.loadThanhToanData();
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
    this.loadThanhToanData();
  }

  goToPreviousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadThanhToanData();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadThanhToanData();
    }
  }

  onRowsPerPageChange(): void {
    this.currentPage = 0;
    this.loadThanhToanData();
  }

  isLastPage(): boolean {
    return this.currentPage >= this.totalPages - 1;
  }

  loadThanhToanData(): void {
    const page = this.currentPage + 1;
    this.paymentService.getAllPayments(page, this.rows, this.searchTerm).subscribe({
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
    this.loadThanhToanData();
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.rows = event.rows;
    this.loadThanhToanData();
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

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  }
}