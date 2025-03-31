import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-thong-ke',
  
  templateUrl: './thong-ke.component.html',
  styleUrls: ['./thong-ke.component.css'],
  standalone: false
})
export class ThongKeComponent implements OnInit {
  // Biến dữ liệu cho form
  startDate: string = '';
  endDate: string = '';
  selectedCinema: string = 'Cinema Hà Nội';
  timeFilter: string = 'Lọc theo 1 tháng';
  selectedMovie: string = '';

  // Dữ liệu thống kê
  summaryData = {
    dailyRevenue: 0,
    totalTickets: 0,
    totalRevenue: 650000
  };

  // Dữ liệu thống kê theo phim
  movieRevenueData = [
    {
      name: 'NGƯỜI ĐẸP VÀ QUÁI VẬT',
      tickets: 120,
      revenue: 1200000
    },
    {
      name: 'PHIM ABC',
      tickets: 90,
      revenue: 900000
    }
  ];

  // Dữ liệu thống kê theo rạp
  cinemaRevenueData = [
    {
      name: 'Cinema Hà Nội',
      tickets: 80,
      revenue: 800000
    },
    {
      name: 'Cinema Hồ Chí Minh',
      tickets: 100,
      revenue: 1000000
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Khởi tạo ngày bắt đầu và kết thúc mặc định (tháng hiện tại)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.startDate = this.formatDate(firstDay);
    this.endDate = this.formatDate(lastDay);
  }

  // Xử lý nút thống kê
  handleThongKe() {
    console.log('Xử lý thống kê với:', {
      startDate: this.startDate,
      endDate: this.endDate,
      selectedCinema: this.selectedCinema,
      timeFilter: this.timeFilter,
      selectedMovie: this.selectedMovie
    });

    // Mô phỏng gọi API và cập nhật dữ liệu
    this.updateStatistics();
  }

  // Cập nhật dữ liệu thống kê (giả lập)
  private updateStatistics() {
    // Trong thực tế, đây sẽ là dữ liệu từ API
    // Ở đây chỉ giả lập việc cập nhật
    if (this.selectedCinema === 'Cinema Hà Nội') {
      this.summaryData = {
        dailyRevenue: 250000,
        totalTickets: 25,
        totalRevenue: 650000
      };
    } else if (this.selectedCinema === 'Cinema Hồ Chí Minh') {
      this.summaryData = {
        dailyRevenue: 320000,
        totalTickets: 32,
        totalRevenue: 980000
      };
    } else {
      this.summaryData = {
        dailyRevenue: 180000,
        totalTickets: 18,
        totalRevenue: 520000
      };
    }
  }

  // Định dạng ngày thành yyyy-MM-dd để sử dụng trong input type="date"
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Tính tổng số vé từ dữ liệu phim
  get totalMovieTickets(): number {
    return this.movieRevenueData.reduce((total, movie) => total + movie.tickets, 0);
  }

  // Tính tổng doanh thu từ dữ liệu phim
  get totalMovieRevenue(): number {
    return this.movieRevenueData.reduce((total, movie) => total + movie.revenue, 0);
  }

  // Tính tổng số vé từ dữ liệu rạp
  get totalCinemaTickets(): number {
    return this.cinemaRevenueData.reduce((total, cinema) => total + cinema.tickets, 0);
  }

  // Tính tổng doanh thu từ dữ liệu rạp
  get totalCinemaRevenue(): number {
    return this.cinemaRevenueData.reduce((total, cinema) => total + cinema.revenue, 0);
  }
}