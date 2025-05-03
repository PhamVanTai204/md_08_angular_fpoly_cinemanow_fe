import { Component, OnInit } from '@angular/core';
import { CinemasService } from '../../../shared/services/cinemas.service';
import { CinemaDto } from '../../../shared/dtos/cinemasDto.dto';
import { RoomService } from '../../../shared/services/room.service';
import { RoomDto } from '../../../shared/dtos/roomDto.dto';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rap',
  templateUrl: './rap.component.html',
  styleUrls: ['./rap.component.css'],
  standalone: false
})
export class RapComponent implements OnInit {
  rapList: CinemaDto[] = [];
  pagedRapList: CinemaDto[] = []; // Danh sách rạp đã phân trang
  roomLisst: RoomDto[] = [];
  isAddModalOpen = false;
  newRap: CinemaDto = new CinemaDto();
  isAddRoomModalOpen = false;
  newRoom: RoomDto = new RoomDto();
  selectedCinemaId: string = '';
  isEditModalOpen = false;
  editRapIndex: number = -1;
  editRapData: CinemaDto = new CinemaDto();

  cinema_id: string = '';
  room_name: string = '';
  room_style: string = '';
  total_seat: number = 0;

  // Thêm biến quản lý thông báo lỗi
  errorMessage: string = '';
  showError = false;

  // Thêm biến tìm kiếm
  searchText: string = '';

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;

  constructor(
    private cinemasService: CinemasService,
    private roomService: RoomService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getAllRaps();
  }

