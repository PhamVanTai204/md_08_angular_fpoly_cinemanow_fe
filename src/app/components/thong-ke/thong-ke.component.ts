import { Component } from '@angular/core';

@Component({
  selector: 'app-thong-ke',
  standalone: false,
  
  templateUrl: './thong-ke.component.html',
  styleUrl: './thong-ke.component.css'
})
export class ThongKeComponent {
  // Ví dụ các biến ngModel để thao tác form
  startDate: string = '';
  endDate: string = '';
  selectedCinema: string = 'Cinema Hà Nội';
  timeFilter: string = 'Lọc theo 1 tháng';
  selectedMovie: string = '';

  // Hàm click nút "THỐNG KÊ"
  handleThongKe() {
    console.log('Xử lý thống kê với:', {
      startDate: this.startDate,
      endDate: this.endDate,
      selectedCinema: this.selectedCinema,
      timeFilter: this.timeFilter,
      selectedMovie: this.selectedMovie
    });
    // Thêm logic gọi API hoặc xử lý dữ liệu tại đây (nếu cần)
  }
}