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
    this.loadPhims();
    this.loadGenres();
  }

  loadPhims(): void {
    this.isLoading = true;
    this.phimService.getPhims(this.page, this.limit).subscribe({
      next: (data: PhimDto[]) => {
        this.danhSachPhim = data;
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
        this.danhSachTheLoai = data;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách thể loại:', error);
      }
    });
  }

  getGenreNames(genreIds: string[]): string {
    if (!genreIds || !this.danhSachTheLoai.length) return '';
    
    return genreIds
      .map(id => this.danhSachTheLoai.find(genre => genre.id === id)?.genreName || '')
      .filter(name => name !== '')
      .join(', ');
  }

  searchPhims(): void {
    if (this.searchTerm.trim() === '') {
      this.loadPhims();
      return;
    }

    this.isLoading = true;
    this.phimService.searchPhims(this.searchTerm).subscribe({
      next: (data: PhimDto[]) => {
        this.danhSachPhim = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tìm kiếm phim:', error);
        this.isLoading = false;
      }
    });
  }

  get danhSachPhimDaLoc(): PhimDto[] {
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
    this.currentPhim.statusFilm = 1;
    this.currentPhim.genreFilm = [];
    this.currentPhim.releaseDate = new Date().toISOString().split('T')[0];
    this.currentPhim.endDate = new Date().toISOString().split('T')[0];
    this.showModal = true;
  }

  suaPhim(phim: PhimDto, index: number): void {
    this.isEdit = true;
    this.editIndex = index;
    this.currentPhim = phim.clone();
    this.showModal = true;
  }

  savePhim(): void {
    if (!this.validatePhimForm()) {
      alert('Vui lòng điền đầy đủ thông tin phim!');
      return;
    }

    if (this.isEdit && this.currentPhim.id) {
      this.phimService.updatePhim(this.currentPhim.id, this.currentPhim).subscribe({
        next: () => {
          this.loadPhims();
          this.closeModal();
        },
        error: (error) => {
          console.error('Lỗi khi cập nhật phim:', error);
          alert('Cập nhật phim thất bại!');
        }
      });
    } else {
      this.phimService.createPhim(this.currentPhim).subscribe({
        next: () => {
          this.loadPhims();
          this.closeModal();
        },
        error: (error) => {
          console.error('Lỗi khi thêm phim:', error);
          alert('Thêm phim thất bại!');
        }
      });
    }
  }

  validatePhimForm(): boolean {
    return !!(
      this.currentPhim.title &&
      this.currentPhim.imageFilm &&
      this.currentPhim.genreFilm?.length &&
      this.currentPhim.duration &&
      this.currentPhim.releaseDate
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

    this.phimService.deletePhim(this.deletePhim.id).subscribe({
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