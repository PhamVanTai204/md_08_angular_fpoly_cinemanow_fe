import { Component, OnInit } from '@angular/core';

interface IRoom {
  name: string;      // Tên phòng
  type: string;      // Loại phòng (2D, 3D, IMAX, ...)
  status: string;    // ONLINE / OFFLINE
}

interface IRap {
  name: string;      // Tên rạp
  address: string;   // Địa chỉ
  city: string;      // Thành phố
  rooms: IRoom[];    // Danh sách phòng
}

@Component({
  selector: 'app-rap',
  standalone: false,
  templateUrl: './rap.component.html',
  styleUrls: ['./rap.component.css']
})
export class RapComponent implements OnInit {
  // ======= DỮ LIỆU MẪU =======
  rapList: IRap[] = [
    {
      name: 'Cinema HÀ NỘI',
      address: 'Số 8 đường Phạm Hùng, Nam Từ Liêm',
      city: 'HÀ NỘI',
      rooms: [
        { name: 'Phòng 1', type: '2D', status: 'ONLINE' },
        { name: 'Phòng 2', type: '3D', status: 'OFFLINE' }
      ]
    },
    {
      name: 'Cinema HỒ CHÍ MINH',
      address: 'Số 20 đường Cách Mạng Tháng 8, Quận 1',
      city: 'HỒ CHÍ MINH',
      rooms: [
        { name: 'Phòng 1', type: '2D', status: 'ONLINE' }
      ]
    },
    {
      name: 'Cinema ĐÀ NẴNG',
      address: 'Số 6 đường Trần Hưng Đạo, Phường 5',
      city: 'ĐÀ NẴNG',
      rooms: [
        { name: 'Phòng 1', type: '3D', status: 'ONLINE' }
      ]
    }
  ];

  // ======= BIẾN CHO DIALOG THÊM RẠP =======
  isAddModalOpen = false;
  newRap: IRap = {
    name: '',
    address: '',
    city: '',
    rooms: []
  };

  // ======= BIẾN CHO DIALOG CHỈNH SỬA RẠP =======
  isEditModalOpen = false;
  editRapIndex = -1;              // Lưu vị trí rạp đang sửa trong rapList
  editRapData: IRap = {
    name: '',
    address: '',
    city: '',
    rooms: []
  };

  constructor() {}

  ngOnInit(): void {}

  // =========================
  //        THÊM RẠP
  // =========================
  openAddModal(): void {
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.newRap = { name: '', address: '', city: '', rooms: [] };
  }

  saveNewRap(): void {
    // Thêm rạp mới vào danh sách
    this.rapList.push({ ...this.newRap });
    this.closeAddModal();
  }

  // =========================
  //      CHỈNH SỬA RẠP
  // =========================
  openEditModal(rap: IRap, index: number): void {
    this.editRapIndex = index;
    // Deep copy dữ liệu để chỉnh sửa, tránh thay đổi trực tiếp
    this.editRapData = JSON.parse(JSON.stringify(rap));
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editRapIndex = -1;
    this.editRapData = { name: '', address: '', city: '', rooms: [] };
  }

  saveEditRap(): void {
    // Ghi đè rạp đã chỉnh sửa vào rapList
    this.rapList[this.editRapIndex] = JSON.parse(JSON.stringify(this.editRapData));
    this.closeEditModal();
  }

  addRoom(): void {
    // Thêm 1 phòng trống khi bấm "+ THÊM PHÒNG"
    this.editRapData.rooms.push({
      name: '',
      type: '',
      status: 'ONLINE'
    });
  }

  // =========================
  //          XÓA RẠP
  // =========================
  deleteRap(rap: IRap): void {
    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa rạp "${rap.name}"?`);
    if (confirmDelete) {
      // Tìm vị trí rạp và xóa khỏi rapList
      const index = this.rapList.indexOf(rap);
      if (index !== -1) {
        this.rapList.splice(index, 1);
      }
    }
  }
}
