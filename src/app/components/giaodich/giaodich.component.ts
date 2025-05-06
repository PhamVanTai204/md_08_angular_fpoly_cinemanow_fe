import { Component, OnInit } from '@angular/core';
import { PhimDto } from '../../../shared/dtos/phimDto.dto';
import { GenresDto } from '../../../shared/dtos/genresDto.dto';
import { PhimService } from '../../../shared/services/phim.service';
import { GenresService } from '../../../shared/services/genres.service';
import { CinemasService } from '../../../shared/services/cinemas.service';
import { CinemaDto } from '../../../shared/dtos/cinemasDto.dto';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ShowTimeDialogComponent } from './show-time-dialog/show-time-dialog.component';

@Component({
  selector: 'app-giaodich',
  standalone: false,
  templateUrl: './giaodich.component.html',
  styleUrls: ['./giaodich.component.css']
})
export class GiaodichComponent implements OnInit {
  Math = Math;
  searchTerm: string = '';
  danhSachPhim: PhimDto[] = [];
  danhSachTheLoai: GenresDto[] = [];
  page: number = 1;
  limit: number = 10;
  totalPhim: number = 0;
  isLoading: boolean = false;
  cinemas: CinemaDto[] = [];
  error: string | null = null;
  danhSachPhimDaLoc: PhimDto[] = []; // Separate property for filtered results

  filmId: string = '';
  constructor(
    private phimService: PhimService,
    private _modalService: BsModalService

  ) { }

  ngOnInit(): void {
    this.loadPhims();
  }



  showCreateOrEditProductDialog(id?: string): void {
    let createOrEditProductDialog: BsModalRef;
    createOrEditProductDialog = this._modalService.show(
      ShowTimeDialogComponent,
      {
        class: "modal-lg",
        initialState: {
          id: id
        },
      }
    );


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
  // Thêm vào GiaodichComponent
  get totalPages(): number {
    return Math.ceil(this.totalPhim / this.limit) || 1;
  }

  changePage(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages) {
      return;
    }

    this.page = newPage;
    this.loadPhims();

    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onLimitChange(): void {
    // Reset to page 1 when changing limit to avoid empty pages
    this.page = 1;

    // Load films with new pagination settings
    this.loadPhims();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
}