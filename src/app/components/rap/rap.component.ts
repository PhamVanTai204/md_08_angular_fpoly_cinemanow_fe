import { Component, OnInit } from '@angular/core';
import { CinemasService } from '../../../shared/services/cinemas.service';
import { CinemaDto } from '../../../shared/dtos/cinemasDto.dto';
import { RoomService } from '../../../shared/services/room.service';
import { RoomDto } from '../../../shared/dtos/roomDto.dto';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-rap',
  templateUrl: './rap.component.html',
  styleUrls: ['./rap.component.css'],
  standalone: false // Đảm bảo component không phải standalone
})
export class RapComponent implements OnInit {
  rapList: CinemaDto[] = [];
  roomLisst: RoomDto[] = [];
  isAddModalOpen = false;
  newRap: CinemaDto = new CinemaDto();
  isAddRoomModalOpen = false;
  newRoom: RoomDto = new RoomDto();
  selectedCinemaId: string = ''; // ID của rạp đang được chỉnh sửa
  // Modal sửa
  isEditModalOpen = false;
  editRapIndex: number = -1;
  editRapData: CinemaDto = new CinemaDto();

  cinema_id: string = '';
  room_name: string = '';
  room_style: string = '';
  total_seat: number = 0;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 6; // Số rạp hiển thị trên mỗi trang
  totalPages: number = 1;
  pagedRapList: CinemaDto[] = [];

  constructor(
    private cinemasService: CinemasService,
    private roomService: RoomService
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

  // Tạo mảng số trang với điểm ngắt (...) cho giao diện phân trang
  getPageNumbers(): (number | string)[] {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    const visiblePages = 5; // Số nút trang hiển thị (không tính Previous/Next)
    
    if (totalPages <= visiblePages) {
      // Nếu tổng số trang <= số nút hiển thị, hiển thị tất cả
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    
    // Luôn hiển thị trang 1
    pages.push(1);
    
    // Tính toán phạm vi trang hiển thị xung quanh trang hiện tại
    let rangeStart = Math.max(2, currentPage - 1);
    let rangeEnd = Math.min(totalPages - 1, currentPage + 1);
    
    // Điều chỉnh để đảm bảo có đủ số lượng nút trang hiển thị
    while (rangeEnd - rangeStart < Math.min(visiblePages - 3, totalPages - 2)) {
      if (rangeStart > 2) {
        rangeStart--;
      } else if (rangeEnd < totalPages - 1) {
        rangeEnd++;
      } else {
        break;
      }
    }
    
    // Thêm dấu ... trước các trang ở giữa nếu cần
    if (rangeStart > 2) {
      pages.push('...');
    }
    
    // Thêm các trang ở giữa
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }
    
    // Thêm dấu ... sau các trang ở giữa nếu cần
    if (rangeEnd < totalPages - 1) {
      pages.push('...');
    }
    
    // Luôn hiển thị trang cuối cùng
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
        this.getRoom(this.selectedCinemaId)
        this.isAddRoomModalOpen = false;
      },
      error: (err) => console.error('Lỗi khi thêm phòng:', err)
    });
  }

  // ====== Lấy danh sách rạp ======
  getAllRaps(): void {
    this.cinemasService.getCinemas().subscribe({
      next: (data) => {
        this.rapList = data;
        this.updatePagedData(); // Cập nhật dữ liệu phân trang
      },
      error: (err) => {
        console.error('Error fetching cinemas:', err);
      }
    });
  }

  // ====== Thêm rạp ======
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
        // Thêm vào danh sách hiện có
        this.rapList = [...this.rapList, addedCinema];
        this.updatePagedData(); // Cập nhật dữ liệu phân trang
        // Đóng modal, reset form
        this.isAddModalOpen = false;
        this.newRap = new CinemaDto();
      },
      error: (err) => console.error('Error adding cinema:', err)
    });
  }

  // ====== Sửa rạp ======
  async openEditModal(rap: CinemaDto, index: number): Promise<void> {
    // Tính toán lại chỉ số thực của rap trong danh sách gốc
    const actualIndex = (this.currentPage - 1) * this.pageSize + index;
    this.editRapIndex = actualIndex;
    this.editRapData = rap.clone();
    this.isEditModalOpen = true; // Mở modal trước khi tải dữ liệu phòng
    this.selectedCinemaId = rap.id; // Gán ID rạp đang chỉnh sửa

    try {
      this.roomLisst = await lastValueFrom(this.roomService.getByCinemaId(rap.id));
      console.log(this.roomLisst, 'Danh sách phòng đã tải');
    } catch (error) {
      console.error('Lỗi khi tải danh sách phòng:', error);
      this.roomLisst = []; // Đặt danh sách phòng thành rỗng nếu có lỗi
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
          // Thay thế phần tử trong mảng
          this.rapList = this.rapList.map((rap, i) =>
            i === this.editRapIndex ? updatedCinema : rap
          );
          this.updatePagedData(); // Cập nhật dữ liệu phân trang
        }
        this.isEditModalOpen = false;
        this.editRapIndex = -1;
      },
      error: (err) => console.error('Error updating cinema:', err)
    });
  }
  // ====== Xóa rạp ======
  deleteRap(rap: CinemaDto): void {
    const confirmDelete = confirm(`Bạn có chắc muốn xóa rạp: ${rap.cinemaName}?`);
    if (!confirmDelete) return;

    this.cinemasService.deleteCinema(rap.id).subscribe({
      next: () => {
        // Loại bỏ rạp khỏi danh sách
        this.rapList = this.rapList.filter(item => item.id !== rap.id);
        this.updatePagedData(); // Cập nhật dữ liệu phân trang
      },
      error: (err) => console.error('Error deleting cinema:', err)
    });
  }

  // Hàm chỉnh sửa phòng
  editRoom(index: number) {
    // Phương thức xử lý chỉnh sửa phòng
  }
  
  // Hàm xóa phòng
  deleteRoom(index: number) {
    // Phương thức xử lý xóa phòng
  }
  
  getRoom(id: string) {
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
}