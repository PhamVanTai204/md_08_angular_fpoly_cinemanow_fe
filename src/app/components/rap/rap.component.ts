// rap.component.ts - Enhanced with comprehensive validation
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

  // Validation states
  cinemaValidation = {
    cinemaName: { isValid: true, message: '' },
    location: { isValid: true, message: '' }
  };

  roomValidation = {
    room_name: { isValid: true, message: '' },
    room_style: { isValid: true, message: '' },
    rows: { isValid: true, message: '' },
    cols: { isValid: true, message: '' },
    price_seat: { isValid: true, message: '' }
  };

  // Loading states
  isSubmittingCinema = false;
  isSubmittingRoom = false;

  // Search functionality
  searchTerm: string = '';
  filteredRapList: CinemaDto[] = [];
  filteredUserRooms: RoomDto[] = [];

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 1;
  pagedRapList: CinemaDto[] = [];

  // Role permissions
  currentUser: any;
  userCinemaId: string = '';
  userCinemaName: string = '';
  userRooms: RoomDto[] = [];
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
    
    if (this.currentUser && this.currentUser.role === 4) {
      this.getAllRaps();
    }
    
    if (this.currentUser && this.currentUser.role === 2) {
      this.getUserCinema();
      this.loadUserRooms();
    }
  }

  // ========== VALIDATION METHODS ==========

  /**
   * Validate cinema name
   */
  validateCinemaName(name: string): boolean {
    this.cinemaValidation.cinemaName.isValid = true;
    this.cinemaValidation.cinemaName.message = '';

    if (!name || name.trim().length === 0) {
      this.cinemaValidation.cinemaName.isValid = false;
      this.cinemaValidation.cinemaName.message = 'Tên rạp không được để trống';
      return false;
    }

    if (name.trim().length < 3) {
      this.cinemaValidation.cinemaName.isValid = false;
      this.cinemaValidation.cinemaName.message = 'Tên rạp phải có ít nhất 3 ký tự';
      return false;
    }

    if (name.trim().length > 100) {
      this.cinemaValidation.cinemaName.isValid = false;
      this.cinemaValidation.cinemaName.message = 'Tên rạp không được vượt quá 100 ký tự';
      return false;
    }

    // Check for special characters (allow Vietnamese characters)
    const validNamePattern = /^[a-zA-ZÀ-ỹ0-9\s\-\.]+$/;
    if (!validNamePattern.test(name.trim())) {
      this.cinemaValidation.cinemaName.isValid = false;
      this.cinemaValidation.cinemaName.message = 'Tên rạp chỉ được chứa chữ cái, số, dấu gạch ngang và dấu chấm';
      return false;
    }

    // Check for duplicate cinema names
    const isDuplicate = this.rapList.some(cinema => 
      cinema.cinemaName.toLowerCase().trim() === name.toLowerCase().trim()
    );
    if (isDuplicate) {
      this.cinemaValidation.cinemaName.isValid = false;
      this.cinemaValidation.cinemaName.message = 'Tên rạp đã tồn tại';
      return false;
    }

    return true;
  }

  /**
   * Validate cinema location
   */
  validateLocation(location: string): boolean {
    this.cinemaValidation.location.isValid = true;
    this.cinemaValidation.location.message = '';

    if (!location || location.trim().length === 0) {
      this.cinemaValidation.location.isValid = false;
      this.cinemaValidation.location.message = 'Thành phố không được để trống';
      return false;
    }

    if (location.trim().length < 2) {
      this.cinemaValidation.location.isValid = false;
      this.cinemaValidation.location.message = 'Thành phố phải có ít nhất 2 ký tự';
      return false;
    }

    if (location.trim().length > 100) {
      this.cinemaValidation.location.isValid = false;
      this.cinemaValidation.location.message = 'Thành phố không được vượt quá 100 ký tự';
      return false;
    }

    const validLocationPattern = /^[a-zA-ZÀ-ỹ0-9\s\-\,\.\/]+$/;
    if (!validLocationPattern.test(location.trim())) {
      this.cinemaValidation.location.isValid = false;
      this.cinemaValidation.location.message = 'Thành phố chứa ký tự không hợp lệ';
      return false;
    }

    return true;
  }

  /**
   * Validate room name
   */
  validateRoomName(name: string): boolean {
    this.roomValidation.room_name.isValid = true;
    this.roomValidation.room_name.message = '';

    if (!name || name.trim().length === 0) {
      this.roomValidation.room_name.isValid = false;
      this.roomValidation.room_name.message = 'Tên phòng không được để trống';
      return false;
    }

    if (name.trim().length < 2) {
      this.roomValidation.room_name.isValid = false;
      this.roomValidation.room_name.message = 'Tên phòng phải có ít nhất 2 ký tự';
      return false;
    }

    if (name.trim().length > 50) {
      this.roomValidation.room_name.isValid = false;
      this.roomValidation.room_name.message = 'Tên phòng không được vượt quá 50 ký tự';
      return false;
    }

    const validRoomNamePattern = /^[a-zA-ZÀ-ỹ0-9\s\-]+$/;
    if (!validRoomNamePattern.test(name.trim())) {
      this.roomValidation.room_name.isValid = false;
      this.roomValidation.room_name.message = 'Tên phòng chỉ được chứa chữ cái, số và dấu gạch ngang';
      return false;
    }

    // Check for duplicate room names in the same cinema
    const isDuplicate = this.userRooms.some(room => 
      room.room_name.toLowerCase().trim() === name.toLowerCase().trim()
    );
    if (isDuplicate) {
      this.roomValidation.room_name.isValid = false;
      this.roomValidation.room_name.message = 'Tên phòng đã tồn tại trong rạp này';
      return false;
    }

    return true;
  }

  /**
   * Validate room style
   */
  validateRoomStyle(style: string): boolean {
    this.roomValidation.room_style.isValid = true;
    this.roomValidation.room_style.message = '';

    if (!style || style.trim().length === 0) {
      this.roomValidation.room_style.isValid = false;
      this.roomValidation.room_style.message = 'Vui lòng chọn loại phòng';
      return false;
    }

    const validStyles = ['2D', '3D', 'IMAX'];
    if (!validStyles.includes(style)) {
      this.roomValidation.room_style.isValid = false;
      this.roomValidation.room_style.message = 'Loại phòng không hợp lệ';
      return false;
    }

    return true;
  }

  /**
   * Validate rows
   */
  validateRows(rows: number): boolean {
    this.roomValidation.rows.isValid = true;
    this.roomValidation.rows.message = '';

    if (!rows || rows <= 0) {
      this.roomValidation.rows.isValid = false;
      this.roomValidation.rows.message = 'Số hàng phải lớn hơn 0';
      return false;
    }

    if (rows > 30) {
      this.roomValidation.rows.isValid = false;
      this.roomValidation.rows.message = 'Số hàng không được vượt quá 30';
      return false;
    }

    if (!Number.isInteger(rows)) {
      this.roomValidation.rows.isValid = false;
      this.roomValidation.rows.message = 'Số hàng phải là số nguyên';
      return false;
    }

    return true;
  }

  /**
   * Validate columns
   */
  validateCols(cols: number): boolean {
    this.roomValidation.cols.isValid = true;
    this.roomValidation.cols.message = '';

    if (!cols || cols <= 0) {
      this.roomValidation.cols.isValid = false;
      this.roomValidation.cols.message = 'Số cột phải lớn hơn 0';
      return false;
    }

    if (cols > 50) {
      this.roomValidation.cols.isValid = false;
      this.roomValidation.cols.message = 'Số cột không được vượt quá 50';
      return false;
    }

    if (!Number.isInteger(cols)) {
      this.roomValidation.cols.isValid = false;
      this.roomValidation.cols.message = 'Số cột phải là số nguyên';
      return false;
    }

    // Check total seats limit
    if (this.rows && cols && (this.rows * cols > 500)) {
      this.roomValidation.cols.isValid = false;
      this.roomValidation.cols.message = 'Tổng số ghế không được vượt quá 500';
      return false;
    }

    return true;
  }

  /**
   * Validate seat price
   */
  validateSeatPrice(price: number): boolean {
    this.roomValidation.price_seat.isValid = true;
    this.roomValidation.price_seat.message = '';

    if (!price || price <= 0) {
      this.roomValidation.price_seat.isValid = false;
      this.roomValidation.price_seat.message = 'Giá ghế phải lớn hơn 0';
      return false;
    }

    if (price < 10000) {
      this.roomValidation.price_seat.isValid = false;
      this.roomValidation.price_seat.message = 'Giá ghế phải ít nhất 10,000 VNĐ';
      return false;
    }

    if (price > 1000000) {
      this.roomValidation.price_seat.isValid = false;
      this.roomValidation.price_seat.message = 'Giá ghế không được vượt quá 1,000,000 VNĐ';
      return false;
    }

    return true;
  }

  /**
   * Validate entire cinema form
   */
  validateCinemaForm(): boolean {
    const isNameValid = this.validateCinemaName(this.newRap.cinemaName);
    const isLocationValid = this.validateLocation(this.newRap.location);
    
    return isNameValid && isLocationValid;
  }

  /**
   * Validate entire room form
   */
  validateRoomForm(): boolean {
    const isNameValid = this.validateRoomName(this.room_name);
    const isStyleValid = this.validateRoomStyle(this.room_style);
    const isRowsValid = this.validateRows(this.rows);
    const isColsValid = this.validateCols(this.cols);
    const isPriceValid = this.validateSeatPrice(this.price_seat);
    
    return isNameValid && isStyleValid && isRowsValid && isColsValid && isPriceValid;
  }

  // ========== SEARCH FUNCTIONALITY ==========

  /**
   * Filter cinemas based on search term
   */
  onSearchCinemas(): void {
    if (!this.searchTerm || this.searchTerm.trim().length === 0) {
      this.filteredRapList = [...this.rapList];
    } else {
      const searchLower = this.searchTerm.toLowerCase().trim();
      this.filteredRapList = this.rapList.filter(cinema =>
        cinema.cinemaName.toLowerCase().includes(searchLower) ||
        cinema.location.toLowerCase().includes(searchLower)
      );
    }
  }

  /**
   * Filter rooms based on search term
   */
  onSearchRooms(): void {
    if (!this.searchTerm || this.searchTerm.trim().length === 0) {
      this.filteredUserRooms = [...this.userRooms];
    } else {
      const searchLower = this.searchTerm.toLowerCase().trim();
      this.filteredUserRooms = this.userRooms.filter(room =>
        room.room_name.toLowerCase().includes(searchLower) ||
        room.room_style.toLowerCase().includes(searchLower)
      );
    }
  }

  // ========== EVENT HANDLERS ==========

  /**
   * Handle cinema name input change
   */
  onCinemaNameChange(): void {
    this.validateCinemaName(this.newRap.cinemaName);
  }

  /**
   * Handle location input change
   */
  onLocationChange(): void {
    this.validateLocation(this.newRap.location);
  }

  /**
   * Handle room name input change
   */
  onRoomNameChange(): void {
    this.validateRoomName(this.room_name);
  }

  /**
   * Handle room style change
   */
  onRoomStyleChange(): void {
    this.validateRoomStyle(this.room_style);
  }

  /**
   * Handle rows input change
   */
  onRowsChange(): void {
    this.validateRows(this.rows);
    // Re-validate cols to check total seats
    if (this.cols) {
      this.validateCols(this.cols);
    }
  }

  /**
   * Handle columns input change
   */
  onColsChange(): void {
    this.validateCols(this.cols);
  }

  /**
   * Handle seat price input change
   */
  onSeatPriceChange(): void {
    this.validateSeatPrice(this.price_seat);
  }

  // ========== ENHANCED SAVE METHODS ==========

  /**
   * Enhanced save cinema with validation
   */
  async saveNewRap(): Promise<void> {
    if (!this.canAddCinema) {
      if (this.currentUser.role === 2) {
        alert('Quản trị rạp chỉ được phép thêm phòng, không được thêm rạp!');
      } else {
        alert('Bạn không có quyền thêm rạp!');
      }
      return;
    }

    // Validate form
    if (!this.validateCinemaForm()) {
      alert('Vui lòng kiểm tra lại thông tin nhập vào!');
      return;
    }

    this.isSubmittingCinema = true;

    try {
      // Trim whitespace
      this.newRap.cinemaName = this.newRap.cinemaName.trim();
      this.newRap.location = this.newRap.location.trim();
      this.newRap.totalRoom = 0;

      const addedCinema: CinemaDto = await lastValueFrom(
        this.cinemasService.addCinema(this.newRap)
      );
      
      this.rapList = [...this.rapList, addedCinema];
      this.filteredRapList = [...this.rapList];
      this.isAddModalOpen = false;
      this.newRap = new CinemaDto();
      this.resetCinemaValidation();
      
      alert(`Đã thêm rạp "${addedCinema.cinemaName}" thành công!`);
    } catch (error) {
      console.error('Error adding cinema:', error);
      alert('Có lỗi xảy ra khi thêm rạp. Vui lòng thử lại!');
    } finally {
      this.isSubmittingCinema = false;
    }
  }

  /**
   * Enhanced save room with validation
   */
  async saveNewRoom(): Promise<void> {
    if (!this.canAddRoom) {
      if (this.currentUser.role === 4) {
        alert('Quản trị hệ thống chỉ được phép thêm/xóa rạp, không được thêm phòng!');
      } else {
        alert('Bạn không có quyền thêm phòng!');
      }
      return;
    }

    // Validate form
    if (!this.validateRoomForm()) {
      alert('Vui lòng kiểm tra lại thông tin nhập vào!');
      return;
    }

    // Additional validations for Cinema Admin
    if (this.currentUser.role === 2) {
      if (!this.userCinemaId) {
        alert('Không tìm thấy thông tin rạp của bạn!');
        return;
      }
      this.selectedCinemaId = this.userCinemaId;
    }

    if (!this.selectedCinemaId) {
      alert('Không có rạp nào được chọn để thêm phòng.');
      return;
    }

    if (this.currentUser.role === 2 && this.selectedCinemaId !== this.userCinemaId) {
      alert('Bạn chỉ có thể thêm phòng cho rạp của mình!');
      return;
    }

    this.isSubmittingRoom = true;

    try {
      // Trim whitespace
      this.room_name = this.room_name.trim();
      
      const totalSeats = this.cols * this.rows;
      
      const addedRoom: RoomDto = await lastValueFrom(
        this.roomService.createRoom(this.selectedCinemaId, this.room_name, this.room_style, totalSeats)
      );

      // Create seats
      await lastValueFrom(
        this.seatService.addMultipleSeats(addedRoom.id, this.rows, this.cols, this.price_seat)
      );

      alert(`Đã thêm phòng "${this.room_name}" thành công vào rạp ${this.userCinemaName}!`);
      this.closeAddRoomModal();
      this.resetRoomForm();
      
      if (this.currentUser.role === 2) {
        this.loadUserRooms();
      }
    } catch (error) {
      console.error('Error adding room:', error);
      alert('Có lỗi xảy ra khi thêm phòng. Vui lòng thử lại!');
    } finally {
      this.isSubmittingRoom = false;
    }
  }

  // ========== UTILITY METHODS ==========

  /**
   * Reset cinema validation state
   */
  resetCinemaValidation(): void {
    this.cinemaValidation = {
      cinemaName: { isValid: true, message: '' },
      location: { isValid: true, message: '' }
    };
  }

  /**
   * Reset room validation state
   */
  resetRoomValidation(): void {
    this.roomValidation = {
      room_name: { isValid: true, message: '' },
      room_style: { isValid: true, message: '' },
      rows: { isValid: true, message: '' },
      cols: { isValid: true, message: '' },
      price_seat: { isValid: true, message: '' }
    };
  }

  /**
   * Reset room form
   */
  resetRoomForm(): void {
    this.room_name = '';
    this.room_style = '';
    this.rows = 0;
    this.cols = 0;
    this.price_seat = 0;
    this.selectedCinemaId = '';
    this.resetRoomValidation();
  }

  // ========== EXISTING METHODS (Updated) ==========

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.newRap = new CinemaDto();
    this.resetCinemaValidation();
  }

  closeAddRoomModal(): void {
    this.isAddRoomModalOpen = false;
    this.resetRoomForm();
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
    this.resetCinemaValidation();
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
    
    if (this.currentUser.role === 2) {
      if (!this.userCinemaId) {
        alert('Không tìm thấy thông tin rạp của bạn. Vui lòng liên hệ quản trị viên!');
        return;
      }
      this.selectedCinemaId = this.userCinemaId;
    }
    
    this.isAddRoomModalOpen = true;
    this.resetRoomForm();
  }

  // Keep all other existing methods unchanged...
  private getUserCinema(): void {
    if (this.currentUser.cinema_id || this.currentUser.cinemaId) {
      this.userCinemaId = this.currentUser.cinema_id || this.currentUser.cinemaId;
      console.log('User làm việc tại rạp ID:', this.userCinemaId);
      this.updateUserCinemaName();
    } else {
      console.warn('User role 2 nhưng không có cinema_id!');
    }
  }

  private updateUserCinemaName(): void {
    if (this.userCinemaId && this.rapList.length > 0) {
      const cinema = this.rapList.find(rap => rap.id === this.userCinemaId);
      if (cinema) {
        this.userCinemaName = cinema.cinemaName;
        console.log('Tên rạp của user:', this.userCinemaName);
      }
    }
  }

  private loadUserRooms(): void {
    if (this.userCinemaId) {
      this.roomService.getByCinemaId(this.userCinemaId).subscribe({
        next: (rooms: RoomDto[]) => {
          this.userRooms = rooms;
          this.filteredUserRooms = [...rooms];
          console.log('Danh sách phòng của Cinema Admin:', this.userRooms);
        },
        error: (err) => {
          console.error('Lỗi khi load phòng của Cinema Admin:', err);
          this.userRooms = [];
        }
      });
    }
  }

  private setPermissions(): void {
    if (!this.currentUser) return;

    switch (this.currentUser.role) {
      case 2:
        this.canAddCinema = false;
        this.canEditCinema = false;
        this.canDeleteCinema = false;
        this.canViewCinemaDetails = false;
        this.canAddRoom = true;
        break;
      case 4:
        this.canAddCinema = true;
        this.canEditCinema = false;
        this.canDeleteCinema = true;
        this.canViewCinemaDetails = false;
        this.canAddRoom = false;
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

  getAllRaps(): void {
    this.cinemasService.getCinemas().subscribe({
      next: (data) => {
        this.rapList = data;
        this.filteredRapList = [...data];
        
        if (this.currentUser && this.currentUser.role === 2) {
          this.updateUserCinemaName();
        }
      },
      error: (err) => {
        console.error('Error fetching cinemas:', err);
      }
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
        this.filteredRapList = this.filteredRapList.filter(item => item.id !== rap.id);
        alert('Đã xóa rạp thành công!');
      },
      error: (err) => {
        console.error('Error deleting cinema:', err);
        alert('Có lỗi xảy ra khi xóa rạp!');
      }
    });
  }

  deleteUserRoom(room: RoomDto): void {
    if (this.currentUser.role !== 2) {
      alert('Bạn không có quyền xóa phòng!');
      return;
    }

    const confirmDelete = confirm(`Bạn có chắc muốn xóa phòng: ${room.room_name}?`);
    if (!confirmDelete) return;

    this.roomService.deleteRoom(room.id).subscribe({
      next: () => {
        alert('Đã xóa phòng thành công!');
        this.loadUserRooms();
      },
      error: (err) => {
        console.error('Lỗi khi xóa phòng:', err);
        alert('Có lỗi xảy ra khi xóa phòng!');
      }
    });
  }

  showRomDialog(idRoom: string): void {
    this.router.navigate(['/layout', 'room', idRoom, '1', '1']);
  }

}