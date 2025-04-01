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

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;
  pagedRapList: CinemaDto[] = [];

  constructor(
    private cinemasService: CinemasService,
    private roomService: RoomService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getAllRaps();
  }

  // Phân trang
  updatePagedData(): void {
    this.totalPages = Math.ceil(this.rapList.length / this.pageSize);
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
    this.newRoom = new RoomDto();
  }

  closeAddRoomModal(): void {
    this.isAddRoomModalOpen = false;
  }

  saveNewRoom(): void {
    if (!this.selectedCinemaId) {
      console.error('Không có rạp nào được chọn để thêm phòng.');
      return;
    }

    this.roomService.createRoom(this.selectedCinemaId, this.room_name, this.room_style, this.total_seat).subscribe({
      next: (addedRoom: RoomDto) => {
        this.roomLisst.push(addedRoom);
        this.getRoom(this.selectedCinemaId);
        this.isAddRoomModalOpen = false;
      },
      error: (err) => console.error('Lỗi khi thêm phòng:', err)
    });
  }

  getAllRaps(): void {
    this.cinemasService.getCinemas().subscribe({
      next: (data) => {
        this.rapList = data;
        this.updatePagedData();
      },
      error: (err) => {
        console.error('Error fetching cinemas:', err);
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
    this.cinemasService.addCinema(this.newRap).subscribe({
      next: (addedCinema: CinemaDto) => {
        this.rapList = [...this.rapList, addedCinema];
        this.updatePagedData();
        this.isAddModalOpen = false;
        this.newRap = new CinemaDto();
      },
      error: (err) => console.error('Error adding cinema:', err)
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
    }
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editRapIndex = -1;
  }

  saveEditRap(): void {
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
      error: (err) => console.error('Error updating cinema:', err)
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
      error: (err) => console.error('Error deleting cinema:', err)
    });
  }

  editRoom(index: number): void {
    // Phương thức xử lý chỉnh sửa phòng
    console.log('Editing room at index:', index);
  }
  
  deleteRoom(index: number): void {
    // Phương thức xử lý xóa phòng
    if (index >= 0 && index < this.roomLisst.length) {
      const room = this.roomLisst[index];
      const confirmDelete = confirm(`Bạn có chắc muốn xóa phòng: ${room.room_name}?`);
      if (!confirmDelete) return;

      // Implement the delete functionality here
      console.log('Deleting room at index:', index);
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
        }
      });
  }

  // Fix: Move this method inside the class
  showRomDialog(idRoom: string): void {
    this.router.navigate(['/layout', 'room', idRoom]);
  }
}