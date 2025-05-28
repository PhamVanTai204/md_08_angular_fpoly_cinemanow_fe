import { Component, OnInit, OnDestroy } from '@angular/core';
import { ComboService } from '../../../shared/services/combo.service';
import { UserService } from '../../../shared/services/user.service';
import { Subscription, forkJoin, timer } from 'rxjs';
import { ComboDto } from '../../../shared/dtos/ComboDto.dto';

@Component({
  selector: 'app-combo',
  templateUrl: './combo.component.html',
  styleUrls: ['./combo.component.css'],
  standalone: false
})
export class ComboComponent implements OnInit, OnDestroy {
  // Danh sách combo
  combos: ComboDto[] = [];
  selectedCombo: ComboDto | null = null;

  // Loading state
  isLoading = false;
  errorMessage = '';

  // User info
  currentUserId: string | null = null;
  isAdminView = false;
  isStaffView = false;

  // Dialog control
  showDialog = false;
  showDeleteDialog = false;
  showDetailsDialog = false;

  // Form data
  newCombo: ComboDto = new ComboDto();

  // Edit/Delete tracking
  isEditing = false;
  editId = '';
  comboToDelete = { id: '', name: '' };

  // Validation objects
  formErrors = {
    combo_id: '',
    name_combo: '',
    price_combo: '',
    description_combo: '',
    image_combo: ''
  };

  touchedFields = {
    combo_id: false,
    name_combo: false,
    price_combo: false,
    description_combo: false,
    image_combo: false
  };

  // Pagination variables
  pageSize = 10;
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  pagesToShow: number[] = [];
  Math = Math;

  // Subscription management
  private subscriptions: Subscription[] = [];

  constructor(
    private comboService: ComboService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.userService.getCurrentUserId();
    
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.isAdminView = currentUser.role === 2;
      this.isStaffView = currentUser.role === 3;
    }

    if (!this.userService.isLoggedIn()) {
      this.errorMessage = "Vui lòng đăng nhập để tiếp tục.";
      return;
    }

    this.loadAllCombos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Reset validation state
  resetValidationState(): void {
    this.errorMessage = '';
    
    Object.keys(this.formErrors).forEach(key => {
      this.formErrors[key as keyof typeof this.formErrors] = '';
    });
    
    Object.keys(this.touchedFields).forEach(key => {
      this.touchedFields[key as keyof typeof this.touchedFields] = false;
    });
  }

  // Mark field as touched and validate it
  markFieldAsTouched(fieldName: keyof typeof this.touchedFields): void {
    this.touchedFields[fieldName] = true;
    this.validateField(fieldName);
  }

  // Validate a single field
  validateField(fieldName: keyof typeof this.formErrors): void {
    this.formErrors[fieldName] = '';
    
    switch (fieldName) {
      case 'combo_id':
        if (!this.newCombo.combo_id?.trim()) {
          this.formErrors.combo_id = 'Mã combo không được để trống';
        } else {
          const idPattern = /^[a-zA-Z0-9_-]+$/;
          if (!idPattern.test(this.newCombo.combo_id)) {
            this.formErrors.combo_id = 'Chỉ được chứa chữ cái, số, gạch ngang và gạch dưới';
          } else if (!this.isEditing) {
            const existingCombo = this.combos.find(c => c.combo_id === this.newCombo.combo_id);
            if (existingCombo) {
              this.formErrors.combo_id = 'Mã combo này đã tồn tại';
            }
          }
        }
        break;
        
      case 'name_combo':
        if (!this.newCombo.name_combo?.trim()) {
          this.formErrors.name_combo = 'Tên combo không được để trống';
        } else if (this.newCombo.name_combo.length < 3) {
          this.formErrors.name_combo = 'Tên combo phải ít nhất 3 ký tự';
        }
        break;
        
      case 'price_combo':
        if (this.newCombo.price_combo === undefined || this.newCombo.price_combo === null) {
          this.formErrors.price_combo = 'Giá combo không được để trống';
        } else if (isNaN(Number(this.newCombo.price_combo)) || Number(this.newCombo.price_combo) <= 0) {
          this.formErrors.price_combo = 'Giá phải là số dương';
        }
        break;
        
      case 'description_combo':
        if (this.newCombo.description_combo && this.newCombo.description_combo.length > 500) {
          this.formErrors.description_combo = 'Mô tả không được quá 500 ký tự';
        }
        break;
        
      case 'image_combo':
        if (this.newCombo.image_combo) {
          try {
            new URL(this.newCombo.image_combo);
          } catch (e) {
            this.formErrors.image_combo = 'URL hình ảnh không hợp lệ';
          }
        }
        break;
    }
  }

