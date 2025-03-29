// combo.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { ComboService, Combo } from '../../../shared/services/combo.service';

@Component({
  selector: 'app-combo',
  standalone: false,
  templateUrl: './combo.component.html',
  styleUrl: './combo.component.css'
})
export class ComboComponent implements OnInit {
  
  @Input() userId: string = ''; // Allow passing userId from parent component
  
  combos: Combo[] = [];
  selectedCombo: Combo | null = null;
  isLoading = false;
  errorMessage = '';
  isCustomerView = false; // Để xác định chế độ hiển thị cho khách hàng

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

  constructor(private comboService: ComboService) { }

  ngOnInit(): void {
    // If userId is provided, load combos for that user
    // Otherwise, load all combos (admin view)
    if (this.userId) {
      this.isCustomerView = true;
      this.loadUserCombos(this.userId);
    } else {
      this.loadCombos();
    }
  }

  // Kiểm tra xem combos có phải là mảng hợp lệ không
  isValidCombos(): boolean {
    return Array.isArray(this.combos) && this.combos.length > 0;
  }

  // Tải toàn bộ combos (admin view)
  loadCombos(): void {
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

  // NEW METHOD: Tải combos của người dùng cụ thể (customer view)
  loadUserCombos(userId: string): void {
    this.isLoading = true;
    this.comboService.getCombosByUserId(userId).subscribe({
      next: (response) => {
        console.log('User Combos Response:', response);
        
        if (Array.isArray(response)) {
          this.combos = response;
        } else {
          console.error('Dữ liệu trả về không phải mảng:', response);
          this.combos = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Không thể tải dữ liệu combo của người dùng. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Error loading user combos:', error);
        this.combos = [];
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
    } else {
      // Add mode
      this.resetForm();
      this.isEditing = false;
      
      // If in customer view, pre-populate the user ID
      if (this.userId) {
        this.newCombo.user_id = this.userId;
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
      user_id: this.newCombo.user_id || this.userId || null // Include user_id from form or component
    };

    this.comboService.createCombo(comboToCreate).subscribe({
      next: () => {
        // Reload appropriate combos list
        if (this.userId) {
          this.loadUserCombos(this.userId);
        } else {
          this.loadCombos();
        }
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
      user_id: this.newCombo.user_id || this.userId || null // Preserve user_id
    };
    
    this.comboService.updateCombo(this.editId, comboToUpdate).subscribe({
      next: () => {
        // Reload appropriate combos list
        if (this.userId) {
          this.loadUserCombos(this.userId);
        } else {
          this.loadCombos();
        }
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
        next: () => {
          // Reload appropriate combos list
          if (this.userId) {
            this.loadUserCombos(this.userId);
          } else {
            this.loadCombos();
          }
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
      user_id: this.userId || '' // Pre-populate user_id if in customer view
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