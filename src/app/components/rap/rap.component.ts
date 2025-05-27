import { Component, OnInit } from '@angular/core';
import { CinemasService } from '../../../shared/services/cinemas.service';
import { CinemaDto } from '../../../shared/dtos/cinemasDto.dto';
import { RoomService } from '../../../shared/services/room.service';
import { RoomDto } from '../../../shared/dtos/roomDto.dto';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { SeatService } from '../../../shared/services/seat.service';
import { SeatDto } from '../../../shared/dtos/seatDto.dto';
import { UserService } from '../../../shared/services/user.service';

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
  rows: number = 0;
  cols: number = 0;
  price_seat: number = 0;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;
  pagedRapList: CinemaDto[] = [];

  // Role permissions
  currentUser: any;
  canAddCinema: boolean = false;
  canEditCinema: boolean = false;
  canDeleteCinema: boolean = false;
  canViewCinemaDetails: boolean = false;
  canAddRoom: boolean = true; // Both role 2 and 4 can add rooms

  constructor(
    private cinemasService: CinemasService,
    private roomService: RoomService,
    private seatService: SeatService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.userService.getCurrentUser();
    this.setPermissions();
    this.getAllRaps();
  }

  /**
   * Set permissions based on user role
   */
  private setPermissions(): void {
    if (!this.currentUser) return;

    switch (this.currentUser.role) {
      case 2: // Cinema Admin
        this.canAddCinema = true;
        this.canEditCinema = false; // Cannot edit cinema
        this.canDeleteCinema = false; // Cannot delete cinema
        this.canViewCinemaDetails = true; // Can view details
        break;
      case 4: // System Admin
        this.canAddCinema = true;
        this.canEditCinema = true; // Can edit cinema
        this.canDeleteCinema = true; // Can delete cinema
        this.canViewCinemaDetails = true; // Can view details
        break;
      default:
        this.canAddCinema = false;
        this.canEditCinema = false;
        this.canDeleteCinema = false;
        this.canViewCinemaDetails = false;
        break;
    }
  }

  // Thêm biến để theo dõi trạng thái loading
  isDeletingRoom: boolean = false;
  deleteRoomError: string | null = null;

  async deleteRoom(index: number): Promise<void> {
    if (this.isDeletingRoom) return;

    if (index >= 0 && index < this.roomLisst.length) {
      const room = this.roomLisst[index];
      const confirmDelete = confirm(`Bạn có chắc muốn xóa phòng: ${room.room_name}?`);
      if (!confirmDelete) return;

      this.isDeletingRoom = true;
      this.deleteRoomError = null;

      try {
        // Gọi API xóa phòng
        await lastValueFrom(this.roomService.deleteRoom(room.id));
        this.getAllRaps();

        console.log('Đã xóa phòng thành công');
      } catch (error: any) {
        console.error('Lỗi khi xóa phòng:', error);
        this.deleteRoomError = error.message || 'Có lỗi xảy ra khi xóa phòng. Vui lòng thử lại.';
      } finally {
        this.isDeletingRoom = false;
      }
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

    this.roomService.createRoom(this.selectedCinemaId, this.room_name, this.room_style, this.cols * this.rows).subscribe({
      next: (addedRoom: RoomDto) => {
        console.log('Phòng đã tạo:', addedRoom);

        // Gọi API tạo ghế ngay sau khi tạo phòng
        this.seatService.addMultipleSeats(addedRoom.id, this.rows, this.cols, this.price_seat).subscribe({
          next: (res) => {
            console.log('Ghế đã được tạo:', res);
            this.getRoom(this.selectedCinemaId);
            this.isAddRoomModalOpen = false;
          },
          error: (err) => console.error('Lỗi khi tạo ghế:', err)
        });
      },
      error: (err) => console.error('Lỗi khi thêm phòng:', err)
    });
  }

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

  openAddModal(): void {
    if (!this.canAddCinema) {
      alert('Bạn không có quyền thêm rạp!');
      return;
    }
    this.isAddModalOpen = true;
    this.newRap = new CinemaDto();
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
  }

  saveNewRap(): void {
    if (!this.canAddCinema) {
      alert('Bạn không có quyền thêm rạp!');
      return;
    }

    // Gán cứng totalRoom = 0 khi thêm rạp mới
    this.newRap.totalRoom = 0;

    this.cinemasService.addCinema(this.newRap).subscribe({
      next: (addedCinema: CinemaDto) => {
        this.rapList = [...this.rapList, addedCinema];
        this.isAddModalOpen = false;
        this.newRap = new CinemaDto();
      },
      error: (err) => console.error('Error adding cinema:', err)
    });
  }

  async openEditModal(rap: CinemaDto, index: number): Promise<void> {
    if (!this.canViewCinemaDetails) {
      alert('Bạn không có quyền xem chi tiết rạp!');
      return;
    }

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
    if (!this.canEditCinema) {
      alert('Bạn không có quyền chỉnh sửa rạp!');
      return;
    }

    // Prepare the data in the format the service expects
    const editData = {
      cinema_name: this.editRapData.cinemaName,
      location: this.editRapData.location
    };

    this.cinemasService.editCinema(this.editRapData.id, editData).subscribe({
      next: (updatedCinema: CinemaDto) => {
        this.getAllRaps();
        this.isEditModalOpen = false;
      },
      error: (err) => console.error('Error updating cinema:', err)
    });
  }

  deleteRap(rap: CinemaDto): void {
    if (!this.canDeleteCinema) {
      alert('Bạn không có quyền xóa rạp!');
      return;
    }

    const confirmDelete = confirm(`Bạn có chắc muốn xóa rạp: ${rap.cinemaName}?`);
    if (!confirmDelete) return;

    this.cinemasService.deleteCinema(rap.id).subscribe({
      next: () => {
        this.rapList = this.rapList.filter(item => item.id !== rap.id);
      },
      error: (err) => console.error('Error deleting cinema:', err)
    });
  }

  editRoom(index: number): void {
    // Phương thức xử lý chỉnh sửa phòng
    console.log('Editing room at index:', index);
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
    this.router.navigate(['/layout', 'room', idRoom, '1', '1']);
  }
}