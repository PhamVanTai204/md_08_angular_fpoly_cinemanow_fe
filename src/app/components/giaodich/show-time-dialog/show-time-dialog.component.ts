import { Component, OnInit } from '@angular/core';
import { CinemasService } from '../../../../shared/services/cinemas.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CinemaDto } from '../../../../shared/dtos/cinemasDto.dto';
import { Router } from '@angular/router';
import { UserService } from '../../../../shared/services/user.service'; // Import UserService
import { ShowtimesService } from '../../../../shared/services/showtimes.service';

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
  error: string | null = null;
  currentUser: any = null; // Thông tin user hiện tại

  ngOnInit(): void {
    this.getCurrentUser();
    this.loadCinemas(this.id);
  }

  constructor(
    private cinemasService: CinemasService,
    private showtimesService: ShowtimesService,

    private _modalService: BsModalService,
    private router: Router,
    private userService: UserService // Inject UserService
  ) { }

  // Lấy thông tin user hiện tại
  getCurrentUser(): void {
    this.currentUser = this.userService.getCurrentUser();
    console.log('Current user in ShowTimeDialog:', this.currentUser);
    console.log('User cinema:', this.currentUser?.cinema_name);
  }

  closeModal() {
    this._modalService.hide();
  }

  loadCinemas(id: string): void {
    this.isLoading = true;

    this.cinemasService.getCinemaByFilm(id).subscribe({
      next: (data) => {
        this.allCinemas = data; // Lưu tất cả rạp
        console.log('All cinemas from API:', this.allCinemas);

        // Filter chỉ giữ rạp của user hiện tại
        this.filterCinemasByUser();

        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Đã xảy ra lỗi khi tải danh sách rạp';
        this.isLoading = false;
      }
    });
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
}