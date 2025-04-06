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
  roomLisst: RoomDto[] = []
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
    private roomService: RoomService,

  ) { }

  ngOnInit(): void {
    this.loadShowtimes();
    this.loadAllMovies();
    this.getAllRaps();
    // this.loadAllRooms();
  }
  onCinemaChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedCinemaId = selectElement.value;

    if (selectedCinemaId) {
      this.getRoom(selectedCinemaId);
    } else {
      this.roomLisst = []; // Reset nếu không chọn gì
    }
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
  // Tải danh sách phim
  loadAllMovies(): void {
    this.http.get<any>('http://127.0.0.1:3000/films/getfilm').subscribe({
      next: (response) => {
        if (response && response.code === 200 && response.data && response.data.films) {
          this.allMovies = response.data.films;
          console.log('Loaded movies:', this.allMovies);
        }
      },
      error: (err) => {
        console.error('Error fetching movies:', err);
      }
    });
  }
  getRoom(id?: string): void {
    this.roomErrorMessage = ''; // reset lỗi cũ
    this.roomService.getByCinemaId(id!)
      .subscribe({
        next: (result: RoomDto[]) => {
          this.roomLisst = result;
          if (result.length === 0) {
            this.roomErrorMessage = 'Không tìm thấy phòng nào thuộc rạp này.';
          }
        },
        error: (error) => {
          console.error('Lỗi khi lấy danh sách phòng:', error);
          this.roomLisst = []; // đảm bảo list trống nếu lỗi
          if (error.status === 404 && error.error?.error) {
            this.roomErrorMessage = error.error.error;
          } else {
            this.roomErrorMessage = 'Đã xảy ra lỗi khi tải danh sách phòng.';
          }
        }
      });
  }

  // Tải danh sách phòng
  loadAllRooms(): void {
    this.http.get<any>('http://127.0.0.1:3000/room/getroom').subscribe({
      next: (response) => {
        if (response && response.code === 200 && response.data && response.data.rooms) {
          this.allRooms = response.data.rooms;
          console.log('Loaded rooms:', this.allRooms);
        }
      },
      error: (err) => {
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

    const term = this.searchTerm.toLowerCase();
    this.filteredShowtimes = this.dsShowtimes.filter(showtime =>
      showtime.showtimeId.toLowerCase().includes(term) ||
      (showtime.movieName && showtime.movieName.toLowerCase().includes(term)) ||
      (showtime.roomName && showtime.roomName.toLowerCase().includes(term))
    );
  }

  // Tự động điền tên phim khi chọn phim
  onMovieChange(movieId: string): void {
    const selectedMovie = this.allMovies.find(movie => movie._id === movieId);
    if (selectedMovie) {
      this.showtimeForm.movieName = selectedMovie.title;
    } else {
      this.showtimeForm.movieName = '';
    }
  }

  // Tự động điền tên phòng khi chọn phòng
  onRoomChange(roomId: string): void {
    const selectedRoom = this.allRooms.find(room => room._id === roomId);
    if (selectedRoom) {
      this.showtimeForm.roomName = selectedRoom.room_name;
    } else {
      this.showtimeForm.roomName = '';
    }
  }

  // Xử lý nhập thời gian bắt đầu
  onStartTimeInput(time: string): void {
    // Loại bỏ các ký tự không phải số
    const numbersOnly = time.replace(/[^0-9]/g, '');

    if (numbersOnly.length >= 1 && numbersOnly.length <= 4) {
      // Nếu có ít nhất 1 số và không quá 4 số
      if (numbersOnly.length <= 2) {
        // Nếu chỉ nhập giờ (1-2 số)
        this.showtimeForm.startTime = numbersOnly + (numbersOnly.length === 2 ? ':' : '');
      } else {
        // Nếu nhập cả giờ và phút
        const hours = numbersOnly.substring(0, 2);
        const minutes = numbersOnly.substring(2);

        // Kiểm tra giá trị hợp lệ
        if (parseInt(hours) < 24) {
          this.showtimeForm.startTime = hours + ':' + minutes;
        }
      }
    } else if (numbersOnly.length > 4) {
      // Nếu nhập quá 4 số, cắt bớt
      const hours = numbersOnly.substring(0, 2);
      const minutes = numbersOnly.substring(2, 4);

      if (parseInt(hours) < 24 && parseInt(minutes) < 60) {
        this.showtimeForm.startTime = hours + ':' + minutes;
      }
    }
  }

  // Xử lý nhập thời gian kết thúc
  onEndTimeInput(time: string): void {
    // Loại bỏ các ký tự không phải số
    const numbersOnly = time.replace(/[^0-9]/g, '');

    if (numbersOnly.length >= 1 && numbersOnly.length <= 4) {
      // Nếu có ít nhất 1 số và không quá 4 số
      if (numbersOnly.length <= 2) {
        // Nếu chỉ nhập giờ (1-2 số)
        this.showtimeForm.endTime = numbersOnly + (numbersOnly.length === 2 ? ':' : '');
      } else {
        // Nếu nhập cả giờ và phút
        const hours = numbersOnly.substring(0, 2);
        const minutes = numbersOnly.substring(2);

        // Kiểm tra giá trị hợp lệ
        if (parseInt(hours) < 24) {
          this.showtimeForm.endTime = hours + ':' + minutes;
        }
      }
    } else if (numbersOnly.length > 4) {
      // Nếu nhập quá 4 số, cắt bớt
      const hours = numbersOnly.substring(0, 2);
      const minutes = numbersOnly.substring(2, 4);

      if (parseInt(hours) < 24 && parseInt(minutes) < 60) {
        this.showtimeForm.endTime = hours + ':' + minutes;
      }
    }
  }

  // Mở modal Thêm
  openAddModal(): void {
    this.isEditing = false;
    this.isMainModalOpen = true;

    // Khởi tạo form mới và ngày mặc định
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm

    // Tạo ID suất chiếu theo định dạng "STx" với x là số ngẫu nhiên
    const randomId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    // Thời gian bắt đầu mặc định ở giờ hiện tại được làm tròn
    const currentHour = currentDate.getHours();
    const roundedMinutes = Math.ceil(currentDate.getMinutes() / 15) * 15; // Làm tròn đến 15 phút gần nhất
    let defaultStartTime = '';

    if (roundedMinutes === 60) {
      defaultStartTime = `${(currentHour + 1) % 24}:00`;
    } else {
      defaultStartTime = `${currentHour}:${roundedMinutes.toString().padStart(2, '0')}`;
    }

    // Thời gian kết thúc mặc định là 2 giờ sau thời gian bắt đầu
    const startTimeParts = defaultStartTime.split(':');
    const startHour = parseInt(startTimeParts[0]);
    const startMinute = parseInt(startTimeParts[1]);

    const endHour = (startHour + 2) % 24; // Cộng thêm 2 giờ, đảm bảo không vượt quá 24
    const defaultEndTime = `${endHour}:${startMinute.toString().padStart(2, '0')}`;

    this.showtimeForm = new ShowtimesDto({
      showtimeId: 'ST' + randomId,
      movieId: '',
      roomId: '',
      startTime: defaultStartTime,
      endTime: defaultEndTime,
      showDate: formattedDate
    });
  }

  // Mở modal Sửa
  editSchedule(showtime: ShowtimesDto): void {
    this.isEditing = true;
    this.isMainModalOpen = true;
    this.showtimeForm = showtime.clone();

    // Đảm bảo định dạng ngày giờ cho việc hiển thị trong datetime-local
    if (this.showtimeForm.showDate) {
      // Đảm bảo đúng định dạng YYYY-MM-DDThh:mm
      const date = new Date(this.showtimeForm.showDate);
      if (!isNaN(date.getTime())) {
        this.showtimeForm.showDate = date.toISOString().slice(0, 16);
      }
    }

    console.log('Editing showtime:', this.showtimeForm);
  }

  // Đóng modal
  closeMainModal(): void {
    this.isMainModalOpen = false;
  }

  // Lưu khi bấm "LƯU"
  saveSchedule(): void {
    // Kiểm tra dữ liệu đầu vào
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

    // Định dạng thời gian nếu người dùng nhập 4 số mà chưa được định dạng
    if (/^\d{4}$/.test(this.showtimeForm.startTime)) {
      this.onStartTimeInput(this.showtimeForm.startTime);
    }

    if (/^\d{4}$/.test(this.showtimeForm.endTime)) {
      this.onEndTimeInput(this.showtimeForm.endTime);
    }

    // In dữ liệu trước khi gửi để debug
    console.log('Dữ liệu gửi đi:', this.showtimeForm.toJSON());

    if (this.isEditing) {
      // Cập nhật
      if (!this.showtimeForm.id) {
        alert('Không tìm thấy ID!');
        return;
      }
      this.showtimesService.updateShowtime(this.showtimeForm.id, this.showtimeForm).subscribe({
        next: (response) => {
          console.log('Kết quả cập nhật:', response);
          alert('Cập nhật thành công!');
          this.isMainModalOpen = false;
          this.loadShowtimes();
        },
        error: (err) => {
          console.error('Update error:', err);

          // Hiển thị chi tiết lỗi nếu có
          if (err.error && err.error.message) {
            alert(`Lỗi cập nhật: ${err.error.message}`);
          } else {
            alert('Lỗi cập nhật! Vui lòng kiểm tra dữ liệu và thử lại.');
          }
        }
      });
    } else {
      // Thêm
      this.showtimesService.createShowtime(this.showtimeForm).subscribe({
        next: (response) => {
          console.log('Kết quả thêm mới:', response);
          alert('Thêm thành công!');
          this.isMainModalOpen = false;
          this.loadShowtimes();
        },
        error: (err) => {
          console.error('Creation error:', err);

          // Hiển thị chi tiết lỗi nếu có
          if (err.error && err.error.message) {
            alert(`Lỗi thêm mới: ${err.error.message}`);
          } else {
            alert('Lỗi thêm mới! Vui lòng kiểm tra dữ liệu và thử lại.');
          }
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