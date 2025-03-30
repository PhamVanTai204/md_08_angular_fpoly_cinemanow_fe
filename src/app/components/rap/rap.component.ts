import { Component, OnInit } from '@angular/core';
import { CinemasService } from '../../../shared/services/cinemas.service';
import { CinemaDto } from '../../../shared/dtos/cinemasDto.dto';
import { RoomService } from '../../../shared/services/room.service';
import { RoomDto } from '../../../shared/dtos/roomDto.dto';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-rap',
  standalone: false,
  templateUrl: './rap.component.html',
  styleUrls: ['./rap.component.css']
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
  constructor(
    private cinemasService: CinemasService,
    private roomService: RoomService
  ) { }

  ngOnInit(): void {
    this.getAllRaps();
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
    debugger
    this.cinemasService.addCinema(this.newRap).subscribe({
      next: (addedCinema: CinemaDto) => {
        // Thêm vào danh sách hiện có
        this.rapList = [...this.rapList, addedCinema];
        // Đóng modal, reset form
        this.isAddModalOpen = false;
        this.newRap = new CinemaDto();
      },
      error: (err) => console.error('Error adding cinema:', err)
    });
  }

  // ====== Sửa rạp ======
  async openEditModal(rap: CinemaDto, index: number): Promise<void> {
    this.editRapIndex = index;
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
        }
        this.isEditModalOpen = false;
        this.editRapIndex = -1;
        this.getAllRaps();
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
      },
      error: (err) => console.error('Error deleting cinema:', err)
    });
  }




  // Hàm chỉnh sửa phòng
  editRoom(index: number) {

  }
  // Hàm xóa phòng
  deleteRoom(index: number) {

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
