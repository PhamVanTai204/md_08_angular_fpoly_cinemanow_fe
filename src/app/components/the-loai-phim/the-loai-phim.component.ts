import { Component, OnInit } from '@angular/core';
import { GenresService } from '../../../shared/services/genres.service';
import { GenresDto } from '../../../shared/dtos/genresDto.dto';

@Component({
  selector: 'app-the-loai-phim',
  templateUrl: './the-loai-phim.component.html',
  styleUrls: ['./the-loai-phim.component.css'],
  standalone: false
})
export class TheLoaiPhimComponent implements OnInit {
  // Dialog states
  showDialog = false;
  showEditDialog = false;
  showDeleteConfirm = false;
  
  // Form fields
  genreName = '';
  formSubmitted = false;
  
  // Data management
  genres: GenresDto[] = [];
  filteredGenres: GenresDto[] = [];
  editIndex: number | null = null;
  deleteIndex: number | null = null;
  
  // Search functionality
  searchTerm = '';
  
  // Loading state
  loading = false;
  
  // Pagination - cố định 10 hàng mỗi trang
  page = 1;
  pageSize = 9; // Luôn hiển thị 10 hàng
  totalPages = 1;

  constructor(private genresService: GenresService) { }

  ngOnInit(): void {
    this.loadGenres();
  }

  /**
   * Fetch all genres from the service
   */
  loadGenres(): void {
    this.loading = true;
    this.genresService.getGenres().subscribe({
      next: (data: GenresDto[]) => {
        console.log('Đã tải thể loại:', data);
        this.genres = data;
        this.filterGenres();
        this.calculateTotalPages();
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách thể loại:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Filter genres based on search term
   */
  filterGenres(): void {
    if (!this.searchTerm) {
      this.filteredGenres = [...this.genres];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredGenres = this.genres.filter(genre => 
        genre.genreName?.toLowerCase().includes(term)
      );
    }
    this.calculateTotalPages();
    // Reset to first page when filter changes
    this.page = 1; 
  }
  
  /**
   * Calculate total pages for pagination
   */
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredGenres.length / this.pageSize);
    if (this.totalPages === 0) this.totalPages = 1;
  }
  
  /**
   * Navigate to previous page
   */
  previousPage(): void {
    if (this.page > 1) {
      this.page--;
    }
  }
  
  /**
   * Navigate to next page
   */
  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }
  
  /**
   * Get items for the current page
   */
  getCurrentPageItems(): GenresDto[] {
    const startIndex = (this.page - 1) * this.pageSize;
    return this.filteredGenres.slice(startIndex, startIndex + this.pageSize);
  }
  
  /**
   * Get empty rows to fill up to exactly 10 rows
   */
  getEmptyRows(): number[] {
    const currentItems = this.getCurrentPageItems().length;
    const emptyRowsCount = this.pageSize - currentItems;
    return Array(emptyRowsCount > 0 ? emptyRowsCount : 0).fill(0);
  }
  
  /**
   * Find the index in the original array based on item in filtered array
   */
  indexOfOriginal(genre: GenresDto): number {
    return this.genres.findIndex(g => g.id === genre.id);
  }

  /**
   * Open the add genre dialog
   */
  openDialog(): void {
    this.genreName = '';
    this.formSubmitted = false;
    this.showDialog = true;
  }

  /**
   * Close all dialogs and reset form
   */
  closeDialog(): void {
    this.showDialog = false;
    this.showEditDialog = false;
    this.showDeleteConfirm = false;
    this.genreName = '';
    this.editIndex = null;
    this.deleteIndex = null;
    this.formSubmitted = false;
  }

  /**
   * Save a new genre
   */
  saveGenre(): void {
    this.formSubmitted = true;
    
    if (this.genreName.trim()) {
      this.loading = true;
      
      const newGenre = new GenresDto();
      newGenre.genreName = this.genreName.trim();
      
      this.genresService.createGenre(newGenre).subscribe({
        next: () => {
          this.loadGenres();
          this.closeDialog();
          this.loading = false;
        },
        error: (error) => {
          console.error('Lỗi khi thêm thể loại:', error);
          this.loading = false;
        }
      });
    }
  }

  /**
   * Open the edit dialog
   */
  openEditDialog(index: number): void {
    this.editIndex = index;
    this.genreName = this.genres[index].genreName || '';
    this.formSubmitted = false;
    this.showEditDialog = true;
  }

  /**
   * Update an existing genre
   */
  updateGenre(): void {
    this.formSubmitted = true;
    
    if (this.genreName.trim() && this.editIndex !== null) {
      this.loading = true;
      
      const updatedGenre = new GenresDto();
      updatedGenre.id = this.genres[this.editIndex].id;
      updatedGenre.genreName = this.genreName.trim();
      
      this.genresService.updateGenre(updatedGenre.id, updatedGenre).subscribe({
        next: () => {
          this.loadGenres();
          this.closeDialog();
          this.loading = false;
        },
        error: (error) => {
          console.error('Lỗi khi cập nhật thể loại:', error);
          this.loading = false;
        }
      });
    }
  }

  /**
   * Open delete confirmation dialog
   */
  confirmDelete(index: number): void {
    this.deleteIndex = index;
    this.showDeleteConfirm = true;
  }
  
  /**
   * Cancel delete operation
   */
  cancelDelete(): void {
    this.deleteIndex = null;
    this.showDeleteConfirm = false;
  }

  /**
   * Delete a genre after confirmation
   */
  deleteGenre(): void {
    if (this.deleteIndex !== null) {
      this.loading = true;
      
      const genreToDelete = this.genres[this.deleteIndex];
      
      if (genreToDelete.id) {
        this.genresService.deleteGenre(genreToDelete.id).subscribe({
          next: () => {
            this.loadGenres();
            this.closeDialog();
            this.loading = false;
          },
          error: (error) => {
            console.error('Lỗi khi xóa thể loại:', error);
            this.loading = false;
          }
        });
      }
    }
  }
}