  // Validate all fields at once
  validateAllFields(): boolean {
    // Mark all fields as touched
    Object.keys(this.touchedFields).forEach(field => {
      this.touchedFields[field as keyof typeof this.touchedFields] = true;
    });
    
    // Validate each field
    this.validateField('combo_id');
    this.validateField('name_combo');
    this.validateField('price_combo');
    this.validateField('description_combo');
    this.validateField('image_combo');
    
    // Check for any errors
    for (const key in this.formErrors) {
      const error = this.formErrors[key as keyof typeof this.formErrors];
      if (error !== '') {
        return false;
      }
    }
    
    return true;
  }

  // Check if combos array is valid
  isValidCombos(): boolean {
    return Array.isArray(this.combos) && this.combos.length > 0;
  }

  // Load all combos với delay loading tối thiểu 2 giây
  loadAllCombos(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Tạo timer 2 giây và kết hợp với API call
    const minimumDelay = timer(2000); // 2 giây
    const apiCall = this.comboService.getAllCombos();
    
    // Sử dụng forkJoin để đợi cả timer và API call hoàn thành
    const sub = forkJoin([minimumDelay, apiCall]).subscribe({
      next: ([_, response]) => {
        if (Array.isArray(response)) {
          this.combos = response;
          this.totalItems = this.combos.length;
          this.calculateTotalPages();
          this.generatePagesToShow();
          console.log('Dữ liệu combo đã được tải sau delay 2 giây');
        } else {
          console.error('API response is not an array:', response);
          this.combos = [];
          this.totalItems = 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Không thể tải dữ liệu combo. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Error loading combos:', error);
        this.combos = [];
        this.totalItems = 0;
      }
    });
    
    this.subscriptions.push(sub);
  }

  // Refresh dữ liệu với delay (có thể gọi từ nút refresh)
  refreshCombos(): void {
    console.log('Đang làm mới dữ liệu combo...');
    this.loadAllCombos();
  }

  // Get paginated combos
  get paginatedCombos(): ComboDto[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalItems);
    return this.combos.slice(startIndex, endIndex);
  }

