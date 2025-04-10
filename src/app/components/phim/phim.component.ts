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
  danhSachTheLoai: GenresDto[] = [];
  page: number = 1;
  limit: number = 10;
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
    // Đầu tiên tải thể loại, sau đó mới tải phim
    this.loadGenres();
  }

  // Cung cấp Math cho template
  get Math() {
    return Math;
  }

  // Tính tổng số trang
  get totalPages(): number {
    return Math.ceil(this.totalPhim / this.limit) || 1;
  }

  // Hàm lấy ID string từ bất kỳ đối tượng nào (ObjectId, object với _id, hoặc string)
  private getIdAsString(idObject: any): string {
    if (!idObject) return '';

    if (typeof idObject === 'object' && idObject !== null) {
      // Nếu là đối tượng thể loại đầy đủ (có _id và name)
      if (idObject._id) {
        return idObject._id;
      }
      // Nếu là ObjectId hoặc có thuộc tính id
      if (idObject.id) {
        return idObject.id;
      }
      // Nếu là ObjectId với toString()
      if (idObject.toString && typeof idObject.toString === 'function') {
        const str = idObject.toString();
        // Kiểm tra xem kết quả toString có phải là "[object Object]" không
        return str !== '[object Object]' ? str : '';
      }
    }

    // Nếu đã là string hoặc kiểu dữ liệu khác
    return String(idObject);
  }

  kiemTraTheLoaiPhim(phim: PhimDto): void {
    console.log('Phim:', phim.title);
    console.log('ID thể loại:', phim.genre_film);

    // Kiểm tra nếu genre_film chứa các đối tượng thể loại đầy đủ
    if (phim.genre_film && Array.isArray(phim.genre_film) && phim.genre_film.length > 0) {
      const firstGenre = phim.genre_film[0];
      console.log('Kiểm tra đối tượng thể loại đầu tiên:', firstGenre);

      if (typeof firstGenre === 'object' && firstGenre !== null) {
        // Kiểm tra các thuộc tính
        console.log('firstGenre._id:', (firstGenre as any)._id);
        console.log('firstGenre.name:', (firstGenre as any).name);

        // Nếu đây là đối tượng thể loại đầy đủ
        if ((firstGenre as any).name) {
          console.log('genre_film chứa các đối tượng thể loại đầy đủ!');
          return; // Không cần kiểm tra thêm
        }
      }

      // Tiếp tục kiểm tra các ID nếu không phải đối tượng thể loại đầy đủ
      console.log('Danh sách thể loại đã tải:', this.danhSachTheLoai);

      phim.genre_film.forEach((genreObj: any, index) => {
        console.log(`Genre #${index} gốc:`, genreObj);

        const genreId = this.getIdAsString(genreObj);
        console.log(`Genre #${index} sau khi chuyển đổi:`, genreId);

        // Tìm thể loại với ID
        if (genreId) {
          const foundGenre = this.danhSachTheLoai.find(g => g.id === genreId);
          console.log(`Thể loại khớp chính xác cho ID ${genreId}:`, foundGenre);

          if (!foundGenre) {
            // Tìm với so sánh một phần
            const partialMatches = this.danhSachTheLoai.filter(g =>
              (genreId.length > 5 && g.id.includes(genreId)) ||
              (g.id.length > 5 && genreId.includes(g.id))
            );
            console.log(`Thể loại khớp một phần cho ID ${genreId}:`, partialMatches);
          }
        }
      });
    }
  }
  suaPhim(phim: PhimDto, index: number): void {
    this.isEdit = true;
    this.editIndex = index;
    this.currentPhim = phim.clone();

    // Chuyển đổi genre_film thành mảng các ID string
    if (this.currentPhim.genre_film && Array.isArray(this.currentPhim.genre_film)) {
      this.currentPhim.genre_film = this.currentPhim.genre_film.map(genreObj => this.getIdAsString(genreObj));
    } else {
      this.currentPhim.genre_film = [];
    }

    this.showModal = true;
  }
  toggleGenre(genreId: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    // Khởi tạo genre_film nếu chưa có
    if (!this.currentPhim.genre_film) {
      this.currentPhim.genre_film = [];
    }

    if (checked) {
      // Thêm thể loại nếu chưa có
      if (!this.currentPhim.genre_film.includes(genreId)) {
        this.currentPhim.genre_film.push(genreId);
      }
    } else {
      // Loại bỏ thể loại khỏi danh sách
      this.currentPhim.genre_film = this.currentPhim.genre_film.filter(id => id !== genreId);
    }
  }

  loadPhims(): void {
    this.isLoading = true;
    console.log('Đang tải phim...');

    this.phimService.getPhims(this.page, this.limit).subscribe({
      next: (response: any) => {
        console.log('Tải phim thành công:', response);

        // Xử lý dữ liệu phản hồi tùy thuộc vào cấu trúc API
        if (response && typeof response === 'object' && response.data) {
          // Nếu API trả về cấu trúc { data: [...], totalCount: number }
          this.danhSachPhim = response.data;
          this.totalPhim = response.totalCount || 0;
        } else if (Array.isArray(response)) {
          // Nếu API trả về trực tiếp mảng phim
          this.danhSachPhim = response;
          this.totalPhim = response.length; // Có thể cần API riêng để lấy tổng số
        } else if (response && typeof response === 'object') {
          // Trường hợp API trả về { items: [...], total: number } hoặc cấu trúc tương tự
          this.danhSachPhim = response.items || response.results || [];
          this.totalPhim = response.total || response.totalItems || response.count || 0;
        }

        // Kiểm tra thể loại của phim đầu tiên nếu có
        if (this.danhSachPhim.length > 0) {
          this.kiemTraTheLoaiPhim(this.danhSachPhim[0]);
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách phim:', error);
        this.isLoading = false;
      }
    });
  }

  loadGenres(): void {
    this.genresService.getGenres().subscribe({
      next: (data: GenresDto[]) => {
        console.log('Genres received in PhimComponent:', data);
        this.danhSachTheLoai = data;

        // Check if genres have valid IDs
        if (this.danhSachTheLoai.length > 0) {
          console.log('First genre ID:', this.danhSachTheLoai[0].id);
          console.log('First genre name:', this.danhSachTheLoai[0].genreName);
        }

        // Tải phim sau khi đã tải xong thể loại
        this.loadPhims();
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách thể loại:', error);
        // Vẫn tải phim ngay cả khi tải thể loại thất bại
        this.loadPhims();
      }
    });
  }

  // Xử lý chuyển trang
  changePage(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages) {
      return;
    }

    this.page = newPage;
    this.loadPhims();

    // Cuộn lên đầu bảng khi chuyển trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Tạo mảng số trang cho phân trang
  getPaginationRange(): number[] {
    const maxPagesToShow = 5;

    let startPage = Math.max(1, this.page - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    return Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);
  }

  getGenreNames(genreItems: any[] | null | undefined): string {
    if (!genreItems || !Array.isArray(genreItems) || !this.danhSachTheLoai.length) return '';

    // Trường hợp đặc biệt: nếu genreItems chứa các đối tượng thể loại đầy đủ (có name và _id)
    if (genreItems.length > 0 && typeof genreItems[0] === 'object' && genreItems[0].name) {
      // Đây đã là các đối tượng thể loại đầy đủ, chỉ lấy tên
      return genreItems.map(item => item.name || '').filter(name => name).join(', ');
    }

    // Xử lý trường hợp thông thường: genreItems chứa ID hoặc ObjectId
    return genreItems
      .map(genreObj => {
        if (!genreObj) return '';

        // Lấy ID dưới dạng string
        const genreId = this.getIdAsString(genreObj);
        if (!genreId) return '';

        // Tìm thể loại với ID
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
    // Reset về trang 1 khi tìm kiếm
    this.page = 1;

    this.phimService.searchPhims(this.searchTerm).subscribe({
      next: (response: any) => {
        // Xử lý dữ liệu phản hồi tùy thuộc vào cấu trúc API
        if (response && typeof response === 'object' && response.data) {
          this.danhSachPhim = response.data;
          this.totalPhim = response.totalCount || 0;
        } else if (Array.isArray(response)) {
          this.danhSachPhim = response;
          this.totalPhim = response.length;
        } else if (response && typeof response === 'object') {
          this.danhSachPhim = response.items || response.results || [];
          this.totalPhim = response.total || response.totalItems || response.count || 0;
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tìm kiếm phim:', error);
        this.isLoading = false;
      }
    });
  }

  get danhSachPhimDaLoc(): PhimDto[] {
    // Áp dụng bộ lọc client-side nếu không có phân trang server-side
    if (!this.searchTerm.trim()) {
      return this.danhSachPhim;
    }

    const lowerSearch = this.searchTerm.toLowerCase();
    return this.danhSachPhim.filter(phim =>
      phim.title.toLowerCase().includes(lowerSearch)
    );
  }

  themPhim(): void {
    this.isEdit = false;
    this.editIndex = null;
    this.currentPhim = new PhimDto();
    // Sử dụng các thuộc tính snake_case theo DTO
    this.currentPhim.status_film = 1;
    this.currentPhim.genre_film = [];
    this.currentPhim.release_date = new Date().toISOString().split('T')[0];
    this.currentPhim.end_date = new Date().toISOString().split('T')[0];
    // Khởi tạo các thuộc tính
    this.currentPhim.director = '';
    this.currentPhim.age_limit = 0;
    this.currentPhim.language = '';
    this.currentPhim.trailer_film = '';
    this.currentPhim.image_film = '';
    this.currentPhim.duration = '';
    this.currentPhim.title = '';
    this.currentPhim.describe = '';
    // Khởi tạo các trường bắt buộc mới
    this.currentPhim.cast = '';
    this.currentPhim.ratings = 0;
    this.currentPhim.box_office = 0;
    this.showModal = true;
  }


  savePhim(): void {
    console.log('Saving film data:', this.currentPhim);

    // Đảm bảo genre_film là mảng các ID string
    if (this.currentPhim.genre_film && Array.isArray(this.currentPhim.genre_film)) {
      // Chuyển đổi genre_film nếu cần
      this.currentPhim.genre_film = this.currentPhim.genre_film
        .map(genreObj => this.getIdAsString(genreObj))
        .filter(id => id); // Lọc bỏ các giá trị rỗng
    }

    if (!this.validatePhimForm()) {
      alert('Vui lòng điền đầy đủ thông tin phim!');
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
          console.error('Lỗi khi cập nhật phim:', error);
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
          console.error('Lỗi khi thêm phim:', error);
          alert('Thêm phim thất bại! ' + (error.message || 'Lỗi không xác định'));
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
      alert('Mật khẩu sai!');
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
        console.error('Lỗi khi xóa phim:', error);
        alert('Xóa phim thất bại!');
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