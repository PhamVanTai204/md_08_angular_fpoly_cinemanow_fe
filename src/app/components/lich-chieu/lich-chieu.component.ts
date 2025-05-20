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

interface UserInfo {
  id?: string;
  username?: string;
  role?: string;
  cinemaId?: string;
}

@Component({
  selector: 'app-lich-chieu',
  templateUrl: './lich-chieu.component.html',
  styleUrls: ['./lich-chieu.component.css'],
  standalone: false
})
export class LichChieuComponent implements OnInit {
  // Thông tin người dùng đăng nhập
  currentUser: UserInfo = {};

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

  isViewOnly: boolean = false;

  constructor(
    private showtimesService: ShowtimesService,
    private http: HttpClient,
    private cinemasService: CinemasService,
    private roomService: RoomService
  ) { }

  ngOnInit(): void {
    // Lấy thông tin người dùng từ localStorage
    this.getCurrentUserFromStorage();

    // Tải dữ liệu
    this.loadShowtimes();
    this.loadAllMovies();
    this.getAllRaps();

    // Chỉ thiết lập người dùng mặc định nếu không có người dùng trong localStorage
    if (!this.currentUser.role) {
      this.setDefaultTestUser();
    }

    console.log('Component đã khởi tạo xong');
  }

  // Thiết lập người dùng mặc định cho việc kiểm thử
  setDefaultTestUser(): void {
    if (!localStorage.getItem('user')) {
      // Thiết lập người dùng mặc định là admin để kiểm thử
      this.setTestUser('admin');
      console.log('Đã thiết lập người dùng mặc định là admin');
    }
  }

