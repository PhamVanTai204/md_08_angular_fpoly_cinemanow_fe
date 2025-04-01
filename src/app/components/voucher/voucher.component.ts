import { Component, OnInit } from '@angular/core';
import { VouchersService } from '../../../shared/services/vouchers.service';
import { VouchersDto } from '../../../shared/dtos/vouchersDto.dto';

@Component({
  selector: 'app-voucher',
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.css'],
  standalone: false
})
export class VoucherComponent implements OnInit {
  // Danh sách voucher
  vouchers: VouchersDto[] = [];
  
  // Các trạng thái hiển thị dialog
  showDialog = false;
  showEditDialog = false;
  showConfirmDialog = false;
  
  // Biến để lưu dữ liệu form dialog
  voucherForm: VouchersDto = new VouchersDto();
  
  // Lưu index của voucher cần xóa (nếu có)
  deleteIndex: number | null = null;
  
  // Xác định chế độ: thêm mới hay chỉnh sửa
  isEditMode = false;
  
  // Biến cho loading state và error message
  isLoading = false;
  errorMessage = '';

  constructor(private vouchersService: VouchersService) { }

  ngOnInit(): void {
    this.loadVouchers();
  }

  // Lấy danh sách voucher
  loadVouchers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.vouchersService.getVouchers().subscribe({
      next: (data) => {
        this.vouchers = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi tải voucher:', error);
        this.errorMessage = 'Không thể tải danh sách voucher. Vui lòng thử lại sau.';
        this.isLoading = false;
      }
    });
  }

  // Mở dialog thêm mới
  openDialog(): void {
    this.isEditMode = false;
    this.voucherForm = new VouchersDto();
    // Thiết lập giá trị mặc định cho trạng thái
    this.voucherForm.statusVoucher = 'active';
    this.showDialog = true;
  }

  // Mở dialog chỉnh sửa
  openEditDialog(index: number): void {
    this.isEditMode = true;
    this.voucherForm = this.vouchers[index].clone();
    this.showEditDialog = true;
  }

  // Đóng dialog (tất cả)
  closeDialog(): void {
    this.showDialog = false;
    this.showEditDialog = false;
    this.showConfirmDialog = false;
    this.voucherForm = new VouchersDto();
    this.deleteIndex = null;
  }

  // Lưu voucher mới
  saveVoucher(): void {
    if (this.validateVoucherForm()) {
      this.isLoading = true;
      
      this.vouchersService.createVoucher(this.voucherForm).subscribe({
        next: () => {
          this.loadVouchers();
          this.closeDialog();
        },
        error: (error) => {
          console.error('Lỗi thêm voucher:', error);
          this.errorMessage = 'Không thể thêm voucher mới. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
    }
  }

  // Cập nhật voucher
  updateVoucher(): void {
    if (this.validateVoucherForm() && this.voucherForm.id) {
      this.isLoading = true;
      
      this.vouchersService.updateVoucher(this.voucherForm.id, this.voucherForm).subscribe({
        next: () => {
          this.loadVouchers();
          this.closeDialog();
        },
        error: (error) => {
          console.error('Lỗi cập nhật voucher:', error);
          this.errorMessage = 'Không thể cập nhật voucher. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
    }
  }

  // Mở dialog xác nhận xóa
  openConfirmDialog(index: number): void {
    this.deleteIndex = index;
    this.voucherForm = this.vouchers[index].clone();
    this.showConfirmDialog = true;
  }

  // Xác nhận xóa voucher
  confirmDelete(): void {
    if (this.deleteIndex !== null && this.vouchers[this.deleteIndex].id) {
      this.isLoading = true;
      
      this.vouchersService.deleteVoucher(this.vouchers[this.deleteIndex].id).subscribe({
        next: () => {
          this.loadVouchers();
          this.closeDialog();
        },
        error: (error) => {
          console.error('Lỗi xóa voucher:', error);
          this.errorMessage = 'Không thể xóa voucher. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
    }
  }
  
  // Kiểm tra form voucher hợp lệ
  validateVoucherForm(): boolean {
    if (!this.voucherForm.voucherId || !this.voucherForm.voucherId.trim()) {
      this.errorMessage = 'Vui lòng nhập Voucher ID';
      return false;
    }
    
    if (!this.voucherForm.codeVoucher || !this.voucherForm.codeVoucher.trim()) {
      this.errorMessage = 'Vui lòng nhập mã voucher';
      return false;
    }
    
    if (!this.voucherForm.voucherValue || this.voucherForm.voucherValue <= 0) {
      this.errorMessage = 'Giá trị voucher phải lớn hơn 0';
      return false;
    }
    
    if (!this.voucherForm.startDateVoucher) {
      this.errorMessage = 'Vui lòng chọn ngày bắt đầu';
      return false;
    }
    
    if (!this.voucherForm.endDateVoucher) {
      this.errorMessage = 'Vui lòng chọn ngày kết thúc';
      return false;
    }
    
    if (new Date(this.voucherForm.startDateVoucher) > new Date(this.voucherForm.endDateVoucher)) {
      this.errorMessage = 'Ngày bắt đầu không thể sau ngày kết thúc';
      return false;
    }
    
    if (!this.voucherForm.totalVoucher || this.voucherForm.totalVoucher <= 0) {
      this.errorMessage = 'Số lượng voucher phải lớn hơn 0';
      return false;
    }
    
    return true;
  }
  
  // Format giá trị tiền tệ
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(value);
  }
  
  // Format ngày tháng
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  
  // Rút gọn ID
  truncateId(id: string): string {
    if (!id) return '';
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  }
}