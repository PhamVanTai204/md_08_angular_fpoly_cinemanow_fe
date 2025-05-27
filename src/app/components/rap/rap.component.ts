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
  userCinemaId: string = ''; // ID rạp mà user đang làm việc
  userCinemaName: string = ''; // Tên rạp mà user đang làm việc
  canAddCinema: boolean = false;
  canEditCinema: boolean = false;
  canDeleteCinema: boolean = false;
  canViewCinemaDetails: boolean = false;
  canAddRoom: boolean = false;

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
    
    // Nếu là Cinema Admin (role 2), tự động lấy rạp của họ để thêm phòng
    if (this.currentUser && this.currentUser.role === 2) {
      this.getUserCinema();
    }
  }

  /**
   * Lấy thông tin rạp mà user đang làm việc (cho role 2)
   */
  private getUserCinema(): void {
    // Lấy cinema_id từ thông tin user trong localStorage
    if (this.currentUser.cinema_id || this.currentUser.cinemaId) {
      this.userCinemaId = this.currentUser.cinema_id || this.currentUser.cinemaId;
      console.log('User làm việc tại rạp ID:', this.userCinemaId);
      
      // Tìm tên rạp từ danh sách
      this.updateUserCinemaName();
    } else {
      console.warn('User role 2 nhưng không có cinema_id!');
    }
  }

  /**
   * Cập nhật tên rạp từ ID
   */
  private updateUserCinemaName(): void {
    if (this.userCinemaId && this.rapList.length > 0) {
      const cinema = this.rapList.find(rap => rap.id === this.userCinemaId);
      if (cinema) {
        this.userCinemaName = cinema.cinemaName;
        console.log('Tên rạp của user:', this.userCinemaName);
      }
    }
  }
  /**
   * Set permissions based on user role
   */
  private setPermissions(): void {
    if (!this.currentUser) return;

    switch (this.currentUser.role) {
      case 2: // Cinema Admin (Quản trị rạp)
        // Role 2 chỉ được phép thêm phòng cho rạp của mình
        this.canAddCinema = false; // KHÔNG được thêm rạp
        this.canEditCinema = false; // KHÔNG được sửa rạp
        this.canDeleteCinema = false; // KHÔNG được xóa rạp
        this.canViewCinemaDetails = false; // KHÔNG được xem chi tiết rạp
        this.canAddRoom = true; // Chỉ được thêm phòng cho rạp của mình
        break;
      case 4: // System Admin (Quản trị hệ thống)
        // Role 4 chỉ được phép thêm/xóa rạp, không được thêm phòng
        this.canAddCinema = true; // Được thêm rạp
        this.canEditCinema = false; // KHÔNG được sửa rạp (theo yêu cầu mới)
        this.canDeleteCinema = true; // Được xóa rạp
        this.canViewCinemaDetails = false; // KHÔNG được xem chi tiết rạp
        this.canAddRoom = false; // KHÔNG được thêm phòng
        break;
      default:
        this.canAddCinema = false;
        this.canEditCinema = false;
        this.canDeleteCinema = false;
        this.canViewCinemaDetails = false;
        this.canAddRoom = false;
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
    if (!this.canAddRoom) {
      if (this.currentUser.role === 4) {
        alert('Quản trị hệ thống chỉ được phép thêm/xóa rạp, không được thêm phòng!');
      } else {
        alert('Bạn không có quyền thêm phòng!');
      }
      return;
    }
    
    // For role 2 (Cinema Admin), automatically use their cinema
    if (this.currentUser.role === 2) {
      if (!this.userCinemaId) {
        alert('Không tìm thấy thông tin rạp của bạn. Vui lòng liên hệ quản trị viên!');
        return;
      }
      this.selectedCinemaId = this.userCinemaId;
      console.log('Tự động chọn rạp của Cinema Admin:', this.userCinemaId, '-', this.userCinemaName);
    }
    
    this.isAddRoomModalOpen = true;
    this.newRoom = new RoomDto();
  }

  closeAddRoomModal(): void {
    this.isAddRoomModalOpen = false;
  }

  saveNewRoom(): void {
    if (!this.canAddRoom) {
      if (this.currentUser.role === 4) {
        alert('Quản trị hệ thống chỉ được phép thêm/xóa rạp, không được thêm phòng!');
      } else {
        alert('Bạn không có quyền thêm phòng!');
      }
      return;
    }

    // Đảm bảo Cinema Admin chỉ có thể thêm phòng cho rạp của mình
    if (this.currentUser.role === 2) {
      if (!this.userCinemaId) {
        alert('Không tìm thấy thông tin rạp của bạn!');
        return;
      }
      // Bắt buộc sử dụng rạp của Cinema Admin
      this.selectedCinemaId = this.userCinemaId;
    }

    if (!this.selectedCinemaId) {
      alert('Không có rạp nào được chọn để thêm phòng.');
      return;
    }

    // Kiểm tra quyền: Cinema Admin chỉ được thêm phòng cho rạp của mình
    if (this.currentUser.role === 2 && this.selectedCinemaId !== this.userCinemaId) {
      alert('Bạn chỉ có thể thêm phòng cho rạp của mình!');
      return;
    }

    console.log(`Cinema Admin ${this.currentUser.user_name || 'Unknown'} đang thêm phòng cho rạp: ${this.userCinemaName} (ID: ${this.selectedCinemaId})`);

    this.roomService.createRoom(this.selectedCinemaId, this.room_name, this.room_style, this.cols * this.rows).subscribe({
      next: (addedRoom: RoomDto) => {
        console.log('Phòng đã tạo:', addedRoom);

        // Gọi API tạo ghế ngay sau khi tạo phòng
        this.seatService.addMultipleSeats(addedRoom.id, this.rows, this.cols, this.price_seat).subscribe({
          next: (res) => {
            console.log('Ghế đã được tạo:', res);
            alert(`Đã thêm phòng "${this.room_name}" thành công vào rạp ${this.userCinemaName}!`);
            this.isAddRoomModalOpen = false;
            // Reset form fields
            this.room_name = '';
            this.room_style = '';
            this.rows = 0;
            this.cols = 0;
            this.price_seat = 0;
            this.selectedCinemaId = '';
          },
          error: (err) => {
            console.error('Lỗi khi tạo ghế:', err);
            alert('Phòng đã được tạo nhưng có lỗi khi tạo ghế!');
          }
        });
      },
      error: (err) => {
        console.error('Lỗi khi thêm phòng:', err);
        alert('Có lỗi xảy ra khi thêm phòng!');
      }
    });
  }

  getAllRaps(): void {
    this.cinemasService.getCinemas().subscribe({
      next: (data) => {
        this.rapList = data;
        
        // Nếu là Cinema Admin (role 2), cập nhật tên rạp của họ
        if (this.currentUser && this.currentUser.role === 2) {
          this.updateUserCinemaName();
        }
      },
      error: (err) => {
        console.error('Error fetching cinemas:', err);
      }
    });
  }

  openAddModal(): void {
    if (!this.canAddCinema) {
      if (this.currentUser.role === 2) {
        alert('Quản trị rạp chỉ được phép thêm phòng, không được thêm rạp!');
      } else {
        alert('Bạn không có quyền thêm rạp!');
      }
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
      if (this.currentUser.role === 2) {
        alert('Quản trị rạp chỉ được phép thêm phòng, không được thêm rạp!');
      } else {
        alert('Bạn không có quyền thêm rạp!');
      }
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

  deleteRap(rap: CinemaDto): void {
    if (!this.canDeleteCinema) {
      if (this.currentUser.role === 2) {
        alert('Quản trị rạp chỉ được phép thêm phòng, không được xóa rạp!');
      } else {
        alert('Bạn không có quyền xóa rạp!');
      }
      return;
    }

    const confirmDelete = confirm(`Bạn có chắc muốn xóa rạp: ${rap.cinemaName}?`);
    if (!confirmDelete) return;

    this.cinemasService.deleteCinema(rap.id).subscribe({
      next: () => {
        this.rapList = this.rapList.filter(item => item.id !== rap.id);
        alert('Đã xóa rạp thành công!');
      },
      error: (err) => {
        console.error('Error deleting cinema:', err);
        alert('Có lỗi xảy ra khi xóa rạp!');
      }
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