  // Hiển thị thông báo lỗi
  showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.showError = true;
    setTimeout(() => {
      this.showError = false;
    }, 5000); // Ẩn sau 5 giây
  }

  // Tìm kiếm rạp
  searchRaps(): void {
    if (this.searchText.trim() === '') {
      this.getAllRaps();
      return;
    }
    
    this.cinemasService.searchCinema(this.searchText).subscribe({
      next: (data) => {
        this.rapList = data;
        this.currentPage = 1; // Đặt lại về trang đầu tiên
        this.updatePagedData();
      },
      error: (err) => {
        console.error('Lỗi tìm kiếm rạp:', err);
        this.showErrorMessage('Lỗi tìm kiếm rạp. Vui lòng thử lại sau.');
      }
    });
  }

  // Phân trang
  updatePagedData(): void {
    this.totalPages = Math.ceil(this.rapList.length / this.pageSize);
    
    // Đảm bảo ít nhất có 1 trang
    if (this.totalPages === 0) {
      this.totalPages = 1;
    }
    
    // Đảm bảo trang hiện tại không vượt quá tổng số trang
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.pagedRapList = this.rapList.slice(startIndex, startIndex + this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedData();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedData();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedData();
    }
  }

  getPageNumbers(): (number | string)[] {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    const visiblePages = 5;
    
    if (totalPages <= visiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    
    pages.push(1);
    
    let rangeStart = Math.max(2, currentPage - 1);
    let rangeEnd = Math.min(totalPages - 1, currentPage + 1);
    
    while (rangeEnd - rangeStart < Math.min(visiblePages - 3, totalPages - 2)) {
      if (rangeStart > 2) {
        rangeStart--;
      } else if (rangeEnd < totalPages - 1) {
        rangeEnd++;
      } else {
        break;
      }
    }
    
    if (rangeStart > 2) {
      pages.push('...');
    }
    
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }
    
    if (rangeEnd < totalPages - 1) {
      pages.push('...');
    }
    
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  }

  openAddRoomModal(): void {
    this.isAddRoomModalOpen = true;
    // Reset form
    this.room_name = '';
    this.room_style = '';
    this.total_seat = 0;
  }

  closeAddRoomModal(): void {
    this.isAddRoomModalOpen = false;
  }

  saveNewRoom(): void {
    if (!this.selectedCinemaId) {
      this.showErrorMessage('Không có rạp nào được chọn để thêm phòng.');
      return;
    }

    if (!this.room_name || !this.room_style || this.total_seat <= 0) {
      this.showErrorMessage('Vui lòng điền đầy đủ thông tin phòng chiếu.');
      return;
    }

    this.roomService.createRoom(this.selectedCinemaId, this.room_name, this.room_style, this.total_seat).subscribe({
      next: (addedRoom: RoomDto) => {
        this.roomLisst.push(addedRoom);
        this.getRoom(this.selectedCinemaId);
        this.isAddRoomModalOpen = false;
        // Reset form
        this.room_name = '';
        this.room_style = '';
        this.total_seat = 0;
      },
      error: (err) => {
        console.error('Lỗi khi thêm phòng:', err);
        this.showErrorMessage('Không thể thêm phòng. Vui lòng thử lại sau.');
      }
    });
  }

  getAllRaps(): void {
    this.cinemasService.getCinemas().subscribe({
      next: (data) => {
        this.rapList = data;
        this.updatePagedData();
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách rạp:', err);
        this.showErrorMessage('Không thể tải danh sách rạp. Vui lòng thử lại sau.');
      }
    });
  }

  openAddModal(): void {
    this.isAddModalOpen = true;
    this.newRap = new CinemaDto();
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
  }

  saveNewRap(): void {
    // Thêm kiểm tra trước khi gọi API
    if (!this.newRap.cinemaName || !this.newRap.location || !this.newRap.totalRoom || this.newRap.totalRoom <= 0) {
      this.showErrorMessage('Vui lòng điền đầy đủ thông tin rạp.');
      return;
    }

    this.cinemasService.addCinema(this.newRap).subscribe({
      next: (addedCinema: CinemaDto) => {
        this.rapList = [...this.rapList, addedCinema];
        this.updatePagedData();
        this.isAddModalOpen = false;
        this.newRap = new CinemaDto();
      },
      error: (err) => {
        console.error('Lỗi khi thêm rạp:', err);
        this.showErrorMessage('Không thể thêm rạp. Vui lòng thử lại sau.');
      }
    });
  }

  async openEditModal(rap: CinemaDto, index: number): Promise<void> {
    const actualIndex = (this.currentPage - 1) * this.pageSize + index;
    this.editRapIndex = actualIndex;
    this.editRapData = rap.clone();
    this.isEditModalOpen = true;
    this.selectedCinemaId = rap.id;

    try {
      this.roomLisst = await lastValueFrom(this.roomService.getByCinemaId(rap.id));
      console.log(this.roomLisst, 'Danh sách phòng đã tải');
    } catch (error) {
      console.error('Lỗi khi tải danh sách phòng:', error);
      this.roomLisst = [];
      this.showErrorMessage('Không thể tải danh sách phòng. Vui lòng thử lại sau.');
    }
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editRapIndex = -1;
  }

  saveEditRap(): void {
    // Kiểm tra dữ liệu đầu vào
    if (!this.editRapData.cinemaName || !this.editRapData.location || !this.editRapData.totalRoom || this.editRapData.totalRoom <= 0) {
      this.showErrorMessage('Vui lòng điền đầy đủ thông tin rạp.');
      return;
    }

    this.cinemasService.editCinema(this.editRapData.id, this.editRapData).subscribe({
      next: (updatedCinema: CinemaDto) => {
        if (this.editRapIndex > -1) {
          this.rapList = this.rapList.map((rap, i) =>
            i === this.editRapIndex ? updatedCinema : rap
          );
          this.updatePagedData();
        }
        this.isEditModalOpen = false;
        this.editRapIndex = -1;
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật rạp:', err);
        this.showErrorMessage('Không thể cập nhật thông tin rạp. Vui lòng thử lại sau.');
      }
    });
  }

  deleteRap(rap: CinemaDto): void {
    const confirmDelete = confirm(`Bạn có chắc muốn xóa rạp: ${rap.cinemaName}?`);
    if (!confirmDelete) return;

    this.cinemasService.deleteCinema(rap.id).subscribe({
      next: () => {
        this.rapList = this.rapList.filter(item => item.id !== rap.id);
        this.updatePagedData();
      },
      error: (err) => {
        console.error('Lỗi khi xóa rạp:', err);
        this.showErrorMessage('Không thể xóa rạp. Vui lòng thử lại sau.');
      }
    });
  }

  editRoom(index: number): void {
    // Phương thức xử lý chỉnh sửa phòng
    console.log('Đang chỉnh sửa phòng với chỉ số:', index);
  }
  
  deleteRoom(index: number): void {
    if (index >= 0 && index < this.roomLisst.length) {
      const room = this.roomLisst[index];
      const confirmDelete = confirm(`Bạn có chắc muốn xóa phòng: ${room.room_name}?`);
      if (!confirmDelete) return;

      this.roomService.deleteRoom(room.id).subscribe({
        next: () => {
          this.roomLisst = this.roomLisst.filter(r => r.id !== room.id);
        },
        error: (err) => {
          console.error('Lỗi khi xóa phòng:', err);
          this.showErrorMessage('Không thể xóa phòng. Vui lòng thử lại sau.');
        }
      });
    }
  }
  
  getRoom(id: string): void {
    this.roomService.getByCinemaId(id)
      .subscribe({
        next: (result: RoomDto[]) => {
          this.roomLisst = result;
          console.log(this.roomLisst, 'Danh sách phòng');
        },
        error: (error) => {
          console.error('Lỗi khi lấy danh sách phòng:', error);
          this.showErrorMessage('Không thể tải danh sách phòng. Vui lòng thử lại sau.');
        }
      });
  }

  showRomDialog(idRoom: string): void {
    this.router.navigate(['/layout', 'room', idRoom]);
  }
}