import { Component, OnInit } from '@angular/core';
import { PhimService } from '../../../shared/services/phim.service';
import { GenresService } from '../../../shared/services/genres.service';
import { PhimDto } from '../../../shared/dtos/phimDto.dto';
import { GenresDto } from '../../../shared/dtos/genresDto.dto';

@Component({
  selector: 'app-phim',
  templateUrl: './phim.component.html',
  styleUrls: ['./phim.component.css'],
  standalone: false
})
export class PhimComponent implements OnInit {
  searchTerm: string = '';
  danhSachPhim: PhimDto[] = [];
  danhSachPhimDaLoc: PhimDto[] = []; // Separate property for filtered results
  danhSachTheLoai: GenresDto[] = [];
  page: number = 1;
  limit: number = 5;
  totalPhim: number = 0;
  isLoading: boolean = false;

  // Modal variables
  showModal: boolean = false;
  isEdit: boolean = false;
  currentPhim: PhimDto = new PhimDto();
  editIndex: number | null = null;

  // Delete modal variables
  showDeleteModal: boolean = false;
  deletePhim: PhimDto | null = null;
  deletePassword: string = '';

  constructor(
    private phimService: PhimService,
    private genresService: GenresService
  ) { }

  ngOnInit(): void {
    // First load genres, then load films
    this.loadGenres();
  }

  // Provide Math for template
  get Math() {
    return Math;
  }

  // Calculate total pages
  get totalPages(): number {
    return Math.ceil(this.totalPhim / this.limit) || 1;
  }

  // Get ID string from any object (ObjectId, object with _id, or string)
  private getIdAsString(idObject: any): string {
    if (!idObject) return '';

    if (typeof idObject === 'object' && idObject !== null) {
      // If it's a full genre object (with _id and name)
      if (idObject._id) {
        return idObject._id;
      }
      // If it's an ObjectId or has an id property
      if (idObject.id) {
        return idObject.id;
      }
      // If it's an ObjectId with toString()
      if (idObject.toString && typeof idObject.toString === 'function') {
        const str = idObject.toString();
        // Check if toString result is not "[object Object]"
        return str !== '[object Object]' ? str : '';
      }
    }

    // If already a string or other data type
    return String(idObject);
  }

  loadPhims(): void {
    this.isLoading = true;
    console.log('Loading films for page:', this.page, 'limit:', this.limit);
  
    this.phimService.getPhims(this.page, this.limit).subscribe({
      next: (response: any) => {
        console.log('Films loaded successfully:', response);
  
        // Check if we received an array directly (common API pattern)
        if (Array.isArray(response)) {
          this.danhSachPhim = response;
          
          // Since server might not provide total count in this case,
          // we might need to assume there are more pages if we received a full page
          if (response.length === this.limit) {
            // If we received exactly the number of items we requested,
            // there might be more (this is a simplified approach)
            this.totalPhim = Math.max((this.page * this.limit) + 1, this.totalPhim);
          } else if (this.page === 1) {
            // If we're on the first page and received fewer items than requested,
            // this is likely all there is
            this.totalPhim = response.length;
          }
        } 
        // Handle response with data property (your API seems to use this pattern)
        else if (response && typeof response === 'object') {
          // Handle various API response structures
          if (response.data && response.data.films) {
            // This seems to be your API's structure based on the service code
            this.danhSachPhim = response.data.films;
            this.totalPhim = response.data.totalCount || response.data.total || 0;
          } else if (response.items || response.results) {
            this.danhSachPhim = response.items || response.results;
            this.totalPhim = response.total || response.totalItems || response.count || 0;
          } else if (response.data && Array.isArray(response.data)) {
            this.danhSachPhim = response.data;
            this.totalPhim = response.totalCount || response.total || 0;
          }
        }
  
        // Make sure we're using the loaded data directly without additional filtering
        this.danhSachPhimDaLoc = this.danhSachPhim;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading films:', error);
        this.isLoading = false;
      }
    });
  }

