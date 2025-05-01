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

  // Thêm đối tượng lưu lỗi cho từng trường riêng biệt
  formErrors = {
    voucherId: '',
    codeVoucher: '',
    voucherValue: '',
    startDateVoucher: '',
    endDateVoucher: '',
    totalVoucher: ''
  };

  // Đánh dấu các trường đã được chạm vào
  touchedFields = {
    voucherId: false,
    codeVoucher: false,
    voucherValue: false,
    startDateVoucher: false,
    endDateVoucher: false,
    totalVoucher: false
  };

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

    // Reset validation state
    this.resetValidationState();

    this.showDialog = true;
  }

  // Mở dialog chỉnh sửa
  openEditDialog(index: number): void {
    this.isEditMode = true;
    this.voucherForm = this.vouchers[index].clone();

    // Reset validation state
    this.resetValidationState();

    this.showEditDialog = true;
  }

  // Reset validation state
  resetValidationState(): void {
    // Reset error message
    this.errorMessage = '';

    // Reset form errors
    Object.keys(this.formErrors).forEach(key => {
      this.formErrors[key as keyof typeof this.formErrors] = '';
    });

    // Reset touched fields
    Object.keys(this.touchedFields).forEach(key => {
      this.touchedFields[key as keyof typeof this.touchedFields] = false;
    });
  }

  // Đóng dialog (tất cả)
  closeDialog(): void {
    this.showDialog = false;
    this.showEditDialog = false;
    this.showConfirmDialog = false;
    this.voucherForm = new VouchersDto();
    this.deleteIndex = null;
    this.resetValidationState();
  }

  // Đánh dấu trường đã được chạm
  markFieldAsTouched(fieldName: keyof typeof this.touchedFields): void {
    this.touchedFields[fieldName] = true;
    this.validateField(fieldName);
  }

  // Kiểm tra từng trường
  validateField(fieldName: keyof typeof this.formErrors): void {
    // Reset lỗi của trường
    this.formErrors[fieldName] = '';

    switch (fieldName) {
      case 'codeVoucher':
        if (!this.voucherForm.codeVoucher?.trim()) {
          this.formErrors.codeVoucher = 'Mã voucher không được để trống';
        } else if (!this.isEditMode) {
          const existingVoucher = this.vouchers.find(v => v.codeVoucher === this.voucherForm.codeVoucher);
          if (existingVoucher) {
            this.formErrors.codeVoucher = 'Mã voucher này đã tồn tại';
          }
        }
        break;

      case 'voucherId':
        if (!this.voucherForm.voucherId?.trim()) {
          this.formErrors.voucherId = 'Voucher ID không được để trống';
        } else {
          const idPattern = /^[a-zA-Z0-9_-]+$/;
          if (!idPattern.test(this.voucherForm.voucherId)) {
            this.formErrors.voucherId = 'Chỉ được chứa chữ cái, số, gạch ngang và gạch dưới';
          } else if (!this.isEditMode) {
            const existingVoucher = this.vouchers.find(v => v.voucherId === this.voucherForm.voucherId);
            if (existingVoucher) {
              this.formErrors.voucherId = 'Voucher ID này đã tồn tại';
            }
          }
        }
        break;

      case 'voucherValue':
        if (!this.voucherForm.voucherValue) {
          this.formErrors.voucherValue = 'Giá trị voucher không được để trống';
        } else if (isNaN(this.voucherForm.voucherValue) || this.voucherForm.voucherValue <= 0) {
          this.formErrors.voucherValue = 'Giá trị phải là số dương';
        }
        break;

      case 'startDateVoucher':
        if (!this.voucherForm.startDateVoucher) {
          this.formErrors.startDateVoucher = 'Ngày bắt đầu không được để trống';
        } else {
          const startDate = new Date(this.voucherForm.startDateVoucher);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (startDate < today) {
            this.formErrors.startDateVoucher = 'Không thể chọn ngày trong quá khứ';
          }
        }
        break;

      case 'endDateVoucher':
        if (!this.voucherForm.endDateVoucher) {
          this.formErrors.endDateVoucher = 'Ngày kết thúc không được để trống';
        } else if (this.voucherForm.startDateVoucher) {
          const startDate = new Date(this.voucherForm.startDateVoucher);
          const endDate = new Date(this.voucherForm.endDateVoucher);

          if (endDate <= startDate) {
            this.formErrors.endDateVoucher = 'Phải sau ngày bắt đầu';
          }
        }
        break;

      case 'totalVoucher':
        if (!this.voucherForm.totalVoucher) {
          this.formErrors.totalVoucher = 'Số lượng không được để trống';
        } else if (isNaN(this.voucherForm.totalVoucher) ||
          this.voucherForm.totalVoucher <= 0 ||
          !Number.isInteger(this.voucherForm.totalVoucher)) {
          this.formErrors.totalVoucher = 'Phải là số nguyên dương';
        } else if (this.voucherForm.totalVoucher > 10000) {
          this.formErrors.totalVoucher = 'Không vượt quá 10.000';
        }
        break;
    }
  }

  // Kiểm tra tất cả các trường
  validateAllFields(): boolean {
    // Đánh dấu tất cả các trường là đã chạm
    Object.keys(this.touchedFields).forEach(field => {
      this.touchedFields[field as keyof typeof this.touchedFields] = true;
    });

    // Kiểm tra từng trường
    this.validateField('codeVoucher');
    this.validateField('voucherId');
    this.validateField('voucherValue');
    this.validateField('startDateVoucher');
    this.validateField('endDateVoucher');
    this.validateField('totalVoucher');

    // Kiểm tra xem còn lỗi nào không
    for (const key in this.formErrors) {
      const error = this.formErrors[key as keyof typeof this.formErrors];
      if (error !== '') {
        return false;
      }
    }

    return true;
  }

  // Lưu voucher mới
  saveVoucher(): void {
    if (this.validateAllFields()) {
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
    if (this.validateAllFields() && this.voucherForm.id) {
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