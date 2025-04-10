import { Component, OnInit } from '@angular/core';
import { ShowtimesService } from '../../../shared/services/showtimes.service';
import { ShowtimesDto } from '../../../shared/dtos/showtimesDto.dto';
import { HttpClient } from '@angular/common/http';
import { CinemasService } from '../../../shared/services/cinemas.service';
import { CinemaDto } from '../../../shared/dtos/cinemasDto.dto';
import { RoomService } from '../../../shared/services/room.service';
import { RoomDto } from '../../../shared/dtos/roomDto.dto';

interface Movie {
  _id: string;
  title: string;
}

interface Room {
  _id: string;
  room_name: string;
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
  // Danh sách phim và phòng cho dropdown
  allMovies: Movie[] = [];
  allRooms: Room[] = [];
  roomLisst: RoomDto[] = [];
  // Quản lý modal Thêm/Sửa
  isMainModalOpen: boolean = false;
  isEditing: boolean = false;
  showtimeForm: ShowtimesDto = new ShowtimesDto();
  // Quản lý modal Xoá
  isDeleteModalOpen: boolean = false;
  showtimeDangXoa: ShowtimesDto | null = null;
  deletePassword: string = '';
  roomErrorMessage: string = '';

  constructor(
    private showtimesService: ShowtimesService,
    private http: HttpClient,
    private cinemasService: CinemasService,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.loadShowtimes();
    this.loadAllMovies();
    this.getAllRaps();
    // this.loadAllRooms();
  }

  onCinemaChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedCinemaId: string = selectElement.value;
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
      }
    });
  }

  getRoom(id?: string): void {
    this.roomErrorMessage = '';
    this.roomService.getByCinemaId(id!).subscribe({
      next: (result: RoomDto[]) => {
        this.roomLisst = result;
        if (result.length === 0) {
          this.roomErrorMessage = 'Không tìm thấy phòng nào thuộc rạp này.';
        }
      },
      error: (error: any) => {
        console.error('Lỗi khi lấy danh sách phòng:', error);
        this.roomLisst = [];
        if (error.status === 404 && error.error?.error) {
          this.roomErrorMessage = error.error.error;
        } else {
          this.roomErrorMessage = 'Đã xảy ra lỗi khi tải danh sách phòng.';
        }
      }
    });
  }

  loadAllRooms(): void {
    this.http.get<any>('http://127.0.0.1:3000/room/getroom').subscribe({
      next: (response: any) => {
        if (response && response.code === 200 && response.data && response.data.rooms) {
          this.allRooms = response.data.rooms;
          console.log('Loaded rooms:', this.allRooms);
        }
      },
      error: (err: any) => {
        console.error('Error fetching rooms:', err);
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
      showtime.showtimeId.toLowerCase().includes(term) ||
      (showtime.movieName && showtime.movieName.toLowerCase().includes(term)) ||
      (showtime.roomName && showtime.roomName.toLowerCase().includes(term))
    );
  }

  onMovieChange(movieId: string): void {
    const selectedMovie: Movie | undefined = this.allMovies.find(movie => movie._id === movieId);
    if (selectedMovie) {
      this.showtimeForm.movieName = selectedMovie.title;
    } else {
      this.showtimeForm.movieName = '';
    }
  }

  onRoomChange(roomId: string): void {
    const selectedRoom: Room | undefined = this.allRooms.find(room => room._id === roomId);
    if (selectedRoom) {
      this.showtimeForm.roomName = selectedRoom.room_name;
    } else {
      this.showtimeForm.roomName = '';
    }
  }

  onStartTimeInput(time: string): void {
    const numbersOnly: string = time.replace(/[^0-9]/g, '');
    if (numbersOnly.length >= 1 && numbersOnly.length <= 4) {
      if (numbersOnly.length <= 2) {
        this.showtimeForm.startTime = numbersOnly + (numbersOnly.length === 2 ? ':' : '');
      } else {
        const hours: string = numbersOnly.substring(0, 2);
        const minutes: string = numbersOnly.substring(2);
        if (parseInt(hours) < 24) {
          this.showtimeForm.startTime = hours + ':' + minutes;
        }
      }
    } else if (numbersOnly.length > 4) {
      const hours: string = numbersOnly.substring(0, 2);
      const minutes: string = numbersOnly.substring(2, 4);
      if (parseInt(hours) < 24 && parseInt(minutes) < 60) {
        this.showtimeForm.startTime = hours + ':' + minutes;
      }
    }
  }

  onEndTimeInput(time: string): void {
    const numbersOnly: string = time.replace(/[^0-9]/g, '');
    if (numbersOnly.length >= 1 && numbersOnly.length <= 4) {
      if (numbersOnly.length <= 2) {
        this.showtimeForm.endTime = numbersOnly + (numbersOnly.length === 2 ? ':' : '');
      } else {
        const hours: string = numbersOnly.substring(0, 2);
        const minutes: string = numbersOnly.substring(2);
        if (parseInt(hours) < 24) {
          this.showtimeForm.endTime = hours + ':' + minutes;
        }
      }
    } else if (numbersOnly.length > 4) {
      const hours: string = numbersOnly.substring(0, 2);
      const minutes: string = numbersOnly.substring(2, 4);
      if (parseInt(hours) < 24 && parseInt(minutes) < 60) {
        this.showtimeForm.endTime = hours + ':' + minutes;
      }
    }
  }

  openAddModal(): void {
    this.isEditing = false;
    this.isMainModalOpen = true;
    const currentDate: Date = new Date();
    const formattedDate: string = currentDate.toISOString().slice(0, 16);
    const randomId: string = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const currentHour: number = currentDate.getHours();
    const roundedMinutes: number = Math.ceil(currentDate.getMinutes() / 15) * 15;
    let defaultStartTime: string = '';
    if (roundedMinutes === 60) {
      defaultStartTime = `${(currentHour + 1) % 24}:00`;
    } else {
      defaultStartTime = `${currentHour}:${roundedMinutes.toString().padStart(2, '0')}`;
    }
    const startTimeParts: string[] = defaultStartTime.split(':');
    const startHour: number = parseInt(startTimeParts[0]);
    const startMinute: number = parseInt(startTimeParts[1]);
    const endHour: number = (startHour + 2) % 24;
    const defaultEndTime: string = `${endHour}:${startMinute.toString().padStart(2, '0')}`;
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
    this.isEditing = true;
    this.isMainModalOpen = true;
    this.showtimeForm = showtime.clone();
    if (this.showtimeForm.showDate) {
      const date: Date = new Date(this.showtimeForm.showDate);
      if (!isNaN(date.getTime())) {
        this.showtimeForm.showDate = date.toISOString().slice(0, 16);
      }
    }
    console.log('Editing showtime:', this.showtimeForm);
  }

  closeMainModal(): void {
    this.isMainModalOpen = false;
  }

  saveSchedule(): void {
    if (!this.showtimeForm.showtimeId) {
      alert('Vui lòng nhập mã suất chiếu!');
      return;
    }
    if (!this.showtimeForm.movieId) {
      alert('Vui lòng chọn phim!');
      return;
    }
    if (!this.showtimeForm.roomId) {
      alert('Vui lòng chọn phòng!');
      return;
    }
    if (!this.showtimeForm.startTime) {
      alert('Vui lòng nhập thời gian bắt đầu!');
      return;
    }
    if (!this.showtimeForm.endTime) {
      alert('Vui lòng nhập thời gian kết thúc!');
      return;
    }
    if (!this.showtimeForm.showDate) {
      alert('Vui lòng chọn ngày chiếu!');
      return;
    }
    if (/^\d{4}$/.test(this.showtimeForm.startTime)) {
      this.onStartTimeInput(this.showtimeForm.startTime);
    }
    if (/^\d{4}$/.test(this.showtimeForm.endTime)) {
      this.onEndTimeInput(this.showtimeForm.endTime);
    }
    console.log('Dữ liệu gửi đi:', this.showtimeForm.toJSON());
    if (this.isEditing) {
      if (!this.showtimeForm.id) {
        alert('Không tìm thấy ID!');
        return;
      }
      this.showtimesService.updateShowtime(this.showtimeForm.id, this.showtimeForm).subscribe({
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
      this.showtimesService.createShowtime(this.showtimeForm).subscribe({
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
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
  }

  confirmDelete(): void {
    if (this.deletePassword === 'hiendz') {
      if (!this.showtimeDangXoa?.id) {
        alert('Không tìm thấy ID để xoá!');
        return;
      }
      this.showtimesService.deleteShowtime(this.showtimeDangXoa.id).subscribe({
        next: (_: any) => {
          alert('Xoá thành công!');
          this.isDeleteModalOpen = false;
          this.loadShowtimes();
        },
        error: (err: any) => {
          console.error('Deletion error:', err);
          alert('Lỗi xoá!');
        }
      });
    } else {
      alert('Mật khẩu không đúng!');
    }
  }
}
