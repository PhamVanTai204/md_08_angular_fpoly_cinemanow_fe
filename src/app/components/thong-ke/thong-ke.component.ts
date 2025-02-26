import { Component } from '@angular/core';

@Component({
  selector: 'app-thong-ke',
  standalone: false,
  
  templateUrl: './thong-ke.component.html',
  styleUrl: './thong-ke.component.css'
})
export class ThongKeComponent {

  startDate: string = '';
  endDate: string = '';
  selectedCinema: string = 'Cinema Hà Nội';
  timeFilter: string = 'Lọc theo 1 tháng';
  selectedMovie: string = '';

  handleThongKe() {
    console.log('Xử lý thống kê với:', {
      startDate: this.startDate,
      endDate: this.endDate,
      selectedCinema: this.selectedCinema,
      timeFilter: this.timeFilter,
      selectedMovie: this.selectedMovie
    });
  }
}