  loadGenres(): void {
    this.genresService.getGenres().subscribe({
      next: (data: GenresDto[]) => {
        console.log('Genres loaded:', data);
        this.danhSachTheLoai = data;
        // Load films after genres are loaded
        this.loadPhims();
      },
      error: (error) => {
        console.error('Error loading genres:', error);
        // Still load films even if loading genres fails
        this.loadPhims();
      }
    });
  }

  // Handle page change
  changePage(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages) {
      return;
    }

    this.page = newPage;
    this.loadPhims();

    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Handles changing the number of items per page
  onLimitChange(): void {
    // Reset to page 1 when changing limit to avoid empty pages
    this.page = 1;
    
    // Load films with new pagination settings
    this.loadPhims();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Create page numbers array for pagination - improved version
  getPaginationRange(): number[] {
    const maxPagesToShow = 5;
    const totalPages = this.totalPages;
    
    // Simple case - show all pages if there are few
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Complex case - decide which pages to show
    let startPage = Math.max(1, this.page - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    
    // Adjust if we're near the end
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    return Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);
  }

  getGenreNames(genreItems: any[] | null | undefined): string {
    if (!genreItems || !Array.isArray(genreItems) || !this.danhSachTheLoai.length) return '';

    // Special case: if genreItems contains full genre objects (with name and _id)
    if (genreItems.length > 0 && typeof genreItems[0] === 'object' && genreItems[0].name) {
      return genreItems.map(item => item.name || '').filter(name => name).join(', ');
    }

    // Handle normal case: genreItems contains IDs or ObjectIds
    return genreItems
      .map(genreObj => {
        if (!genreObj) return '';

        // Get ID as string
        const genreId = this.getIdAsString(genreObj);
        if (!genreId) return '';

        // Find genre with ID
        const foundGenre = this.danhSachTheLoai.find(genre =>
          genre.id === genreId ||
          (genreId.length > 5 && genre.id.includes(genreId)) ||
          (genre.id.length > 5 && genreId.includes(genre.id))
        );

        return foundGenre?.genreName || '';
      })
      .filter(name => name !== '')
      .join(', ');
  }

  searchPhims(): void {
    if (this.searchTerm.trim() === '') {
      this.loadPhims();
      return;
    }
  
    this.isLoading = true;
    // Reset to page 1 when searching
    this.page = 1;
  
    this.phimService.searchPhims(this.searchTerm).subscribe({
      next: (response: any) => {
        // Handle response appropriately based on your API's structure
        if (Array.isArray(response)) {
          this.danhSachPhim = response;
          this.totalPhim = response.length;
        } else if (response && typeof response === 'object') {
          if (response.data && Array.isArray(response.data)) {
            this.danhSachPhim = response.data;
            this.totalPhim = response.totalCount || response.data.length;
          } else {
            this.danhSachPhim = response.items || response.results || [];
            this.totalPhim = response.total || response.totalItems || response.count || this.danhSachPhim.length;
          }
        }
  
        // Use the search results directly rather than filtering again
        this.danhSachPhimDaLoc = this.danhSachPhim;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching films:', error);
        this.isLoading = false;
      }
    });
  }

  updateFilteredList(): void {
    // When searching, we need to apply the filter to the loaded data
    if (this.searchTerm.trim()) {
      const lowerSearch = this.searchTerm.toLowerCase();
      this.danhSachPhimDaLoc = this.danhSachPhim.filter(phim =>
        phim.title.toLowerCase().includes(lowerSearch)
      );
    } else {
      // When not searching, use the loaded data directly
      this.danhSachPhimDaLoc = this.danhSachPhim;
    }
  }

  themPhim(): void {
    this.isEdit = false;
    this.editIndex = null;
    this.currentPhim = new PhimDto();
    // Use snake_case properties according to DTO
    this.currentPhim.status_film = 1;
    this.currentPhim.genre_film = [];
    this.currentPhim.release_date = new Date().toISOString().split('T')[0];
    this.currentPhim.end_date = new Date().toISOString().split('T')[0];
    // Initialize properties
    this.currentPhim.director = '';
    this.currentPhim.age_limit = 0;
    this.currentPhim.language = '';
    this.currentPhim.trailer_film = '';
    this.currentPhim.image_film = '';
    this.currentPhim.duration = '';
    this.currentPhim.title = '';
    this.currentPhim.describe = '';
    // Initialize new required fields
    this.currentPhim.cast = '';
    this.currentPhim.ratings = 0;
    this.currentPhim.box_office = 0;
    this.showModal = true;
  }

  suaPhim(phim: PhimDto, index: number): void {
    this.isEdit = true;
    this.editIndex = index;
    this.currentPhim = phim.clone();

    // Convert genre_film to array of string IDs
    if (this.currentPhim.genre_film && Array.isArray(this.currentPhim.genre_film)) {
      this.currentPhim.genre_film = this.currentPhim.genre_film.map(genreObj => this.getIdAsString(genreObj));
    } else {
      this.currentPhim.genre_film = [];
    }

    this.showModal = true;
  }

  toggleGenre(genreId: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    // Initialize genre_film if not exists
    if (!this.currentPhim.genre_film) {
      this.currentPhim.genre_film = [];
    }

    if (checked) {
      // Add genre if not already included
      if (!this.currentPhim.genre_film.includes(genreId)) {
        this.currentPhim.genre_film.push(genreId);
      }
    } else {
      // Remove genre from the list
      this.currentPhim.genre_film = this.currentPhim.genre_film.filter(id => id !== genreId);
    }
  }

  savePhim(): void {
    console.log('Saving film data:', this.currentPhim);

    // Ensure genre_film is array of string IDs
    if (this.currentPhim.genre_film && Array.isArray(this.currentPhim.genre_film)) {
      // Convert genre_film if needed
      this.currentPhim.genre_film = this.currentPhim.genre_film
        .map(genreObj => this.getIdAsString(genreObj))
        .filter(id => id); // Filter out empty values
    }

    if (!this.validatePhimForm()) {
      alert('Please fill in all film information!');
      return;
    }

    console.log('Sending to server:', this.currentPhim.toJSON());

    if (this.isEdit && this.currentPhim.id) {
      this.phimService.updatePhim(this.currentPhim.id, this.currentPhim).subscribe({
        next: (response) => {
          console.log('Update response:', response);
          this.loadPhims();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating film:', error);
          alert('Failed to update film! ' + (error.message || 'Unknown error'));
        }
      });
    } else {
      this.phimService.createPhim(this.currentPhim).subscribe({
        next: (response) => {
          console.log('Create response:', response);
          this.loadPhims();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error adding film:', error);
          alert('Failed to add film! ' + (error.message || 'Unknown error'));
        }
      });
    }
  }

  validatePhimForm(): boolean {
    return !!(
      this.currentPhim.title &&
      this.currentPhim.image_film &&
      this.currentPhim.genre_film?.length &&
      this.currentPhim.duration &&
      this.currentPhim.release_date &&
      this.currentPhim.director &&
      this.currentPhim.language &&
      this.currentPhim.age_limit && this.currentPhim.age_limit > 0 &&
      this.currentPhim.trailer_film &&
      this.currentPhim.describe &&
      this.currentPhim.cast &&
      this.currentPhim.ratings >= 0
    );
  }

  closeModal(): void {
    this.showModal = false;
  }

  xoaPhim(phim: PhimDto, index: number): void {
    this.deletePhim = phim;
    this.showDeleteModal = true;
    this.deletePassword = '';
  }

  confirmXoaPhim(): void {
    if (!this.deletePhim) return;

    if (this.deletePassword !== 'hiendz') {
      alert('Incorrect password!');
      return;
    }

    const phimId = this.deletePhim.id ? this.getIdAsString(this.deletePhim.id) : null;
    if (!phimId) {
      alert('Cannot delete film: ID does not exist!');
      return;
    }

    this.phimService.deletePhim(phimId).subscribe({
      next: () => {
        this.loadPhims();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Error deleting film:', error);
        alert('Failed to delete film!');
      }
    });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletePhim = null;
    this.deletePassword = '';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }

  getTrangThaiText(status: number): string {
    return status === 1 ? 'ONLINE' : 'OFFLINE';
  }
}