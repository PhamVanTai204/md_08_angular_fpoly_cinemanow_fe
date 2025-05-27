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
  selectedCinema: string = 'Tất cả';
  timeFilter: string = 'Lọc theo 1 tháng';
  selectedMovie: string = 'Tất cả';
  originalMovieRevenueData: any[] = [];
  originalCinemaRevenueData: any[] = [];
  currentUser: any;
  isManager: boolean = false;

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
    // Lấy thông tin user từ localStorage
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.isManager = this.currentUser?.role === 2;

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

    // Lấy cinema_id nếu là manager
    const cinemaId = this.isManager ? this.currentUser.cinema_id : undefined;

    // Gọi API để lấy dữ liệu thống kê tổng quan
    this.thongKeService.getRevenueByDateRange(this.startDate, this.endDate, cinemaId).subscribe({
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
    this.thongKeService.getDetailedRevenueStats(this.startDate, this.endDate, cinemaId).subscribe({
      next: (data) => {
        // Xử lý dữ liệu thống kê theo phim
        this.movieRevenueData = data.movies.map((movie: any) => ({
          name: movie.movie.title,
          tickets: movie.ticketCount,
          revenue: movie.revenue
        }));
        this.originalMovieRevenueData = [...this.movieRevenueData];
        this.filterMovieData();

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu thống kê chi tiết:', err);
        this.isLoading = false;
      }
    });

    // Chỉ gọi API thống kê theo rạp nếu không phải là manager (role != 2)
    if (!this.isManager) {
      this.thongKeService.getRevenueByCinema(this.startDate, this.endDate).subscribe({
        next: (cinemaData) => {
          this.cinemaRevenueData = cinemaData.cinemaStats.map((cinema: any) => ({
            name: cinema.cinema.cinema_name,
            tickets: cinema.ticketCount,
            revenue: cinema.revenue
          }));
          this.originalCinemaRevenueData = [...this.cinemaRevenueData];
          this.filterCinemaData();

          console.log('Dữ liệu rạp:', this.cinemaRevenueData);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Lỗi khi lấy dữ liệu thống kê rạp:', err);
          this.isLoading = false;
        }
      });
    } else {
      // Nếu là manager, ẩn hoặc xử lý khác phần thống kê theo rạp
      this.cinemaRevenueData = [];
      this.isLoading = false;
    }
  }

  onTimeFilterChange() {
    const today = new Date();

    if (this.timeFilter === 'Lọc theo 1 ngày') {
      this.startDate = this.formatDate(today);
      this.endDate = this.formatDate(today);
    } else if (this.timeFilter === 'Lọc theo 1 tuần') {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      this.startDate = this.formatDate(start);
      this.endDate = this.formatDate(today);
    } else if (this.timeFilter === 'Lọc theo 1 tháng') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      this.startDate = this.formatDate(firstDay);
      this.endDate = this.formatDate(lastDay);
    } else if (this.timeFilter === 'Lọc theo 1 năm') {
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      const lastDayOfYear = new Date(today.getFullYear(), 11, 31);
      this.startDate = this.formatDate(firstDayOfYear);
      this.endDate = this.formatDate(lastDayOfYear);
    }
    this.handleThongKe();
  }

  filterMovieData() {
    if (this.selectedMovie === 'Tất cả') {
      this.movieRevenueData = [...this.originalMovieRevenueData];
    } else {
      this.movieRevenueData = this.originalMovieRevenueData.filter(m => m.name === this.selectedMovie);
    }
  }

  filterCinemaData() {
    if (this.selectedCinema === 'Tất cả') {
      this.cinemaRevenueData = [...this.originalCinemaRevenueData];
    } else {
      this.cinemaRevenueData = this.originalCinemaRevenueData.filter(c => c.name === this.selectedCinema);
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get totalMovieTickets(): number {
    return this.movieRevenueData.reduce((total, movie) => total + movie.tickets, 0);
  }

  get totalMovieRevenue(): number {
    return this.movieRevenueData.reduce((total, movie) => total + movie.revenue, 0);
  }

  get totalCinemaTickets(): number {
    return this.cinemaRevenueData.reduce((total, cinema) => total + cinema.tickets, 0);
  }

  get totalCinemaRevenue(): number {
    return this.cinemaRevenueData.reduce((total, cinema) => total + cinema.revenue, 0);
  }
}