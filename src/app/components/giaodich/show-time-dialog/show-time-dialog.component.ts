import { Component, OnInit } from '@angular/core';
import { CinemasService } from '../../../../shared/services/cinemas.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CinemaDto } from '../../../../shared/dtos/cinemasDto.dto';
import { Router } from '@angular/router';
import { ShowtimeDateGroup, ShowtimesByMovieAndCinemaResponse, ShowtimesService } from '../../../../shared/services/showtimes.service';

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
  error: string | null = null;
  idCinema: string = '';
  showtimesData: ShowtimeDateGroup[] = [];
  ngOnInit(): void {
    // Lấy userCinemaId từ localStorage
    this.idCinema = localStorage.getItem('userCinemaId') || '';
    if (this.id) {
      this.loadShowtimesByMovieAndCinema(this.id, this.idCinema)
    } else {
      this.error = 'Không tìm thấy userCinemaId trong localStorage';
    }
    this.loadShowtimesByMovieAndCinema(this.id, this.idCinema)

  }
  constructor(
    private cinemasService: CinemasService,
    private showtimesService: ShowtimesService,

    private _modalService: BsModalService,
    private router: Router


  ) { }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

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
        this.error = 'Đã xảy ra lỗi khi tải suất chiếu';
        this.isLoading = false;
        console.error('Error loading showtimes:', err);
      }
    });
  }
  closeModal() {
    this._modalService.hide();
  }

  loadCinemas(id: string): void {
    this.cinemasService.getCinemaByFilm(id).subscribe({
      next: (data) => {
        this.cinemas = data;
        this.isLoading = false;
        console.log(this.cinemas, "chkhk");

      },
      error: (err) => {
        this.error = err.message || 'Đã xảy ra lỗi khi tải danh sách rạp';
        this.isLoading = false;
      }
    });
  }
  showRomDialog(idRoom: string, showtimeId: string = ''): void {
    this._modalService.hide();

    this.router.navigate(['/layout/room', idRoom, showtimeId, '0']);
  }
}
