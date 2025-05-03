import { Component, OnInit } from '@angular/core';
import { ShowtimesService } from '../../../shared/services/showtimes.service';
import { ShowtimesDto } from '../../../shared/dtos/showtimesDto.dto';
import { HttpClient } from '@angular/common/http';
import { CinemasService } from '../../../shared/services/cinemas.service';
import { CinemaDto } from '../../../shared/dtos/cinemasDto.dto';
import { RoomService } from '../../../shared/services/room.service';
import { RoomDto } from '../../../shared/dtos/roomDto.dto';
import { DatePipe } from '@angular/common';

interface Movie {
  _id: string;
  title: string;
}

interface ValidationErrors {
  [key: string]: string;
}

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
  rapList: CinemaDto[] = [];
  allMovies: Movie[] = [];
  roomLisst: RoomDto[] = [];

  // Quản lý modal Thêm/Sửa
  isMainModalOpen: boolean = false;
  isEditing: boolean = false;
  showtimeForm: ShowtimesDto = new ShowtimesDto();

  // Quản lý modal Xoá
  isDeleteModalOpen: boolean = false;
  showtimeDangXoa: ShowtimesDto | null = null;
  deletePassword: string = '';
  deleteError: string = '';

  // Validation
  validationErrors: ValidationErrors = {};
  formSubmitted: boolean = false;
  roomErrorMessage: string = '';

  constructor(
    private showtimesService: ShowtimesService,
    private http: HttpClient,
    private cinemasService: CinemasService,
    private roomService: RoomService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.loadShowtimes();
    this.loadAllMovies();
    this.getAllRaps();
  }

  // Hiển thị tên rạp từ ID
  getCinemaName(cinemaId: string): string {
    const cinema = this.rapList.find(rap => rap.id === cinemaId);
    return cinema ? cinema.cinemaName : '';
  }

  // Format date từ ISO string hoặc date object sang ngày tháng năm
  formatDate(dateString: string): string {
    if (!dateString) return '';

    // Kiểm tra nếu dateString đã ở dạng dd/MM/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Trả về nguyên chuỗi nếu không parse được
      }
      return this.datePipe.transform(date, 'dd/MM/yyyy') || dateString;
    } catch (error) {
      console.error('Error parsing date:', error);
      return dateString;
    }
  }

  // Khi chọn rạp, cập nhật cinemaId cho showtimeForm và load danh sách phòng của rạp đó
  onCinemaChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedCinemaId: string = selectElement.value;
    // Cập nhật cinemaId vào body của showtime
    this.showtimeForm['cinemaId'] = selectedCinemaId;

    // Xóa thông báo lỗi khi người dùng chọn lại
    if (selectedCinemaId) {
      delete this.validationErrors['cinemaId'];
    }

    if (selectedCinemaId) {
      this.getRoom(selectedCinemaId);
    } else {
      this.roomLisst = [];
    }
  }

  loadShowtimes(): void {
    this.showtimesService.getAllShowtimes().subscribe({
      next: (data: ShowtimesDto[]) => {
        this.dsShowtimes = data;
        this.filteredShowtimes = [...this.dsShowtimes];
        console.log('Loaded showtimes with names:', this.dsShowtimes);
      },
      error: (err: any) => {
        console.error('Error fetching showtimes:', err);
        alert('Lỗi khi tải danh sách suất chiếu: ' + (err.error?.message || 'Vui lòng thử lại sau'));
      }
    });
  }

  getAllRaps(): void {
    this.cinemasService.getCinemas().subscribe({
      next: (data: CinemaDto[]) => {
        this.rapList = data;
      },
      error: (err: any) => {
        console.error('Error fetching cinemas:', err);
        alert('Lỗi khi tải danh sách rạp: ' + (err.error?.message || 'Vui lòng thử lại sau'));
      }
    });
  }

  loadAllMovies(): void {
    this.http.get<any>('http://127.0.0.1:3000/films/getfilm').subscribe({
      next: (response: any) => {
        if (response && response.code === 200 && response.data && response.data.films) {
          this.allMovies = response.data.films;
          console.log('Loaded movies:', this.allMovies);
        }
      },
      error: (err: any) => {
        console.error('Error fetching movies:', err);
        alert('Lỗi khi tải danh sách phim: ' + (err.error?.message || 'Vui lòng thử lại sau'));
      }
    });
  }

  // In your getRoom method in lich-chieu.component.ts:
  getRoom(id?: string): void {
    this.roomErrorMessage = '';
    if (!id) {
      this.roomLisst = [];
      this.roomErrorMessage = 'ID rạp không hợp lệ';
      return;
    }
    
    // First, try to get all rooms and filter by cinema ID
    this.roomService.getAll().subscribe({
      next: (allRooms: RoomDto[]) => {
        // Filter rooms by the cinema ID
        this.roomLisst = allRooms.filter(room => room.cinema_id === id);
        
        if (this.roomLisst.length === 0) {
          this.roomErrorMessage = 'Không tìm thấy phòng nào thuộc rạp này.';
        }
      },
      error: (error: any) => {
        console.error('Lỗi khi lấy danh sách phòng:', error);
        this.roomLisst = [];
        
        if (error.status === 404) {
          this.roomErrorMessage = 'Không thể tải danh sách phòng. API không tìm thấy.';
        } else if (error.status === 500) {
          this.roomErrorMessage = 'Lỗi máy chủ khi tải danh sách phòng.';
        } else if (error.error && error.error.message) {
          this.roomErrorMessage = error.error.message;
        } else {
          this.roomErrorMessage = 'Đã xảy ra lỗi khi tải danh sách phòng. Vui lòng thử lại sau.';
        }
      }
    });
  }

  onSearch(): void {
    console.log('Search term:', this.searchTerm);
    if (!this.searchTerm.trim()) {
      this.filteredShowtimes = [...this.dsShowtimes];
      return;
    }
    const term: string = this.searchTerm.toLowerCase();
    this.filteredShowtimes = this.dsShowtimes.filter((showtime: ShowtimesDto) =>
      showtime['showtimeId'].toLowerCase().includes(term) ||
      (showtime['movieName'] && showtime['movieName'].toLowerCase().includes(term)) ||
      (showtime['roomName'] && showtime['roomName'].toLowerCase().includes(term)) ||
      (this.getCinemaName(showtime['cinemaId']) && this.getCinemaName(showtime['cinemaId']).toLowerCase().includes(term))
    );
  }

  onMovieChange(movieId: string): void {
    const selectedMovie: Movie | undefined = this.allMovies.find(movie => movie._id === movieId);
    if (selectedMovie) {
      this.showtimeForm['movieName'] = selectedMovie.title;
      delete this.validationErrors['movieId'];
    } else {
      this.showtimeForm['movieName'] = '';
    }
  }

  onRoomChange(roomId: string): void {
    const selectedRoom: RoomDto | undefined = this.roomLisst.find(room => room.id === roomId);
    if (selectedRoom) {
      this.showtimeForm['roomName'] = selectedRoom.room_name;
      delete this.validationErrors['roomId'];
    } else {
      this.showtimeForm['roomName'] = '';
    }
  }

  onStartTimeInput(time: string): void {
    const numbersOnly: string = time.replace(/[^0-9]/g, '');

    // Format time as HH:MM
    if (numbersOnly.length >= 1 && numbersOnly.length <= 4) {
      if (numbersOnly.length <= 2) {
        this.showtimeForm['startTime'] = numbersOnly + (numbersOnly.length === 2 ? ':' : '');
      } else {
        const hours: string = numbersOnly.substring(0, 2);
        const minutes: string = numbersOnly.substring(2);
        if (parseInt(hours) < 24) {
          this.showtimeForm['startTime'] = hours + ':' + minutes;
        }
      }
    } else if (numbersOnly.length > 4) {
      const hours: string = numbersOnly.substring(0, 2);
      const minutes: string = numbersOnly.substring(2, 4);
      if (parseInt(hours) < 24 && parseInt(minutes) < 60) {
        this.showtimeForm['startTime'] = hours + ':' + minutes;
      }
    }

    // Clear validation error when user modifies input
    delete this.validationErrors['startTime'];

    // Validate end time is after start time if both times are set
    this.validateTimeRange();
  }

  onEndTimeInput(time: string): void {
    const numbersOnly: string = time.replace(/[^0-9]/g, '');

    // Format time as HH:MM
    if (numbersOnly.length >= 1 && numbersOnly.length <= 4) {
      if (numbersOnly.length <= 2) {
        this.showtimeForm['endTime'] = numbersOnly + (numbersOnly.length === 2 ? ':' : '');
      } else {
        const hours: string = numbersOnly.substring(0, 2);
        const minutes: string = numbersOnly.substring(2);
        if (parseInt(hours) < 24) {
          this.showtimeForm['endTime'] = hours + ':' + minutes;
        }
      }
    } else if (numbersOnly.length > 4) {
      const hours: string = numbersOnly.substring(0, 2);
      const minutes: string = numbersOnly.substring(2, 4);
      if (parseInt(hours) < 24 && parseInt(minutes) < 60) {
        this.showtimeForm['endTime'] = hours + ':' + minutes;
      }
    }

    // Clear validation error when user modifies input
    delete this.validationErrors['endTime'];

    // Validate end time is after start time if both times are set
    this.validateTimeRange();
  }

  // Validate that end time is after start time
  validateTimeRange(): void {
    if (this.showtimeForm['startTime'] && this.showtimeForm['endTime']) {
      const startParts = this.showtimeForm['startTime'].split(':');
      const endParts = this.showtimeForm['endTime'].split(':');

      if (startParts.length === 2 && endParts.length === 2) {
        const startHour = parseInt(startParts[0]);
        const startMinute = parseInt(startParts[1]);
        const endHour = parseInt(endParts[0]);
        const endMinute = parseInt(endParts[1]);

        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        if (endMinutes <= startMinutes) {
          this.validationErrors['endTime'] = 'Thời gian kết thúc phải sau thời gian bắt đầu';
        }
      }
    }
  }

  openAddModal(): void {
    this.resetValidation();
    this.isEditing = false;
    this.isMainModalOpen = true;

    // Generate default values for new showtime
    const currentDate: Date = new Date();
    const formattedDate: string = currentDate.toISOString().slice(0, 10); // yyyy-MM-dd
    const randomId: string = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    // Set default times (current time rounded to next 15 minutes)
    const currentHour: number = currentDate.getHours();
    const roundedMinutes: number = Math.ceil(currentDate.getMinutes() / 15) * 15;
    let defaultStartTime: string = '';

    if (roundedMinutes === 60) {
      defaultStartTime = `${(currentHour + 1) % 24}:00`;
    } else {
      defaultStartTime = `${currentHour}:${roundedMinutes.toString().padStart(2, '0')}`;
    }

    // Calculate default end time (2 hours later)
    const startTimeParts: string[] = defaultStartTime.split(':');
    const startHour: number = parseInt(startTimeParts[0]);
    const startMinute: number = parseInt(startTimeParts[1]);
    const endHour: number = (startHour + 2) % 24;
    const defaultEndTime: string = `${endHour}:${startMinute.toString().padStart(2, '0')}`;

    // Initialize form with defaults
    this.showtimeForm = new ShowtimesDto({
      showtimeId: 'ST' + randomId,
      movieId: '',
      roomId: '',
      cinemaId: '',
      startTime: defaultStartTime,
      endTime: defaultEndTime,
      showDate: formattedDate
    });
  }

  editSchedule(showtime: ShowtimesDto): void {
    this.resetValidation();
    this.isEditing = true;
    this.isMainModalOpen = true;

    // Clone the showtime object to avoid modifying the original
    this.showtimeForm = showtime.clone();

    // Convert showDate to yyyy-MM-dd for date input if needed
    if (this.showtimeForm['showDate']) {
      try {
        const date: Date = new Date(this.showtimeForm['showDate']);
        if (!isNaN(date.getTime())) {
          this.showtimeForm['showDate'] = date.toISOString().slice(0, 10);
        }
      } catch (error) {
        console.error('Error converting date:', error);
      }
    }

    // Load rooms for the selected cinema
    if (this.showtimeForm['cinemaId']) {
      this.getRoom(this.showtimeForm['cinemaId']);
    }

    console.log('Editing showtime:', this.showtimeForm);
  }

  closeMainModal(): void {
    this.isMainModalOpen = false;
    this.resetValidation();
  }

  // Reset all validation errors
  resetValidation(): void {
    this.validationErrors = {};
    this.formSubmitted = false;
    this.roomErrorMessage = '';
  }

  // Check if there are any validation errors
  hasValidationErrors(): boolean {
    return Object.keys(this.validationErrors).length > 0;
  }

  // Validate form fields
  validateForm(): boolean {
    this.validationErrors = {};

    if (!this.showtimeForm['showtimeId']) {
      this.validationErrors['showtimeId'] = 'Vui lòng nhập mã suất chiếu';
    }

    if (!this.showtimeForm['movieId']) {
      this.validationErrors['movieId'] = 'Vui lòng chọn phim';
    }

    if (!this.showtimeForm['roomId']) {
      this.validationErrors['roomId'] = 'Vui lòng chọn phòng';
    }

    if (!this.showtimeForm['cinemaId']) {
      this.validationErrors['cinemaId'] = 'Vui lòng chọn rạp';
    }

    if (!this.showtimeForm['startTime']) {
      this.validationErrors['startTime'] = 'Vui lòng nhập thời gian bắt đầu';
    } else if (!/^\d{1,2}:\d{2}$/.test(this.showtimeForm['startTime'])) {
      this.validationErrors['startTime'] = 'Thời gian không hợp lệ, vui lòng nhập định dạng HH:MM';
    }

    if (!this.showtimeForm['endTime']) {
      this.validationErrors['endTime'] = 'Vui lòng nhập thời gian kết thúc';
    } else if (!/^\d{1,2}:\d{2}$/.test(this.showtimeForm['endTime'])) {
      this.validationErrors['endTime'] = 'Thời gian không hợp lệ, vui lòng nhập định dạng HH:MM';
    }

    if (!this.showtimeForm['showDate']) {
      this.validationErrors['showDate'] = 'Vui lòng chọn ngày chiếu';
    }

    // Check if start time is before end time
    this.validateTimeRange();

    return Object.keys(this.validationErrors).length === 0;
  }

  saveSchedule(): void {
    this.formSubmitted = true;

    // Validate form before submitting
    if (!this.validateForm()) {
      return;
    }

    // Format time inputs if needed
    if (/^\d{4}$/.test(this.showtimeForm['startTime'])) {
      this.onStartTimeInput(this.showtimeForm['startTime']);
    }
    if (/^\d{4}$/.test(this.showtimeForm['endTime'])) {
      this.onEndTimeInput(this.showtimeForm['endTime']);
    }

    // Create a copy of the form data
    const showtimeData = this.showtimeForm.clone();

    // Format showDate for API - convert from yyyy-MM-dd to dd/MM/yyyy
    try {
      const date = new Date(this.showtimeForm['showDate']);
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        showtimeData['showDate'] = `${day}/${month}/${year}`;
      }
    } catch (error) {
      console.error('Error formatting date:', error);
    }

    console.log('Dữ liệu gửi đi:', showtimeData.toJSON());

    if (this.isEditing) {
      if (!showtimeData['id']) {
        alert('Không tìm thấy ID!');
        return;
      }
      this.showtimesService.updateShowtime(showtimeData['id'], showtimeData).subscribe({
        next: (response: any) => {
          console.log('Kết quả cập nhật:', response);
          alert('Cập nhật thành công!');
          this.isMainModalOpen = false;
          this.loadShowtimes();
        },
        error: (err: any) => {
          console.error('Update error:', err);
          if (err.error && err.error.message) {
            alert(`Lỗi cập nhật: ${err.error.message}`);
          } else {
            alert('Lỗi cập nhật! Vui lòng kiểm tra dữ liệu và thử lại.');
          }
        }
      });
    } else {
      this.showtimesService.createShowtime(showtimeData).subscribe({
        next: (response: any) => {
          console.log('Kết quả thêm mới:', response);
          alert('Thêm thành công!');
          this.isMainModalOpen = false;
          this.loadShowtimes();
        },
        error: (err: any) => {
          console.error('Creation error:', err);
          if (err.error && err.error.message) {
            alert(`Lỗi thêm mới: ${err.error.message}`);
          } else {
            alert('Lỗi thêm mới! Vui lòng kiểm tra dữ liệu và thử lại.');
          }
        }
      });
    }
  }

  deleteSchedule(showtime: ShowtimesDto): void {
    this.showtimeDangXoa = showtime;
    this.deletePassword = '';
    this.deleteError = '';
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.deleteError = '';
  }

  confirmDelete(): void {
    // In a production environment, you should implement a more secure authentication method
    // This is just a simple example for demonstration
    const secretPassword = 'hiendz'; // In a real app, this should be handled securely

    if (this.deletePassword === secretPassword) {
      if (!this.showtimeDangXoa?.['id']) {
        alert('Không tìm thấy ID để xoá!');
        return;
      }
      this.showtimesService.deleteShowtime(this.showtimeDangXoa['id']).subscribe({
        next: (_: any) => {
          alert('Xoá thành công!');
          this.isDeleteModalOpen = false;
          this.loadShowtimes();
        },
        error: (err: any) => {
          console.error('Deletion error:', err);
          alert('Lỗi xoá: ' + (err.error?.message || 'Vui lòng thử lại sau'));
        }
      });
    } else {
      this.deleteError = 'Mật khẩu không đúng!';
    }
  }
}