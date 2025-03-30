import { Component, OnInit } from '@angular/core';
import { ShowtimesService } from '../../../shared/services/showtimes.service';
import { ShowtimesDto } from '../../../shared/dtos/showtimesDto.dto';

@Component({
  selector: 'app-lich-chieu',
  templateUrl: './lich-chieu.component.html',
  styleUrls: ['./lich-chieu.component.css'],
  standalone: false
})
export class LichChieuComponent implements OnInit {
  searchTerm: string = '';
  dsShowtimes: ShowtimesDto[] = [];
  filteredShowtimes: ShowtimesDto[] = [];

  // Quản lý modal Thêm/Sửa
  isMainModalOpen: boolean = false;
  isEditing: boolean = false;
  showtimeForm: ShowtimesDto = new ShowtimesDto();

  // Quản lý modal Xoá
  isDeleteModalOpen: boolean = false;
  showtimeDangXoa: ShowtimesDto | null = null;
  deletePassword: string = '';

  constructor(private showtimesService: ShowtimesService) {}

  ngOnInit(): void {
    this.loadShowtimes();
  }

  loadShowtimes(): void {
    this.showtimesService.getAllShowtimes().subscribe({
      next: (data) => {
        this.dsShowtimes = data;
        this.filteredShowtimes = [...this.dsShowtimes];
        console.log('Loaded showtimes with names:', this.dsShowtimes);
      },
      error: (err) => {
        console.error('Error fetching showtimes:', err);
      }
    });
  }

  onSearch(): void {
    console.log('Search term:', this.searchTerm);
    if (!this.searchTerm.trim()) {
      this.filteredShowtimes = [...this.dsShowtimes];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredShowtimes = this.dsShowtimes.filter(showtime => 
      showtime.showtimeId.toLowerCase().includes(term) ||
      (showtime.movieName && showtime.movieName.toLowerCase().includes(term)) ||
      (showtime.roomName && showtime.roomName.toLowerCase().includes(term))
    );
  }

  // Mở modal Thêm
  openAddModal(): void {
    this.isEditing = false;
    this.isMainModalOpen = true;
    // Reset form
    this.showtimeForm = new ShowtimesDto({
      showtimeId: '',
      movieId: '',
      roomId: '',
      startTime: '',
      endTime: '',
      showDate: ''
    });
  }

  // Mở modal Sửa
  editSchedule(showtime: ShowtimesDto): void {
    this.isEditing = true;
    this.isMainModalOpen = true;
    this.showtimeForm = showtime.clone();
    console.log('Editing showtime:', this.showtimeForm);
  }

  // Đóng modal
  closeMainModal(): void {
    this.isMainModalOpen = false;
  }

  // Lưu khi bấm "LƯU"
  saveSchedule(): void {
    if (this.isEditing) {
      // Cập nhật
      if (!this.showtimeForm.id) {
        alert('Không tìm thấy ID!');
        return;
      }
      this.showtimesService.updateShowtime(this.showtimeForm.id, this.showtimeForm).subscribe({
        next: () => {
          alert('Cập nhật thành công!');
          this.isMainModalOpen = false;
          this.loadShowtimes();
        },
        error: (err) => {
          console.error('Update error:', err);
          alert('Lỗi cập nhật!');
        }
      });
    } else {
      // Thêm
      this.showtimesService.createShowtime(this.showtimeForm).subscribe({
        next: () => {
          alert('Thêm thành công!');
          this.isMainModalOpen = false;
          this.loadShowtimes();
        },
        error: (err) => {
          console.error('Creation error:', err);
          alert('Lỗi thêm!');
        }
      });
    }
  }

  // Mở modal Xoá
  deleteSchedule(showtime: ShowtimesDto): void {
    this.showtimeDangXoa = showtime;
    this.deletePassword = '';
    this.isDeleteModalOpen = true;
  }

  // Đóng modal Xoá
  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
  }

  // Xác nhận xoá
  confirmDelete(): void {
    // Yêu cầu mật khẩu "hiendz"
    if (this.deletePassword === 'hiendz') {
      if (!this.showtimeDangXoa?.id) {
        alert('Không tìm thấy ID để xoá!');
        return;
      }
      this.showtimesService.deleteShowtime(this.showtimeDangXoa.id).subscribe({
        next: () => {
          alert('Xoá thành công!');
          this.isDeleteModalOpen = false;
          this.loadShowtimes();
        },
        error: (err) => {
          console.error('Deletion error:', err);
          alert('Lỗi xoá!');
        }
      });
    } else {
      alert('Mật khẩu không đúng!');
    }
  }
}