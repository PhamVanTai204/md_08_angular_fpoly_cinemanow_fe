import { Component, OnInit } from '@angular/core';
import { GenresService } from '../../../shared/services/genres.service';
import { GenresDto } from '../../../shared/dtos/genresDto.dto';

@Component({
  selector: 'app-the-loai-phim',
  templateUrl: './the-loai-phim.component.html',
  styleUrls: ['./the-loai-phim.component.css'],
  standalone: false
})
export class TheLoaiPhimComponent implements OnInit {
  showDialog = false;
  showEditDialog = false;
  genreName = '';
  editIndex: number | null = null;
  genres: GenresDto[] = [];

  constructor(private genresService: GenresService) { }

  ngOnInit(): void {
    this.loadGenres();
  }

  // Lấy danh sách thể loại
  loadGenres(): void {
    this.genresService.getGenres().subscribe({
      next: (data: GenresDto[]) => {
        this.genres = data;
      },
      error: (error) => {
        console.error('Lỗi khi tải dữ liệu thể loại:', error);
      }
    });
  }

  // Mở dialog thêm mới
  openDialog(): void {
    this.genreName = '';
    this.showDialog = true;
  }

  // Đóng tất cả dialog
  closeDialog(): void {
    this.showDialog = false;
    this.showEditDialog = false;
    this.genreName = '';
    this.editIndex = null;
  }

  // Thêm thể loại mới
  saveGenre(): void {
    if (this.genreName.trim()) {
      const newGenre = new GenresDto();
      newGenre.genreName = this.genreName.trim();
      this.genresService.createGenre(newGenre).subscribe({
        next: () => {
          // Thay vì push vào mảng, ta gọi loadGenres() để cập nhật lại từ server
          this.loadGenres();
          this.closeDialog();
        },
        error: (error) => {
          console.error('Lỗi khi thêm thể loại:', error);
        }
      });
    }
  }

  // Mở dialog chỉnh sửa
  openEditDialog(index: number): void {
    this.editIndex = index;
    this.genreName = this.genres[index].genreName || '';
    this.showEditDialog = true;
  }

  // Cập nhật thể loại
  updateGenre(): void {
    if (this.genreName.trim() && this.editIndex !== null) {
      const updatedGenre = new GenresDto();
      updatedGenre.id = this.genres[this.editIndex].id;
      updatedGenre.genreName = this.genreName.trim();

      this.genresService.updateGenre(updatedGenre.id, updatedGenre).subscribe({
        next: () => {
          // Thay vì cập nhật mảng, gọi loadGenres() để đảm bảo dữ liệu mới
          this.loadGenres();
          this.closeDialog();
        },
        error: (error) => {
          console.error('Lỗi khi cập nhật thể loại:', error);
        }
      });
    }
  }

  // Xóa thể loại
  deleteGenre(index: number): void {
    const genreToDelete = this.genres[index];
    if (window.confirm("Bạn có chắc chắn muốn xóa thể loại này không?")) {
      if (genreToDelete.id) {
        this.genresService.deleteGenre(genreToDelete.id).subscribe({
          next: () => {
            // Thay vì splice mảng, gọi loadGenres()
            this.loadGenres();
          },
          error: (error) => {
            console.error('Lỗi khi xóa thể loại:', error);
          }
        });
      }
    }
  }
}
