import { Component, OnInit } from '@angular/core';
import { CinemasService } from '../../../../shared/services/cinemas.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CinemaDto } from '../../../../shared/dtos/cinemasDto.dto';
import { Router } from '@angular/router';

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

  ngOnInit(): void {
    this.loadCinemas(this.id)
  }
  constructor(
    private cinemasService: CinemasService,
    private _modalService: BsModalService,
    private router: Router


  ) { }
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
  showRomDialog(idRoom: string): void {
    this._modalService.hide();

    this.router.navigate(['/layout', 'room', idRoom]);
  }
}
