import { Component, OnInit } from '@angular/core';
import { CinemasService } from '../../../../shared/services/cinemas.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CinemaDto } from '../../../../shared/dtos/cinemasDto.dto';
import { Router } from '@angular/router';
import { UserService } from '../../../../shared/services/user.service';
import { ShowtimeDateGroup, ShowtimesByMovieAndCinemaResponse, ShowtimesService } from '../../../../shared/services/showtimes.service';
import { forkJoin, timer } from 'rxjs';

@Component({
  selector: 'app-show-time-dialog',
  standalone: false,
  templateUrl: './show-time-dialog.component.html',
  styleUrl: './show-time-dialog.component.css'
})
export class ShowTimeDialogComponent implements OnInit {
  id: string = '';
  isLoading: boolean = false;
  cinemas: CinemaDto[] = [];
  allCinemas: CinemaDto[] = []; // Lưu tất cả rạp từ API
  error: any | null = null;
  error1: any | null = null;

  currentUser: any = null; // Thông tin user hiện tại
  showtimesData: ShowtimeDateGroup[] = [];
  idCinema: string = '';

  ngOnInit(): void {
    this.getCurrentUser();
    this.loadCinemas(this.id);
    this.idCinema = localStorage.getItem('userCinemaId') || '';
    if (this.id) {
      this.loadShowtimesByMovieAndCinema(this.id, this.idCinema)
    } else {
      this.error = 'Không tìm thấy userCinemaId trong localStorage';
    }
  }

  constructor(
    private cinemasService: CinemasService,
    private showtimesService: ShowtimesService,
    private _modalService: BsModalService,
    private router: Router,
    private userService: UserService // Inject UserService
  ) { }
  loadShowtimesByMovieAndCinema(movieId: string, cinemaId: string): void {
    this.isLoading = true;
    this.error = null;

    this.showtimesService.getShowtimesByMovieAndCinema(movieId, cinemaId).subscribe({
      next: (response: ShowtimesByMovieAndCinemaResponse) => {
        if (response.code === 200 && response.data) {
          this.showtimesData = response.data;
        } else {
          this.error = 'Không có dữ liệu suất chiếu';
        }
        console.log(this.showtimesData);

        this.isLoading = false;
      },
      error: (err) => {
        this.error1 = err.error;
        this.isLoading = false;
        console.error(this.error1);
      }
    });
  }
  // Lấy thông tin user hiện tại
  getCurrentUser(): void {
    this.currentUser = this.userService.getCurrentUser();
    console.log('Current user in ShowTimeDialog:', this.currentUser);
    console.log('User cinema:', this.currentUser?.cinema_name);
  }

  closeModal() {
    this._modalService.hide();
  }
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  // Load cinemas với delay 2 giây
  loadCinemas(id: string): void {
    this.isLoading = true;
    this.error = null;

    // Tạo timer 2 giây và kết hợp với API call
    const minimumDelay = timer(100); // 2 giây
    const apiCall = this.cinemasService.getCinemaByFilm(id);

    forkJoin([minimumDelay, apiCall]).subscribe({
      next: ([_, data]) => {
        this.allCinemas = data; // Lưu tất cả rạp
        console.log('All cinemas from API:', this.allCinemas);

        // Filter chỉ giữ rạp của user hiện tại
        this.filterCinemasByUser();

        this.isLoading = false;
        console.log('Dữ liệu rạp đã được tải sau delay 2 giây');
      },
      error: (err) => {
        this.error = err.message || 'Đã xảy ra lỗi khi tải danh sách rạp';
        this.isLoading = false;
        console.error('Error loading cinemas:', err);
      }
    });
  }

  // Refresh dữ liệu với delay
  refreshCinemas(): void {
    console.log('Đang làm mới dữ liệu rạp...');
    this.loadCinemas(this.id);
  }

  // Filter rạp theo user hiện tại
  filterCinemasByUser(): void {
    if (!this.currentUser?.cinema_name) {
      console.warn('No cinema_name found for current user');
      this.cinemas = [];
      return;
    }

    // Filter rạp theo cinema_name của user
    this.cinemas = this.allCinemas.filter(cinema => {
      console.log('Checking cinema:', cinema.cinemaName, 'vs user cinema:', this.currentUser?.cinema_name);
      return cinema.cinemaName === this.currentUser?.cinema_name;
    });

    console.log('Filtered cinemas for user cinema:', this.currentUser?.cinema_name, 'Total:', this.cinemas.length);
  }

  showRomDialog(idRoom: string, showtimeId: string = ''): void {
    this._modalService.hide();
    this.router.navigate(['/layout/room', idRoom, showtimeId, '0']);
  }

  // Retry khi có lỗi
  retryLoading(): void {
    this.error = null;
    this.loadCinemas(this.id);
  }
}