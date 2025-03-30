// combo.component.ts
import { Component, OnInit } from '@angular/core';
import { ComboService, Combo } from '../../../shared/services/combo.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-combo',
  standalone: false,
  templateUrl: './combo.component.html',
  styleUrl: './combo.component.css'
})
export class ComboComponent implements OnInit {

  combos: Combo[] = [];
  selectedCombo: Combo | null = null;
  isLoading = false;
  errorMessage = '';
  currentUserId: string | null = null;
  isAdminView = false;

  // Dialog control
  showDialog = false;

  // Form fields for create/update
  newCombo: Partial<Combo> = {
    combo_id: '',
    name_combo: '',
    price_combo: 0,
    description_combo: '',
    image_combo: '',
    user_id: ''
  };
  isEditing = false;
  editId = '';

  constructor(
    private comboService: ComboService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    // Lấy ID người dùng hiện tại từ UserService
    this.currentUserId = this.userService.getCurrentUserId();
    console.log('Current User ID:', this.currentUserId);

    // Lấy thông tin người dùng
    const currentUser = this.userService.getCurrentUser();

    // Kiểm tra role
    this.isAdminView = currentUser && currentUser.role === 2;
    console.log('Is Admin?', this.isAdminView);

    if (!this.userService.isLoggedIn()) {
      this.errorMessage = "Vui lòng đăng nhập để tiếp tục.";
      return;
    }

    // Tải danh sách combo
    this.loadAllCombos();
  }

  // Kiểm tra xem combos có phải là mảng hợp lệ không
  isValidCombos(): boolean {
    return Array.isArray(this.combos) && this.combos.length > 0;
  }

  // Tải toàn bộ combos
  loadAllCombos(): void {
    this.isLoading = true;
    this.comboService.getAllCombos().subscribe({
      next: (response) => {
        console.log('API Response:', response);

        // Đảm bảo response là một mảng
        if (Array.isArray(response)) {
          this.combos = response;
        } else {
          console.error('Dữ liệu trả về không phải mảng:', response);
          this.combos = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Không thể tải dữ liệu combo. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Error loading combos:', error);
        this.combos = []; // Đảm bảo combos luôn là mảng khi có lỗi
      }
    });
  }

  loadComboDetails(id: string): void {
    this.isLoading = true;
    this.comboService.getComboById(id).subscribe({
      next: (data) => {
        this.selectedCombo = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Không thể tải chi tiết combo. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Error loading combo details:', error);
      }
    });
  }

  // Dialog methods
  openDialog(combo?: Combo): void {
    if (combo) {
      // Edit mode
      this.isEditing = true;
      this.editId = combo._id;
      this.newCombo = { ...combo };

      // Đảm bảo rằng chúng ta chỉ có string user_id, không phải object
      if (this.newCombo.user_id && typeof this.newCombo.user_id === 'object') {
        if (this.newCombo.user_id._id) {
          this.newCombo.user_id = this.newCombo.user_id._id;
        } else if (this.newCombo.user_id.userId) {
          this.newCombo.user_id = this.newCombo.user_id.userId;
        }
      }
    } else {
      // Add mode
      this.resetForm();
      this.isEditing = false;

      // Tự động điền user_id với ID người dùng hiện tại
      if (this.currentUserId) {
        this.newCombo.user_id = this.currentUserId;
      }
    }
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.resetForm();
  }

  submitForm(): void {
    // Kiểm tra dữ liệu hợp lệ
    if (!this.validateForm()) {
      return;
    }

    // Đảm bảo user_id được điền
    if (!this.newCombo.user_id && this.currentUserId) {
      this.newCombo.user_id = this.currentUserId;
    }

    if (this.isEditing) {
      this.updateCombo();
    } else {
      this.createCombo();
    }
  }

  validateForm(): boolean {
    if (!this.newCombo.combo_id || !this.newCombo.name_combo || !this.newCombo.price_combo) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin bắt buộc: Mã combo, Tên combo và Giá';
      return false;
    }

    return true;
  }

  createCombo(): void {
    this.isLoading = true;

    // Chuẩn bị dữ liệu gửi đi
    const comboToCreate: Omit<Combo, '_id'> = {
      combo_id: this.newCombo.combo_id || '',
      name_combo: this.newCombo.name_combo || '',
      price_combo: Number(this.newCombo.price_combo) || 0,
      description_combo: this.newCombo.description_combo || '',
      image_combo: this.newCombo.image_combo || '',
      user_id: this.newCombo.user_id || this.currentUserId || ''
    };

    console.log('Creating combo with data:', comboToCreate);

    this.comboService.createCombo(comboToCreate).subscribe({
      next: (response) => {
        console.log('Combo created successfully:', response);
        this.loadAllCombos();
        this.resetForm();
        this.closeDialog();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Không thể tạo combo mới. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Error creating combo:', error);
      }
    });
  }

  updateCombo(): void {
    if (!this.editId) return;

    this.isLoading = true;

    // Chuẩn bị dữ liệu cập nhật
    const comboToUpdate: Partial<Combo> = {
      combo_id: this.newCombo.combo_id,
      name_combo: this.newCombo.name_combo,
      price_combo: Number(this.newCombo.price_combo),
      description_combo: this.newCombo.description_combo,
      image_combo: this.newCombo.image_combo,
      user_id: this.newCombo.user_id || this.currentUserId || ''
    };

    console.log('Updating combo with data:', comboToUpdate);

    this.comboService.updateCombo(this.editId, comboToUpdate).subscribe({
      next: (response) => {
        console.log('Combo updated successfully:', response);
        this.loadAllCombos();
        this.resetForm();
        this.closeDialog();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Không thể cập nhật combo. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Error updating combo:', error);
      }
    });
  }

  deleteCombo(id: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa combo này không?')) {
      this.isLoading = true;
      this.comboService.deleteCombo(id).subscribe({
        next: (response) => {
          console.log('Combo deleted successfully:', response);
          this.loadAllCombos();

          if (this.selectedCombo && this.selectedCombo._id === id) {
            this.selectedCombo = null;
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Không thể xóa combo. Vui lòng thử lại sau.';
          this.isLoading = false;
          console.error('Error deleting combo:', error);
        }
      });
    }
  }

  resetForm(): void {
    this.newCombo = {
      combo_id: '',
      name_combo: '',
      price_combo: 0,
      description_combo: '',
      image_combo: '',
      // Tự động thiết lập user_id
      user_id: this.currentUserId || ''
    };
    this.isEditing = false;
    this.editId = '';
    this.errorMessage = '';
  }

  addToCart(combo: Combo): void {
    // Implement add to cart functionality
    console.log('Added to cart:', combo);
    // Here you would typically call a cart service
  }
}