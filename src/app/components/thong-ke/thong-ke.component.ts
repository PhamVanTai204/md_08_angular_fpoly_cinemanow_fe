// thong-ke.component.ts
import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { ThongKeService } from '../../../shared/services/thongke.service';

@Component({
  selector: 'app-thong-ke',
  standalone: false,

  templateUrl: './thong-ke.component.html',
  styleUrls: ['./thong-ke.component.css'],
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
    totalRevenue: 0
  };

  // Dữ liệu thống kê theo phim
  movieRevenueData: any[] = [];

  // Dữ liệu thống kê theo rạp
  cinemaRevenueData: any[] = [];

  isLoading = false;

  constructor(private thongKeService: ThongKeService) { }

  ngOnInit(): void {
    // Khởi tạo ngày bắt đầu và kết thúc mặc định (tháng hiện tại)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.startDate = this.formatDate(firstDay);
    this.endDate = this.formatDate(lastDay);

    // Load dữ liệu ban đầu
    this.loadInitialData();
  }

  // Load dữ liệu ban đầu
  private loadInitialData() {
    this.handleThongKe();
  }

  // Xử lý nút thống kê
  handleThongKe() {
    this.isLoading = true;

    // Gọi API để lấy dữ liệu thống kê tổng quan
    this.thongKeService.getRevenueByDateRange(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.summaryData = {
          dailyRevenue: data.totalRevenue,
          totalTickets: data.ticketCount,
          totalRevenue: data.totalRevenue
        };
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu thống kê tổng quan:', err);
      }
    });

    // Gọi API để lấy dữ liệu chi tiết
    this.thongKeService.getDetailedRevenueStats(this.startDate, this.endDate).subscribe({
      next: (data) => {
        // Xử lý dữ liệu thống kê theo phim
        this.movieRevenueData = data.movies.map((movie: any) => ({
          name: movie.movie.title,
          tickets: movie.ticketCount,
          revenue: movie.revenue
        }));

        // Xử lý dữ liệu thống kê theo rạp (cần thêm logic từ backend)
        // Giả sử chúng ta có dữ liệu rạp từ API


        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu thống kê chi tiết:', err);
        this.isLoading = false;
      }
    });
    // Trong handleThongKe()
    this.thongKeService.getRevenueByCinema(this.startDate, this.endDate).subscribe({
      next: (cinemaData) => {
        // Cập nhật theo đúng cấu trúc API trả về
        this.cinemaRevenueData = cinemaData.cinemaStats.map((cinema: any) => ({
          name: cinema.cinema.cinema_name, // Sử dụng cinema_name thay vì name
          tickets: cinema.ticketCount,
          revenue: cinema.revenue
        }));

        // Cập nhật tổng doanh thu từ API (nếu muốn dùng)
        this.summaryData.totalRevenue = cinemaData.totalRevenue;

        console.log('Dữ liệu rạp:', this.cinemaRevenueData);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu thống kê rạp:', err);
        this.isLoading = false;
      }
    });
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


  // Gọi hàm này trong ngOnInit hoặc handleThongKe
}