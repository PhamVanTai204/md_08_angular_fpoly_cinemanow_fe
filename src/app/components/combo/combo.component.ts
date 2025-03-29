// combo.component.ts
import { Component, OnInit } from '@angular/core';
import { ComboService, Combo } from '../../../shared/services/combo.service';

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

  // Dialog control
  showDialog = false;

  // Form fields for create/update
  newCombo: Partial<Combo> = {
    combo_id: '',
    name_combo: '',
    price_combo: 0,
    description_combo: '',
    image_combo: ''
  };
  isEditing = false;
  editId = '';

  constructor(private comboService: ComboService) { }

  ngOnInit(): void {
    this.loadCombos();
  }

  // Kiểm tra xem combos có phải là mảng hợp lệ không
  isValidCombos(): boolean {
    return Array.isArray(this.combos) && this.combos.length > 0;
  }

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
    }
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
  }

  submitForm(): void {
    if (this.isEditing) {
      this.updateCombo();
    } else {
      this.createCombo();
    }
  }

  createCombo(): void {
    this.isLoading = true;
    this.comboService.createCombo(this.newCombo as Omit<Combo, '_id'>).subscribe({
      next: () => {
        this.loadCombos();
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
    this.comboService.updateCombo(this.editId, this.newCombo).subscribe({
      next: () => {
        this.loadCombos();
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
          this.loadCombos();
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
      image_combo: ''
    };
    this.isEditing = false;
    this.editId = '';
  }

  addToCart(combo: Combo): void {
    // Implement add to cart functionality
    console.log('Added to cart:', combo);
    // Here you would typically call a cart service
  }
}