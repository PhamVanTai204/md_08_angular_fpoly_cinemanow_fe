import { Component, OnInit } from '@angular/core';
import { VouchersService } from '../../../shared/services/vouchers.service';
import { VouchersDto } from '../../../shared/dtos/vouchersDto.dto';

@Component({
  selector: 'app-voucher',
  templateUrl: './voucher.component.html',
  styleUrls: ['./voucher.component.css'],
  standalone: false // Chỉ rõ component này không standalone
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

  constructor(private vouchersService: VouchersService) { }

  ngOnInit(): void {
    this.loadVouchers();
  }

  loadVouchers(): void {
    this.vouchersService.getVouchers().subscribe({
      next: (data) => {
        this.vouchers = data,
          console.log(this.vouchers, "danh sách vocher");

      },
      error: (error) => console.error('Lỗi tải voucher:', error)
    });
  }

  // Mở dialog thêm mới
  openDialog(): void {
    this.isEditMode = false;
    this.voucherForm = new VouchersDto();
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
    if (this.voucherForm.voucherId.trim() && this.voucherForm.voucherValue) {
      this.vouchersService.createVoucher(this.voucherForm).subscribe({
        next: () => {
          this.loadVouchers();
          this.closeDialog();
        },
        error: (error) => console.error('Lỗi thêm voucher:', error)
      });
    }
  }

  // Cập nhật voucher
  updateVoucher(): void {
    if (this.voucherForm.voucherId.trim() && this.voucherForm.voucherValue && this.voucherForm.id) {
      this.vouchersService.updateVoucher(this.voucherForm.id, this.voucherForm).subscribe({
        next: () => {
          this.loadVouchers();
          this.closeDialog();
        },
        error: (error) => console.error('Lỗi cập nhật voucher:', error)
      });
    }
  }

  // Mở dialog xác nhận xóa
  openConfirmDialog(index: number): void {
    this.deleteIndex = index;
    this.voucherForm = this.vouchers[index].clone(); // Dùng dữ liệu voucher đó để hiển thị
    this.showConfirmDialog = true;
  }

  // Xác nhận xóa voucher
  confirmDelete(): void {
    if (this.deleteIndex !== null && this.vouchers[this.deleteIndex].id) {
      this.vouchersService.deleteVoucher(this.vouchers[this.deleteIndex].id).subscribe({
        next: () => {
          this.loadVouchers();
          this.closeDialog();
        },
        error: (error) => console.error('Lỗi xóa voucher:', error)
      });
    }
  }
}