  // Phương thức lấy thông tin người dùng từ localStorage
  getCurrentUserFromStorage(): void {
    console.log('Đang lấy thông tin người dùng...');
    const userStr = localStorage.getItem('user');
    console.log('Dữ liệu người dùng từ localStorage:', userStr);

    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
        console.log('Thông tin người dùng đã parse:', this.currentUser);
      } catch (e) {
        console.error('Lỗi khi parse thông tin người dùng từ localStorage:', e);
        // Sử dụng giá trị mặc định
        this.currentUser = { role: 'admin', cinemaId: '' };
        console.log('Đã thiết lập người dùng mặc định:', this.currentUser);
      }
    } else {
      console.log('Không tìm thấy thông tin người dùng trong localStorage');
      // Sử dụng giá trị mặc định
      this.currentUser = { role: 'admin', cinemaId: '' };
      console.log('Đã thiết lập người dùng mặc định:', this.currentUser);
    }
  }

  // Phương thức thiết lập người dùng kiểm thử
  setTestUser(role: string, cinemaId: string = ''): void {
    const user = { role, cinemaId };
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser = user;
    console.log('Đã thiết lập người dùng kiểm thử:', user);

    // Tải lại dữ liệu
    this.loadShowtimes();
    this.getAllRaps();
  }

  // Phương thức lấy tên rạp từ ID
  getCinemaName(cinemaId: string | undefined): string {
    if (!cinemaId) return 'Không xác định';

    const cinema = this.rapList.find(rap => rap.id === cinemaId);
    if (!cinema) {
      console.log(`Không tìm thấy rạp với ID: ${cinemaId}`);
      console.log('Danh sách rạp hiện tại:', this.rapList);
      return 'Không xác định';
    }
    return cinema.cinemaName;
  }

  // Phương thức khi chọn rạp, cập nhật danh sách phòng
  onCinemaChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedCinemaId: string = selectElement.value;

    console.log('Đã chọn rạp với ID:', selectedCinemaId);

    // Cập nhật cinemaId vào form
    this.showtimeForm.cinemaId = selectedCinemaId;

    if (selectedCinemaId) {
      this.getRoom(selectedCinemaId);
    } else {
      this.roomLisst = [];
      this.roomErrorMessage = '';
    }
  }

  // Load danh sách suất chiếu và lọc theo rạp của người dùng
  loadShowtimes(): void {
    console.log('Đang tải danh sách suất chiếu...');
    this.showtimesService.getAllShowtimes().subscribe({
      next: (data: ShowtimesDto[]) => {
        console.log('Dữ liệu suất chiếu nhận được:', data);
        this.dsShowtimes = data;

        // Lọc theo quyền
        if (this.currentUser.role !== 'admin' && this.currentUser.cinemaId) {
          console.log(`Lọc suất chiếu theo cinemaId: ${this.currentUser.cinemaId}`);
          this.filteredShowtimes = this.dsShowtimes.filter(
            showtime => showtime.cinemaId === this.currentUser.cinemaId
          );
          console.log('Danh sách đã lọc:', this.filteredShowtimes);
        } else {
          console.log('Hiển thị tất cả suất chiếu (admin hoặc không có cinemaId)');
          this.filteredShowtimes = [...this.dsShowtimes];
        }
      },
      error: (err: any) => {
        console.error('Lỗi khi tải danh sách suất chiếu:', err);
        alert('Không thể tải danh sách suất chiếu. Vui lòng thử lại sau!');

        // Tạo dữ liệu mẫu để kiểm thử
        this.dsShowtimes = this.createSampleShowtimes();
        this.filteredShowtimes = [...this.dsShowtimes];
      }
    });
  }

  // Tạo dữ liệu suất chiếu mẫu khi không thể lấy từ API
  createSampleShowtimes(): ShowtimesDto[] {
    console.log('Tạo dữ liệu suất chiếu mẫu');
    const sampleShowtimes = [
      new ShowtimesDto({
        id: 'sample-id-1',
        showtimeId: 'STLWE00',
        movieId: 'movie-id-1',
        movieName: 'Người Giữ Ký Ức',
        roomId: 'P001',
        roomName: 'P001',
        cinemaId: 'beta-giai-phong',
        startTime: '12:30',
        endTime: '14:30',
        showDate: '2025-05-20'
      })
    ];
    return sampleShowtimes;
  }

  // Load danh sách rạp và lọc theo quyền người dùng
  getAllRaps(): void {
    this.cinemasService.getCinemas().subscribe({
      next: (data: CinemaDto[]) => {
        // Lưu toàn bộ danh sách rạp
        this.rapList = data;
        console.log('Đã load toàn bộ danh sách rạp:', this.rapList);

        // Nếu người dùng không phải admin và có cinemaId, tải phòng
        if (this.currentUser.role !== 'admin' && this.currentUser.cinemaId) {
          this.getRoom(this.currentUser.cinemaId);
        }
      },
      error: (err: any) => {
        console.error('Lỗi khi load danh sách rạp:', err);
        alert('Không thể tải danh sách rạp. Vui lòng thử lại sau!');

        // Tạo dữ liệu rạp mẫu
        this.rapList = [
        ];
      }
    });
  }

  // Load danh sách phim
  loadAllMovies(): void {
    this.http.get<any>('http://127.0.0.1:3000/films/getfilm').subscribe({
      next: (response: any) => {
        if (response && response.code === 200 && response.data && response.data.films) {
          this.allMovies = response.data.films;
          console.log('Đã load danh sách phim:', this.allMovies);
        }
      },
      error: (err: any) => {
        console.error('Lỗi khi load danh sách phim:', err);
        alert('Không thể tải danh sách phim. Vui lòng thử lại sau!');

        // Tạo dữ liệu phim mẫu
        this.allMovies = [
          { _id: 'movie-id-1', title: 'Người Giữ Ký Ức' },
          { _id: 'movie-id-2', title: 'Phim mẫu 1' },
          { _id: 'movie-id-3', title: 'Phim mẫu 2' }
        ];
      }
    });
  }

  // Lấy danh sách phòng theo rạp
  getRoom(cinemaId: string): void {
    console.log('Đang tải danh sách phòng cho rạp ID:', cinemaId);

    if (!cinemaId) {
      console.warn('CinemaId không hợp lệ, không thể tải danh sách phòng');
      this.roomErrorMessage = 'Vui lòng chọn rạp trước khi tải danh sách phòng';
      this.roomLisst = [];
      return;
    }

    this.roomErrorMessage = '';
    this.roomService.getByCinemaId(cinemaId).subscribe({
      next: (result: RoomDto[]) => {
        this.roomLisst = result;
        console.log('Danh sách phòng đã tải:', result);
        if (result.length === 0) {
          this.roomErrorMessage = 'Không tìm thấy phòng nào thuộc rạp này.';
          // Thêm phòng mẫu nếu không có dữ liệu
          this.addSampleRooms(cinemaId);
        }

        // Nếu đã có roomId được chọn, cập nhật lại roomName
        this.updateRoomNameIfNeeded();
      },
      error: (error: any) => {
        console.error('Lỗi khi load danh sách phòng:', error);
        this.roomLisst = [];

        if (error.status === 404) {
          this.roomErrorMessage = 'Không tìm thấy rạp hoặc không có phòng nào thuộc rạp này.';
        } else if (error.status === 500) {
          this.roomErrorMessage = 'Lỗi server: Không thể tải danh sách phòng. Vui lòng thử lại sau.';
        } else {
          this.roomErrorMessage = 'Đã xảy ra lỗi khi tải danh sách phòng.';
        }

        // Thêm phòng mẫu để kiểm thử
        this.addSampleRooms(cinemaId);
      }
    });
  }

  // Phương thức thêm phòng mẫu
  addSampleRooms(cinemaId: string): void {
    console.log('Thêm phòng mẫu cho rạp ID:', cinemaId);
    // Tạo một số phòng mẫu để kiểm thử
    this.roomLisst = [
    ];

    // Cập nhật lại roomName nếu cần
    this.updateRoomNameIfNeeded();
  }

  // Cập nhật roomName nếu đã có roomId
  updateRoomNameIfNeeded(): void {
    if (this.showtimeForm && this.showtimeForm.roomId) {
      const selectedRoom = this.roomLisst.find(room => room.id === this.showtimeForm.roomId);
      if (selectedRoom) {
        this.showtimeForm.roomName = selectedRoom.room_name;
        console.log(`Đã cập nhật tên phòng: ${selectedRoom.room_name} cho roomId: ${this.showtimeForm.roomId}`);
      }
    }
  }

  // Tìm kiếm suất chiếu
  onSearch(): void {
    console.log('Từ khóa tìm kiếm:', this.searchTerm);
    if (!this.searchTerm.trim()) {
      // Nếu không có từ khóa, trả về danh sách gốc
      if (this.currentUser.role !== 'admin' && this.currentUser.cinemaId) {
        this.filteredShowtimes = this.dsShowtimes.filter(
          showtime => showtime.cinemaId === this.currentUser.cinemaId
        );
      } else {
        this.filteredShowtimes = [...this.dsShowtimes];
      }
      return;
    }

    const term: string = this.searchTerm.toLowerCase();
    // Lọc danh sách theo từ khóa
    let filteredList = this.dsShowtimes.filter((showtime: ShowtimesDto) =>
      showtime.showtimeId.toLowerCase().includes(term) ||
      (showtime.movieName && showtime.movieName.toLowerCase().includes(term)) ||
      (showtime.roomName && showtime.roomName.toLowerCase().includes(term))
    );

    // Nếu không phải admin, lọc tiếp theo rạp
    if (this.currentUser.role !== 'admin' && this.currentUser.cinemaId) {
      filteredList = filteredList.filter(
        showtime => showtime.cinemaId === this.currentUser.cinemaId
      );
    }

    this.filteredShowtimes = filteredList;
  }

  // Khi chọn phim, cập nhật tên phim vào form
  onMovieChange(movieId: string): void {
    console.log('Chọn phim với ID:', movieId);
    const selectedMovie: Movie | undefined = this.allMovies.find(movie => movie._id === movieId);

    if (selectedMovie) {
      this.showtimeForm.movieName = selectedMovie.title;
      console.log('Đã chọn phim:', selectedMovie.title);
    } else {
      // Nếu không tìm thấy phim trong danh sách, giữ lại tên phim hiện tại
      console.log('Không tìm thấy phim với ID:', movieId);
      if (!this.showtimeForm.movieName) {
        // Nếu chưa có tên phim, thiết lập tên mặc định
        this.showtimeForm.movieName = 'Phim ID: ' + movieId;
      }
    }
  }

  // Khi chọn phòng, cập nhật tên phòng vào form
  onRoomChange(roomId: string): void {
    console.log('Chọn phòng với ID:', roomId);
    const selectedRoom: RoomDto | undefined = this.roomLisst.find(room => room.id === roomId);

    if (selectedRoom) {
      this.showtimeForm.roomName = selectedRoom.room_name;
      console.log('Đã chọn phòng:', selectedRoom.room_name);
    } else {
      // Nếu không tìm thấy phòng trong danh sách, giữ lại tên phòng hiện tại
      console.log('Không tìm thấy phòng với ID:', roomId);
      if (!this.showtimeForm.roomName) {
        // Nếu chưa có tên phòng, thiết lập tên mặc định
        this.showtimeForm.roomName = 'P' + roomId;
      }
    }
  }

  // Định dạng thời gian bắt đầu
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

  // Định dạng thời gian kết thúc
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

  // Mở modal thêm mới
  openAddModal(): void {
    // Kiểm tra quyền: người dùng phải có cinemaId hoặc là admin
    if (this.currentUser.role !== 'admin' && !this.currentUser.cinemaId) {
      alert('Bạn không có quyền thêm suất chiếu!');
      return;
    }

    this.isEditing = false;
    this.isViewOnly = false;
    this.isMainModalOpen = true;

    // Khởi tạo form với giá trị mặc định
    const currentDate: Date = new Date();
    const formattedDate: string = currentDate.toISOString().slice(0, 10); // yyyy-MM-dd
    const randomId: string = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    // Tạo thời gian mặc định với làm tròn lên 15 phút
    const currentHour: number = currentDate.getHours();
    const roundedMinutes: number = Math.ceil(currentDate.getMinutes() / 15) * 15;
    let defaultStartTime: string = '';
    if (roundedMinutes === 60) {
      defaultStartTime = `${(currentHour + 1) % 24}:00`;
    } else {
      defaultStartTime = `${currentHour}:${roundedMinutes.toString().padStart(2, '0')}`;
    }

    // Thời gian kết thúc mặc định là 2 giờ sau
    const startTimeParts: string[] = defaultStartTime.split(':');
    const startHour: number = parseInt(startTimeParts[0]);
    const startMinute: number = parseInt(startTimeParts[1]);
    const endHour: number = (startHour + 2) % 24;
    const defaultEndTime: string = `${endHour}:${startMinute.toString().padStart(2, '0')}`;

    // Tự động thiết lập cinemaId nếu không phải admin
    const userCinemaId = this.currentUser.role !== 'admin' ? this.currentUser.cinemaId : '';

    this.showtimeForm = new ShowtimesDto({
      showtimeId: 'ST' + randomId,
      movieId: '',
      roomId: '',
      cinemaId: userCinemaId || '',
      startTime: defaultStartTime,
      endTime: defaultEndTime,
      showDate: formattedDate
    });

    console.log('Form thêm mới đã được khởi tạo:', this.showtimeForm);

    // Nếu có cinemaId hợp lệ, load danh sách phòng
    if (userCinemaId) {
      console.log('Tự động load danh sách phòng cho rạp:', userCinemaId);
      this.getRoom(userCinemaId);
    }
  }

  // Mở modal sửa
  editSchedule(showtime: ShowtimesDto): void {
    // Kiểm tra quyền: người dùng không phải admin chỉ được sửa suất chiếu của rạp mình
    if (this.currentUser.role !== 'admin' &&
      this.currentUser.cinemaId &&
      showtime.cinemaId !== this.currentUser.cinemaId) {
      alert('Bạn không có quyền sửa suất chiếu này!');
      return;
    }

    this.isEditing = true;
    this.isViewOnly = false;
    this.isMainModalOpen = true;

    // Clone dữ liệu từ danh sách
    this.showtimeForm = showtime.clone();

    // Format ngày về yyyy-MM-dd nếu cần
    this.formatShowDate();

    // Load danh sách phòng của rạp
    if (this.showtimeForm.cinemaId) {
      this.getRoom(this.showtimeForm.cinemaId);
    }

    console.log('Đang sửa suất chiếu, form hiện tại:', this.showtimeForm);
  }

  // Format ngày trong form
  formatShowDate(): void {
    if (this.showtimeForm.showDate) {
      try {
        const date: Date = new Date(this.showtimeForm.showDate);
        if (!isNaN(date.getTime())) {
          this.showtimeForm.showDate = date.toISOString().slice(0, 10);
        }
      } catch (e) {
        console.error('Lỗi khi chuyển đổi ngày:', e);
      }
    }
  }

  // Mở modal xem chi tiết
  viewSchedule(showtime: ShowtimesDto): void {
    // Người dùng không phải admin chỉ được xem suất chiếu của rạp mình
    if (this.currentUser.role !== 'admin' &&
      this.currentUser.cinemaId &&
      showtime.cinemaId !== this.currentUser.cinemaId) {
      alert('Bạn không có quyền xem chi tiết suất chiếu này!');
      return;
    }

    this.isViewOnly = true;
    this.isEditing = false;
    this.isMainModalOpen = true;

    // Clone dữ liệu từ danh sách
    this.showtimeForm = showtime.clone();

    // Format ngày về yyyy-MM-dd nếu cần
    this.formatShowDate();

    // Load danh sách phòng của rạp
    if (this.showtimeForm.cinemaId) {
      this.getRoom(this.showtimeForm.cinemaId);
    }

    console.log('Xem chi tiết suất chiếu:', this.showtimeForm);
  }

  // Đóng modal chính
  closeMainModal(): void {
    this.isMainModalOpen = false;
    this.roomErrorMessage = '';
  }

  // Lưu suất chiếu (thêm mới hoặc cập nhật)
  saveSchedule(): void {
    // Đảm bảo nếu không phải admin, thì cinemaId phải là của người dùng
    if (this.currentUser.role !== 'admin' && this.currentUser.cinemaId) {
      // Ghi đè cinemaId bằng ID của người dùng để đảm bảo an toàn
      this.showtimeForm.cinemaId = this.currentUser.cinemaId;
      console.log('Đã gán cinemaId của người dùng:', this.currentUser.cinemaId);
    }

    // Kiểm tra quyền: người dùng không phải admin chỉ được thêm/sửa suất chiếu của rạp mình
    if (this.currentUser.role !== 'admin' &&
      this.currentUser.cinemaId &&
      this.showtimeForm.cinemaId !== this.currentUser.cinemaId) {
      alert('Bạn không có quyền thêm/sửa suất chiếu cho rạp này!');
      return;
    }

    // Validate form
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
    if (!this.showtimeForm.cinemaId) {
      alert('Vui lòng chọn rạp!');
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

    // Format thời gian nếu cần
    if (/^\d{4}$/.test(this.showtimeForm.startTime)) {
      this.onStartTimeInput(this.showtimeForm.startTime);
    }
    if (/^\d{4}$/.test(this.showtimeForm.endTime)) {
      this.onEndTimeInput(this.showtimeForm.endTime);
    }

    // Format showDate về dd/MM/yyyy
    const date = new Date(this.showtimeForm.showDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    this.showtimeForm.showDate = `${day}/${month}/${year}`;

    // Debug log
    console.log('Dữ liệu gửi đi:', this.showtimeForm.toJSON());

    if (this.isEditing) {
      // Cập nhật suất chiếu
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
          console.error('Lỗi cập nhật:', err);
          if (err.error && err.error.message) {
            alert(`Lỗi cập nhật: ${err.error.message}`);
          } else {
            alert('Lỗi cập nhật! Vui lòng kiểm tra dữ liệu và thử lại.');
          }
        }
      });
    } else {
      // Thêm mới suất chiếu
      this.showtimesService.createShowtime(this.showtimeForm).subscribe({
        next: (response: any) => {
          console.log('Kết quả thêm mới:', response);
          alert('Thêm thành công!');
          this.isMainModalOpen = false;
          this.loadShowtimes();
        },
        error: (err: any) => {
          console.error('Lỗi thêm mới:', err);
          if (err.error && err.error.message) {
            alert(`Lỗi thêm mới: ${err.error.message}`);
          } else {
            alert('Lỗi thêm mới! Vui lòng kiểm tra dữ liệu và thử lại.');
          }
        }
      });
    }
  }

  // Mở modal xóa
  deleteSchedule(showtime: ShowtimesDto): void {
    // Kiểm tra quyền: người dùng không phải admin chỉ được xóa suất chiếu của rạp mình
    if (this.currentUser.role !== 'admin' &&
      this.currentUser.cinemaId &&
      showtime.cinemaId !== this.currentUser.cinemaId) {
      alert('Bạn không có quyền xóa suất chiếu này!');
      return;
    }

    this.showtimeDangXoa = showtime;
    this.deletePassword = '';
    this.isDeleteModalOpen = true;
  }

  // Đóng modal xóa
  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
  }

  // Xác nhận xóa
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
          console.error('Lỗi xoá:', err);
          alert('Lỗi xoá!');
        }
      });
    } else {
      alert('Mật khẩu không đúng!');
    }
  }
}