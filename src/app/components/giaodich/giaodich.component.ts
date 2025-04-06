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
  searchTerm: string = '';
  danhSachPhim: PhimDto[] = [];
  danhSachTheLoai: GenresDto[] = [];
  page: number = 1;
  limit: number = 10;
  totalPhim: number = 0;
  isLoading: boolean = false;
  cinemas: CinemaDto[] = [];
  error: string | null = null;

  filmId: string = '';
  constructor(
    private phimService: PhimService,
    private cinemasService: CinemasService,
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
        console.log(this.danhSachPhim);

      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách phim:', error);
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
}