import { Component, OnInit } from '@angular/core';
import { CinemasService } from '../../../shared/services/cinemas.service';
import { CinemaDto } from '../../../shared/dtos/cinemasDto.dto';

@Component({
  selector: 'app-rap',
  standalone: false,
  templateUrl: './rap.component.html',
  styleUrls: ['./rap.component.css']
})
export class RapComponent implements OnInit {
  rapList: CinemaDto[] = [];

  // Modal thêm
  isAddModalOpen = false;
  newRap: CinemaDto = new CinemaDto();

  // Modal sửa
  isEditModalOpen = false;
  editRapIndex: number = -1;
  editRapData: CinemaDto = new CinemaDto();

  constructor(private cinemasService: CinemasService) { }

  ngOnInit(): void {
    this.getAllRaps();
  }

  // ====== Lấy danh sách rạp ======
  getAllRaps(): void {
    this.cinemasService.getCinemas().subscribe({
      next: (data) => {
        this.rapList = data;
      },
      error: (err) => {
        console.error('Error fetching cinemas:', err);
      }
    });
  }

  // ====== Thêm rạp ======
  openAddModal(): void {
    this.isAddModalOpen = true;
    this.newRap = new CinemaDto();
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
  }

  saveNewRap(): void {
    this.cinemasService.addCinema(this.newRap).subscribe({
      next: (addedCinema: CinemaDto) => {
        // Thêm vào danh sách hiện có
        this.rapList = [...this.rapList, addedCinema];
        // Đóng modal, reset form
        this.isAddModalOpen = false;
        this.newRap = new CinemaDto();
      },
      error: (err) => console.error('Error adding cinema:', err)
    });
  }

  // ====== Sửa rạp ======
  openEditModal(rap: CinemaDto, index: number): void {
    this.editRapIndex = index;
    this.editRapData = rap.clone(); // Tạo bản sao để tránh sửa trực tiếp
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editRapIndex = -1;
  }

  saveEditRap(): void {
    this.cinemasService.editCinema(this.editRapData.id, this.editRapData).subscribe({
      next: (updatedCinema: CinemaDto) => {
        if (this.editRapIndex > -1) {
          // Thay thế phần tử trong mảng
          this.rapList = this.rapList.map((rap, i) =>
            i === this.editRapIndex ? updatedCinema : rap
          );
        }
        this.isEditModalOpen = false;
        this.editRapIndex = -1;
      },
      error: (err) => console.error('Error updating cinema:', err)
    });
  }

  // ====== Xóa rạp ======
  deleteRap(rap: CinemaDto): void {
    const confirmDelete = confirm(`Bạn có chắc muốn xóa rạp: ${rap.cinemaName}?`);
    if (!confirmDelete) return;

    this.cinemasService.deleteCinema(rap.id).subscribe({
      next: () => {
        // Loại bỏ rạp khỏi danh sách
        this.rapList = this.rapList.filter(item => item.id !== rap.id);
      },
      error: (err) => console.error('Error deleting cinema:', err)
    });
  }
}
