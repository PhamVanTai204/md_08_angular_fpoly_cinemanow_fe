import { Component, OnInit } from '@angular/core';
import { ComboService, Combo } from '../../../shared/services/combo.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-combo',
  templateUrl: './combo.component.html',
  styleUrls: ['./combo.component.css'],
  standalone: false
})
export class ComboComponent implements OnInit {
  // Danh sách combo
  combos: Combo[] = [];
  selectedCombo: Combo | null = null;
  
  // Loading state
  isLoading = false;
  errorMessage = '';
  
  // User info
  currentUserId: string | null = null;
  isAdminView = false;

  // Dialog control
  showDialog = false;
  showDeleteDialog = false;
  showDetailsDialog = false;
  
  // Form data
  newCombo: Partial<Combo> = {
    combo_id: '',
    name_combo: '',
    price_combo: 0,
    description_combo: '',
    image_combo: '',
    user_id: ''
  };
  
  // Edit/Delete tracking
  isEditing = false;
  editId = '';
  comboToDelete = { id: '', name: '' };

  // Pagination variables
  pageSize = 5; // Number of items per page
  currentPage = 1; // Current page
  totalItems = 0; // Total number of items
  totalPages = 0; // Total number of pages
  pagesToShow: number[] = []; // Pages to show in pagination control
  
  // Make Math available in the template
  Math = Math;

  constructor(
    private comboService: ComboService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    // Get current user ID
    this.currentUserId = this.userService.getCurrentUserId();
    
    // Check if admin
    const currentUser = this.userService.getCurrentUser();
    this.isAdminView = currentUser && currentUser.role === 2;
    
    // Verify login
    if (!this.userService.isLoggedIn()) {
      this.errorMessage = "Vui lòng đăng nhập để tiếp tục.";
      return;
    }

    // Load combo list
    this.loadAllCombos();
  }

  // Check if combos is a valid array with items
  isValidCombos(): boolean {
    return Array.isArray(this.combos) && this.combos.length > 0;
  }

  // Load all combos
  loadAllCombos(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.comboService.getAllCombos().subscribe({
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
  }

  // Get current page data
  get paginatedCombos(): Combo[] {
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

  // Load combo details
  loadComboDetails(id: string): void {
    this.isLoading = true;
    this.comboService.getComboById(id).subscribe({
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
  }
  
  // Close details dialog
  closeDetailsDialog(): void {
    this.showDetailsDialog = false;
    this.selectedCombo = null;
  }

  // Open dialog for add/edit
  openDialog(combo?: Combo): void {
    if (combo) {
      // Edit mode
      this.isEditing = true;
      this.editId = combo._id;
      this.newCombo = { ...combo };

      // Ensure user_id is a string, not an object
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

    // Prepare data for API
    const comboToCreate: Omit<Combo, '_id'> = {
      combo_id: this.newCombo.combo_id || '',
      name_combo: this.newCombo.name_combo || '',
      price_combo: Number(this.newCombo.price_combo) || 0,
      description_combo: this.newCombo.description_combo || '',
      image_combo: this.newCombo.image_combo || '',
      user_id: this.newCombo.user_id || this.currentUserId || ''
    };

    this.comboService.createCombo(comboToCreate).subscribe({
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
  }

  // Update existing combo
  updateCombo(): void {
    if (!this.editId) return;

    this.isLoading = true;

    // Prepare update data
    const comboToUpdate: Partial<Combo> = {
      combo_id: this.newCombo.combo_id,
      name_combo: this.newCombo.name_combo,
      price_combo: Number(this.newCombo.price_combo),
      description_combo: this.newCombo.description_combo,
      image_combo: this.newCombo.image_combo,
      user_id: this.newCombo.user_id || this.currentUserId || ''
    };

    this.comboService.updateCombo(this.editId, comboToUpdate).subscribe({
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
  }

  // Open delete confirmation dialog
  confirmDelete(id: string, name: string): void {
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
    
    this.comboService.deleteCombo(id).subscribe({
      next: () => {
        // If deleted combo was selected, deselect it
        if (this.selectedCombo && this.selectedCombo._id === id) {
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
  }

  // Reset form to defaults
  resetForm(): void {
    this.newCombo = {
      combo_id: '',
      name_combo: '',
      price_combo: 0,
      description_combo: '',
      image_combo: '',
      user_id: this.currentUserId || ''
    };
    this.isEditing = false;
    this.editId = '';
    this.errorMessage = '';
  }

  // Add to cart
  addToCart(combo: Combo): void {
    // TODO: Implement cart functionality
    console.log('Added to cart:', combo);
    // Show a success message
    this.errorMessage = ''; // Clear any existing errors
    alert(`Đã thêm ${combo.name_combo} vào giỏ hàng`);
  }
  
  // Format user ID for display
  displayUserId(userId: any): string {
    if (!userId) return 'N/A';
    
    if (typeof userId === 'string') {
      return userId.length > 8 ? userId.substring(0, 8) + '...' : userId;
    }
    
    if (typeof userId === 'object') {
      const id = userId._id || userId.userId || userId.id;
      if (id) {
        return this.displayUserId(id);
      }
    }
    
    return 'N/A';
  }
  
  // Truncate long IDs
  truncateId(id: string): string {
    if (!id) return '';
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  }
}