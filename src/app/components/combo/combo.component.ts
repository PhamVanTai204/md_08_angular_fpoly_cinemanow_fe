import { Component, OnInit, OnDestroy } from '@angular/core';
import { ComboService } from '../../../shared/services/combo.service';
import { UserService } from '../../../shared/services/user.service';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
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

  // Pagination variables
  pageSize = 10; // 10 items per page
  currentPage = 1; // Current page
  totalItems = 0; // Total number of items
  totalPages = 0; // Total number of pages
  pagesToShow: number[] = []; // Pages to show in pagination control

  // Make Math available in the template
  Math = Math;

  // Subscription management to prevent memory leaks
  private subscriptions: Subscription[] = [];

  constructor(
    private comboService: ComboService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    // Get current user ID
    this.currentUserId = this.userService.getCurrentUserId();

    // Check user roles
    const currentUser = this.userService.getCurrentUser();
    if (currentUser) {
      this.isAdminView = currentUser.role === 2;
      this.isStaffView = currentUser.role === 3;
    }

    // Verify login
    if (!this.userService.isLoggedIn()) {
      this.errorMessage = "Vui lòng đăng nhập để tiếp tục.";
      return;
    }

    // Load combo list
    this.loadAllCombos();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Check if combos is a valid array with items
  isValidCombos(): boolean {
    return Array.isArray(this.combos) && this.combos.length > 0;
  }

  // Load all combos
  loadAllCombos(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const sub = this.comboService.getAllCombos().subscribe({
      next: (response) => {
        // Ensure response is an array
        if (Array.isArray(response)) {
          this.combos = response;
          this.totalItems = this.combos.length;
          this.calculateTotalPages();
          this.generatePagesToShow();
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

  // Get current page data
  get paginatedCombos(): ComboDto[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalItems);
    return this.combos.slice(startIndex, endIndex);
  }

  // Calculate total pages
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
  }

  // Generate array of page numbers to show
  generatePagesToShow(): void {
    const maxPagesToShow = 5;
    this.pagesToShow = [];

    if (this.totalPages <= maxPagesToShow) {
      // If we have less pages than max, show all
      for (let i = 1; i <= this.totalPages; i++) {
        this.pagesToShow.push(i);
      }
    } else {
      // Show a window of pages around the current page
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

  // Go to a specific page
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.generatePagesToShow();

    // If a combo is selected, deselect it when changing pages
    if (this.selectedCombo) {
      this.selectedCombo = null;
    }
  }

  // Go to previous page
  prevPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  // Go to next page
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  // Check if user can edit a combo (admin or owner)
  canEditCombo(combo: ComboDto): boolean {
    if (this.isAdminView || this.isStaffView) return true; // Admin and staff can edit any combo
    
    // Check if current user is the creator
    if (!combo.user_id) return false;
    
    return combo.user_id === this.currentUserId;
  }

  // Check if user can delete a combo (admin or owner)
  canDeleteCombo(combo: ComboDto): boolean {
    return this.canEditCombo(combo); // Same rules as edit
  }

  // Load combo details
  loadComboDetails(id: string): void {
    this.isLoading = true;
    
    const sub = this.comboService.getComboById(id).subscribe({
      next: (data) => {
        this.selectedCombo = data;
        this.showDetailsDialog = true;
        this.isLoading = false;
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

  // Open dialog for add/edit
  openDialog(combo?: ComboDto): void {
    // Check if user has permission to edit (admin, staff or owner)
    if (combo && !this.canEditCombo(combo)) {
      this.errorMessage = 'Bạn không có quyền chỉnh sửa combo này.';
      return;
    }

    if (combo) {
      // Edit mode
      this.isEditing = true;
      this.editId = combo.id;
      this.newCombo = combo.clone(); // Use the clone method
    } else {
      // Add mode
      this.resetForm();
      this.isEditing = false;

      // Auto-fill current user ID
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

  // Submit form (add or update)
  submitForm(): void {
    // Validate form
    if (!this.validateForm()) {
      return;
    }

    // Ensure user_id is filled
    if (!this.newCombo.user_id && this.currentUserId) {
      this.newCombo.user_id = this.currentUserId;
    }

    if (this.isEditing) {
      this.updateCombo();
    } else {
      this.createCombo();
    }
  }

  // Validate form fields
  validateForm(): boolean {
    if (!this.newCombo.combo_id || !this.newCombo.combo_id.trim()) {
      this.errorMessage = 'Vui lòng nhập Mã combo';
      return false;
    }

    if (!this.newCombo.name_combo || !this.newCombo.name_combo.trim()) {
      this.errorMessage = 'Vui lòng nhập Tên combo';
      return false;
    }

    if (!this.newCombo.price_combo || this.newCombo.price_combo <= 0) {
      this.errorMessage = 'Giá combo phải lớn hơn 0';
      return false;
    }

    return true;
  }

  // Create new combo
  createCombo(): void {
    this.isLoading = true;

    const sub = this.comboService.createCombo(this.newCombo).subscribe({
      next: () => {
        this.loadAllCombos();
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

  // Update existing combo
  updateCombo(): void {
    if (!this.editId) return;

    // Check permission again as a safeguard
    const comboToEdit = this.combos.find(combo => combo.id === this.editId);
    if (comboToEdit && !this.canEditCombo(comboToEdit)) {
      this.errorMessage = 'Bạn không có quyền cập nhật combo này.';
      return;
    }

    this.isLoading = true;

    const sub = this.comboService.updateCombo(this.editId, this.newCombo).subscribe({
      next: () => {
        this.loadAllCombos();
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

  // Open delete confirmation dialog
  confirmDelete(id: string, name: string): void {
    // Find the combo to check permissions
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

  // Cancel delete operation
  cancelDelete(): void {
    this.showDeleteDialog = false;
    this.comboToDelete = { id: '', name: '' };
  }

  // Delete combo
  deleteCombo(id: string): void {
    this.isLoading = true;

    const sub = this.comboService.deleteCombo(id).subscribe({
      next: () => {
        // If deleted combo was selected, deselect it
        if (this.selectedCombo && this.selectedCombo.id === id) {
          this.selectedCombo = null;
        }

        this.loadAllCombos();
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

  // Reset form to defaults
  resetForm(): void {
    this.newCombo = new ComboDto({
      combo_id: '',
      user_id: this.currentUserId || '',
      name_combo: '',
      price_combo: 0,
      description_combo: '',
      image_combo: ''
    });
    this.isEditing = false;
    this.editId = '';
    this.errorMessage = '';
  }

  // Get user name from user_id
  getUserName(userId: any): string {
    // If userService has a method to get user by ID, use it
    // This is a placeholder - you should implement actual user lookup
    if (!userId) return 'Không có thông tin';

    // If userId is an object that contains user information
    if (typeof userId === 'object') {
      // Check for common user object properties
      if (userId.fullName) return userId.fullName;
      if (userId.name) return userId.name;
      if (userId.username) return userId.username;
      if (userId.email) return userId.email;
      
      // If there's an _id but no name property, try to return the _id
      if (userId._id) return `ID: ${this.truncateId(userId._id)}`;
    }

    // If userId is just a string ID
    if (typeof userId === 'string') {
      // Ideally you would call a service to get the user details
      // userService.getUserById(userId).subscribe(...)
      return `ID: ${this.truncateId(userId)}`;
    }

    return 'Không xác định';
  }

  // Truncate long IDs
  truncateId(id: string): string {
    if (!id) return '';
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  }
}