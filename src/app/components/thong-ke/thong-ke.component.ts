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
  //c Thêm các biến mới
  yearlyChartData: any;
  yearlyChartOptions: any;
  yearlyRevenueData: any[] = []; // Dữ liệu từ API

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
    this.initPieChart();

    // Khởi tạo ngày bắt đầu và kết thúc mặc định (tháng hiện tại)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.startDate = this.formatDate(firstDay);
    this.endDate = this.formatDate(lastDay);

    // Load dữ liệu ban đầu
    this.initYearlyChart();
    this.loadInitialData();
    this.logYearlyRevenue();
  }

  // Load dữ liệu ban đầu
  private loadInitialData() {
    this.handleThongKe();
  }

















  private initYearlyChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-secondary-color');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    const primaryColor = documentStyle.getPropertyValue('--primary-500');
    const primaryColorLight = documentStyle.getPropertyValue('--primary-200');

    this.yearlyChartOptions = {
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || '';
              const value = context.raw || 0;
              return `${label}: ${value.toLocaleString('vi-VN')} VND`;
            },
            title: (context: any) => {
              return `Tháng ${context[0].label}`;
            }
          },
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            size: 25,
            weight: 'bold'
          },
          bodyFont: {
            size: 12
          },
          padding: 10,
          displayColors: false
        },

      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              size: 25,

              weight: 'bold'
            }
          },
          grid: {
            display: false,
            drawBorder: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary,
            font: {
              size: 20,

            },


            callback: (value: any) => {
              if (value >= 1000000) {
                return (value / 1000000).toLocaleString('vi-VN') + ' tr';
              }
              return value.toLocaleString('vi-VN');
            }
          },
          grid: {

            color: surfaceBorder,
            drawBorder: false
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    };

    this.updateYearlyChartData();
  }

  private updateYearlyChartData() {
    const documentStyle = getComputedStyle(document.documentElement);
    const primaryColor = documentStyle.getPropertyValue('--primary-500');
    const primaryColorLight = documentStyle.getPropertyValue('--primary-200');

    // Tạo mảng 12 tháng với doanh thu mặc định là 0
    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
    const monthlyData = allMonths.map(month => {
      const foundData = this.yearlyRevenueData.find(d => d.month === month);
      return foundData ? foundData.revenue : 0;
    });

    this.yearlyChartData = {
      labels: allMonths.map(month => month.toString()),
      datasets: [
        {
          label: 'Doanh thu',
          data: monthlyData,
          backgroundColor: (context: any) => {
            const value = context.dataset.data[context.dataIndex];
            const maxValue = Math.max(...context.dataset.data);
            const ratio = value / maxValue;
            return `rgba(54, 162, 235, ${0.2 + 0.8 * ratio})`;
          },
          borderColor: primaryColor,
          borderWidth: 1,
          borderRadius: 4,
          hoverBackgroundColor: primaryColorLight,
          fill: true
        }
      ]
    };

    // Cập nhật tiêu đề biểu đồ nếu có
    if (this.yearlyChartOptions?.plugins?.title) {
      this.yearlyChartOptions.plugins.title.text = `DOANH THU THEO THÁNG - NĂM ${this.selectedYear}`;
    }
  }









  // Thêm vào class ThongKeComponent
  pieChartData: any;
  pieChartOptions: any;

  // Thêm vào phương thức ngOnInit(), sau khi khởi tạo các giá trị mặc định

  // Thêm phương thức khởi tạo biểu đồ
  private initPieChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    this.pieChartOptions = {
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            color: textColor,
            font: {
              size: 17, // Tăng kích thước font
              weight: 'bold' // Làm đậm chữ
            },
            padding: 10, // Tăng khoảng cách giữa các mục
            boxWidth: 40, // Tăng kích thước biểu tượng màu
            boxHeight: 40 // Tăng kích thước biểu tượng màu
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value.toLocaleString()} VND (${percentage}%)`;
            }
          }
        },
        // title: {
        //   display: true,
        //   text: 'DOANH THU THEO PHIM', // Thêm tiêu đề biểu đồ
        //   font: {
        //     size: 16,
        //     weight: 'bold'
        //   },
        //   // padding: {
        //   //   top: 10,
        //   //   bottom: 20
        //   // }
        // }
      },
      cutout: '60%',
      animation: {
        animateScale: true,
        animateRotate: true
      }
    };

    this.updatePieChartData();
  }

  private updatePieChartData() {
    const documentStyle = getComputedStyle(document.documentElement);

    // Chỉ hiển thị top 5 phim doanh thu cao nhất, gom phần còn lại vào "Phim khác"
    const topMovies = [...this.movieRevenueData]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const otherRevenue = this.movieRevenueData
      .slice(5)
      .reduce((sum, movie) => sum + movie.revenue, 0);

    const labels = topMovies.map(movie => movie.name);
    const data = topMovies.map(movie => movie.revenue);

    if (otherRevenue > 0) {
      labels.push('Phim khác');
      data.push(otherRevenue);
    }

    // Mảng màu sắc tươi sáng hơn
    const backgroundColors = [
      '#4BC0C0', // Teal
      '#9966FF', // Purple
      '#FF9F40', // Orange
      '#FFCD56', // Yellow
      '#36A2EB', // Blue
      '#FF6384', // Pink
      '#8AC24A', // Green
      '#FF7043', // Deep Orange
      '#7E57C2', // Deep Purple
      '#26C6DA'  // Cyan
    ];

    this.pieChartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: backgroundColors.slice(0, labels.length),
          hoverBackgroundColor: backgroundColors.map(color => this.lightenColor(color, 20)).slice(0, labels.length),
          borderWidth: 1,
          borderColor: documentStyle.getPropertyValue('--surface-ground')
        }
      ]
    };
  }

  // Hàm phụ trợ để làm sáng màu
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;

    return '#' + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  }

  // Phương thức cập nhật dữ liệu cho biểu đồ












  getTotalYearlyRevenue(): number {
    if (!this.yearlyRevenueData) return 0;
    return this.yearlyRevenueData.reduce((sum, month) => sum + month.revenue, 0);
  }

  onYearChange() {
    console.log('Năm được chọn:', this.selectedYear);
    this.logYearlyRevenue();
  }

  // Trong thong-ke.component.ts

  // Thêm biến selectedYear
  selectedYear: number = new Date().getFullYear();
  // Trong thong-ke.component.ts
  getYearRange(): number[] {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Tạo danh sách 10 năm gần đây
    for (let i = 0; i < 10; i++) {
      years.push(currentYear - i);
    }
    return years;
  }
  // Thêm phương thức này vào class
  logYearlyRevenue() {
    this.isLoading = true;
    const cinemaId = this.isManager ? this.currentUser.cinema_id : undefined;

    this.thongKeService.getRevenueByYear(this.selectedYear, cinemaId).subscribe({
      next: (data) => {
        console.log('Doanh thu theo năm:', this.selectedYear, data);
        this.yearlyRevenueData = data.monthlyData;
        this.updateYearlyChartData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu thống kê theo năm:', err);
        this.isLoading = false;
      }
    });
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
        // Cập nhật biểu đồ
        this.updatePieChartData();

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu thống kê chi tiết:', err);
        this.isLoading = false;
      }
    });
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



    // Chỉ gọi API thống kê theo rạp nếu không phải là manager (role != 2)
    if (!this.isManager) {

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
    this.updatePieChartData();
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