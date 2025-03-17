import { Component } from '@angular/core';

@Component({
  selector: 'app-the-loai-phim',
  standalone: false,
  templateUrl: './the-loai-phim.component.html',
  styleUrls: ['./the-loai-phim.component.css']
})
export class TheLoaiPhimComponent {
  showDialog = false;       // Biến kiểm soát hộp thoại thêm
  showEditDialog = false;   // Biến kiểm soát hộp thoại sửa
  genreName = '';           // Lưu giá trị nhập vào
  editIndex: number | null = null;  // Lưu index của mục đang chỉnh sửa

  genres = [  // Danh sách thể loại phim (đã bỏ status)
    { name: 'TÂM LÝ' },
    { name: 'HÀNH ĐỘNG' },
    { name: 'TÌNH CẢM' },
    { name: 'HÀI KỊCH' },
    { name: 'CHÍNH TRỊ' }
  ];

  // Mở hộp thoại thêm thể loại
  openDialog() {
    this.genreName = '';  // Reset input
    this.showDialog = true;
  }

  // Đóng hộp thoại
  closeDialog() {
    this.showDialog = false;
    this.showEditDialog = false;
    this.genreName = '';  // Reset input
  }

  // Thêm thể loại mới
  saveGenre() {
    if (this.genreName.trim()) {
      this.genres.push({ name: this.genreName.trim().toUpperCase() });
      this.closeDialog();
    }
  }

  // Mở hộp thoại chỉnh sửa
  openEditDialog(index: number) {
    this.editIndex = index;
    this.genreName = this.genres[index].name;
    this.showEditDialog = true;
  }

  // Cập nhật thể loại sau khi chỉnh sửa
  updateGenre() {
    if (this.genreName.trim() && this.editIndex !== null) {
      this.genres[this.editIndex].name = this.genreName.trim().toUpperCase();
      this.closeDialog();
    }
  }

  // Xóa thể loại với xác nhận
  deleteGenre(index: number) {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa thể loại này không?");
    if (confirmDelete) {
      this.genres.splice(index, 1);
    }
  }
}