  // Calculate total pages
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    if (this.totalPages === 0) this.totalPages = 1;
  }

  // Generate pages to show
  generatePagesToShow(): void {
    const maxPagesToShow = 5;
    this.pagesToShow = [];

    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        this.pagesToShow.push(i);
      }
    } else {
      let startPage = Math.max(this.currentPage - Math.floor(maxPagesToShow / 2), 1);
      let endPage = startPage + maxPagesToShow - 1;

      if (endPage > this.totalPages) {
        endPage = this.totalPages;
        startPage = Math.max(endPage - maxPagesToShow + 1, 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        this.pagesToShow.push(i);
      }
    }
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.generatePagesToShow();

    if (this.selectedCombo) {
      this.selectedCombo = null;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  // Permission checks
  canEditCombo(combo: ComboDto): boolean {
    if (this.isAdminView || this.isStaffView) return true;
    if (!combo.user_id) return false;
    return combo.user_id === this.currentUserId;
  }

  canDeleteCombo(combo: ComboDto): boolean {
    return this.canEditCombo(combo);
  }

  // Load combo details với delay
  loadComboDetails(id: string): void {
    this.isLoading = true;
    
    // Tạo timer 2 giây và kết hợp với API call
    const minimumDelay = timer(2000);
    const apiCall = this.comboService.getComboById(id);
    
    const sub = forkJoin([minimumDelay, apiCall]).subscribe({
      next: ([_, data]) => {
        this.selectedCombo = data;
        this.showDetailsDialog = true;
        this.isLoading = false;
        console.log('Chi tiết combo đã được tải sau delay 2 giây');
      },
      error: (error) => {
        this.errorMessage = 'Không thể tải chi tiết combo. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Error loading combo details:', error);
      }
    });
    
    this.subscriptions.push(sub);
  }

  // Close details dialog
  closeDetailsDialog(): void {
    this.showDetailsDialog = false;
    this.selectedCombo = null;
  }

  // Open add/edit dialog
  openDialog(combo?: ComboDto): void {
    this.resetValidationState();
    
    if (combo && !this.canEditCombo(combo)) {
      this.errorMessage = 'Bạn không có quyền chỉnh sửa combo này.';
      return;
    }

    if (combo) {
      this.isEditing = true;
      this.editId = combo.id;
      // Use the clone method from your ComboDto class
      this.newCombo = combo.clone();
    } else {
      this.resetForm();
      this.isEditing = false;
      if (this.currentUserId) {
        this.newCombo.user_id = this.currentUserId;
      }
    }
    this.showDialog = true;
  }

  // Close dialog
  closeDialog(): void {
    this.showDialog = false;
    this.resetForm();
  }

  // Submit form
  submitForm(): void {
    // First validate all fields
    if (!this.validateAllFields()) {
      // Find the first error and set it as the main error message
      for (const key in this.formErrors) {
        const error = this.formErrors[key as keyof typeof this.formErrors];
        if (error !== '') {
          this.errorMessage = error;
          return;
        }
      }
      return;
    }

    if (!this.newCombo.user_id && this.currentUserId) {
      this.newCombo.user_id = this.currentUserId;
    }

    if (this.isEditing) {
      this.updateCombo();
    } else {
      this.createCombo();
    }
  }

  // Create new combo với delay
  createCombo(): void {
    this.isLoading = true;

    // Tạo timer 2 giây và kết hợp với API call
    const minimumDelay = timer(2000);
    const apiCall = this.comboService.createCombo(this.newCombo);

    const sub = forkJoin([minimumDelay, apiCall]).subscribe({
      next: ([_, result]) => {
        console.log('Combo đã được tạo sau delay 2 giây');
        this.loadAllCombos(); // Sẽ có delay thêm 2 giây nữa khi tải lại
        this.closeDialog();
      },
      error: (error) => {
        this.errorMessage = 'Không thể tạo combo mới. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Error creating combo:', error);
      }
    });
    
    this.subscriptions.push(sub);
  }

  // Update existing combo với delay
  updateCombo(): void {
    if (!this.editId) return;

    const comboToEdit = this.combos.find(combo => combo.id === this.editId);
    if (comboToEdit && !this.canEditCombo(comboToEdit)) {
      this.errorMessage = 'Bạn không có quyền cập nhật combo này.';
      return;
    }

    this.isLoading = true;

    // Tạo timer 2 giây và kết hợp với API call
    const minimumDelay = timer(2000);
    const apiCall = this.comboService.updateCombo(this.editId, this.newCombo);

    const sub = forkJoin([minimumDelay, apiCall]).subscribe({
      next: ([_, result]) => {
        console.log('Combo đã được cập nhật sau delay 2 giây');
        this.loadAllCombos(); // Sẽ có delay thêm 2 giây nữa khi tải lại
        this.closeDialog();
      },
      error: (error) => {
        this.errorMessage = 'Không thể cập nhật combo. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Error updating combo:', error);
      }
    });
    
    this.subscriptions.push(sub);
  }

  // Confirm delete
  confirmDelete(id: string, name: string): void {
    const comboToDelete = this.combos.find(combo => combo.id === id);
    
    if (comboToDelete && !this.canDeleteCombo(comboToDelete)) {
      this.errorMessage = 'Bạn không có quyền xóa combo này.';
      return;
    }
    
    this.comboToDelete = {
      id: id,
      name: name
    };
    this.showDeleteDialog = true;
  }

  // Cancel delete
  cancelDelete(): void {
    this.showDeleteDialog = false;
    this.comboToDelete = { id: '', name: '' };
  }

  // Delete combo với delay
  deleteCombo(id: string): void {
    this.isLoading = true;

    // Tạo timer 2 giây và kết hợp với API call
    const minimumDelay = timer(2000);
    const apiCall = this.comboService.deleteCombo(id);

    const sub = forkJoin([minimumDelay, apiCall]).subscribe({
      next: ([_, result]) => {
        console.log('Combo đã được xóa sau delay 2 giây');
        
        if (this.selectedCombo && this.selectedCombo.id === id) {
          this.selectedCombo = null;
        }

        this.loadAllCombos(); // Sẽ có delay thêm 2 giây nữa khi tải lại
        this.showDeleteDialog = false;
      },
      error: (error) => {
        this.errorMessage = 'Không thể xóa combo. Vui lòng thử lại sau.';
        this.isLoading = false;
        console.error('Error deleting combo:', error);
      }
    });
    
    this.subscriptions.push(sub);
  }

  // Reset form
  resetForm(): void {
    // Create a new instance of ComboDto class
    this.newCombo = new ComboDto();
    // Set all properties individually
    this.newCombo.id = '';
    this.newCombo.combo_id = '';
    this.newCombo.user_id = this.currentUserId || '';
    this.newCombo.name_combo = '';
    this.newCombo.price_combo = 0;
    this.newCombo.description_combo = '';
    this.newCombo.image_combo = '';
    
    this.isEditing = false;
    this.editId = '';
    this.errorMessage = '';
    this.resetValidationState();
  }

  // Get user name from user_id
  getUserName(userId: any): string {
    if (!userId) return 'Không có thông tin';

    if (typeof userId === 'object') {
      if (userId.fullName) return userId.fullName;
      if (userId.name) return userId.name;
      if (userId.username) return userId.username;
      if (userId.email) return userId.email;
      if (userId._id) return `ID: ${this.truncateId(userId._id)}`;
    }

    if (typeof userId === 'string') {
      return `ID: ${this.truncateId(userId)}`;
    }

    return 'Không xác định';
  }

  // Truncate ID
  truncateId(id: string): string {
    if (!id) return '';
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  }
}