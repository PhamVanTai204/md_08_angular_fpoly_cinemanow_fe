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

  // Validation errors
  validationErrors: { [key: string]: string } = {};

  // Modal variables
  showModal: boolean = false;
  isEdit: boolean = false;
  currentPhim: PhimDto = new PhimDto();
  editIndex: number | null = null;

  // Delete modal variables
  showDeleteModal: boolean = false;
  deletePhim: PhimDto | null = null;
  deletePassword: string = '';
  deletePasswordError: string = '';

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
  searchPhims(): void {
    this.isLoading = true;
    // Reset to page 1 when searching
    this.page = 1;

    this.phimService.getPhims(this.page, this.limit, this.searchTerm).subscribe({
      next: (films: PhimDto[]) => {
        this.danhSachPhim = films;
        this.danhSachPhimDaLoc = films;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching films:', error);
        this.isLoading = false;
      }
    });
  }
  loadPhims(): void {
    this.isLoading = true;
    console.log('Loading films for page:', this.page, 'limit:', this.limit);

    this.phimService.getPhims(this.page, this.limit, this.searchTerm).subscribe({
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

  // Reset validation errors
  resetValidationErrors(): void {
    this.validationErrors = {};
  }

  themPhim(): void {
    this.resetValidationErrors();
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
    this.resetValidationErrors();
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

    // Clear genre validation error if at least one genre is selected
    if (this.currentPhim.genre_film.length > 0) {
      delete this.validationErrors['genre_film'];
    }
  }

  validatePhimForm(): boolean {
    this.resetValidationErrors();
    let isValid = true;

    // Validate title
    if (!this.currentPhim.title || this.currentPhim.title.trim() === '') {
      this.validationErrors['title'] = 'Vui lòng nhập tên phim';
      isValid = false;
    } else if (this.currentPhim.title.trim().length < 2) {
      this.validationErrors['title'] = 'Tên phim phải có ít nhất 2 ký tự';
      isValid = false;
    } else if (this.currentPhim.title.trim().length > 200) {
      this.validationErrors['title'] = 'Tên phim không được vượt quá 200 ký tự';
      isValid = false;
    }

    // Validate director
    if (!this.currentPhim.director || this.currentPhim.director.trim() === '') {
      this.validationErrors['director'] = 'Vui lòng nhập tên đạo diễn';
      isValid = false;
    }

    // Validate age_limit
    if (!this.currentPhim.age_limit || this.currentPhim.age_limit <= 0) {
      this.validationErrors['age_limit'] = 'Vui lòng nhập giới hạn tuổi hợp lệ';
      isValid = false;
    } else if (this.currentPhim.age_limit > 21) {
      this.validationErrors['age_limit'] = 'Giới hạn tuổi không được vượt quá 21';
      isValid = false;
    }

    // Validate language
    if (!this.currentPhim.language || this.currentPhim.language.trim() === '') {
      this.validationErrors['language'] = 'Vui lòng nhập ngôn ngữ phim';
      isValid = false;
    }

    // Validate genre_film
    if (!this.currentPhim.genre_film || this.currentPhim.genre_film.length === 0) {
      this.validationErrors['genre_film'] = 'Vui lòng chọn ít nhất một thể loại phim';
      isValid = false;
    }

    // Validate image_film (poster URL)
    if (!this.currentPhim.image_film || this.currentPhim.image_film.trim() === '') {
      this.validationErrors['image_film'] = 'Vui lòng nhập URL hình ảnh poster';
      isValid = false;
    } else if (!this.isValidUrl(this.currentPhim.image_film)) {
      this.validationErrors['image_film'] = 'URL hình ảnh không hợp lệ';
      isValid = false;
    }

    // Validate trailer_film URL
    if (!this.currentPhim.trailer_film || this.currentPhim.trailer_film.trim() === '') {
      this.validationErrors['trailer_film'] = 'Vui lòng nhập URL trailer phim';
      isValid = false;
    } else if (!this.isValidUrl(this.currentPhim.trailer_film)) {
      this.validationErrors['trailer_film'] = 'URL trailer không hợp lệ';
      isValid = false;
    }

    // Validate duration
    if (!this.currentPhim.duration || this.currentPhim.duration.trim() === '') {
      this.validationErrors['duration'] = 'Vui lòng nhập thời lượng phim';
      isValid = false;
    }

    // Validate release_date
    if (!this.currentPhim.release_date) {
      this.validationErrors['release_date'] = 'Vui lòng chọn ngày phát hành';
      isValid = false;
    }

    // Validate end_date (must be after release_date)
    if (!this.currentPhim.end_date) {
      this.validationErrors['end_date'] = 'Vui lòng chọn ngày kết thúc';
      isValid = false;
    } else if (new Date(this.currentPhim.end_date) < new Date(this.currentPhim.release_date)) {
      this.validationErrors['end_date'] = 'Ngày kết thúc phải sau ngày phát hành';
      isValid = false;
    }

    // Validate cast
    if (!this.currentPhim.cast || this.currentPhim.cast.trim() === '') {
      this.validationErrors['cast'] = 'Vui lòng nhập danh sách diễn viên';
      isValid = false;
    }

    // Validate ratings
    if (this.currentPhim.ratings < 0 || this.currentPhim.ratings > 10) {
      this.validationErrors['ratings'] = 'Đánh giá phải từ 0 đến 10';
      isValid = false;
    }

    // Validate describe (description)
    if (!this.currentPhim.describe || this.currentPhim.describe.trim() === '') {
      this.validationErrors['describe'] = 'Vui lòng nhập mô tả phim';
      isValid = false;
    } else if (this.currentPhim.describe.trim().length < 10) {
      this.validationErrors['describe'] = 'Mô tả phim phải có ít nhất 10 ký tự';
      isValid = false;
    }

    return isValid;
  }

  // Helper method to validate URLs
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
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
      // Scroll to first error
      setTimeout(() => {
        const firstErrorField = document.querySelector('.error-field');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
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
          alert('Cập nhật phim thất bại! ' + (error.message || 'Lỗi không xác định'));
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
          alert('Thêm phim thất bại! ' + (error.message || 'Lỗi không xác định'));
        }
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.resetValidationErrors();
  }

  xoaPhim(phim: PhimDto, index: number): void {
    this.deletePhim = phim;
    this.showDeleteModal = true;
    this.deletePassword = '';
    this.deletePasswordError = '';
  }

  confirmXoaPhim(): void {
    if (!this.deletePhim) return;

    if (this.deletePassword !== 'hiendz') {
      this.deletePasswordError = 'Mật khẩu không chính xác!';
      return;
    }

    const phimId = this.deletePhim.id ? this.getIdAsString(this.deletePhim.id) : null;
    if (!phimId) {
      alert('Không thể xóa phim: ID không tồn tại!');
      return;
    }

    this.phimService.deletePhim(phimId).subscribe({
      next: () => {
        this.loadPhims();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Error deleting film:', error);
        alert('Xóa phim thất bại: ' + (error.message || 'Lỗi không xác định'));
      }
    });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletePhim = null;
    this.deletePassword = '';
    this.deletePasswordError = '';
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