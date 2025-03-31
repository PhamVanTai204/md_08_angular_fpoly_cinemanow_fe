import { Component, OnInit } from '@angular/core';

interface ThanhToanItem {
  maGD: string;
  tenPhim: string;
  suatChieu: string;
  phongChieu: string;
  trangThai: string;
  tongTien: number;
  ngayDat: string;
}

@Component({
  selector: 'app-thanh-toan',
  standalone: false,
  templateUrl: './thanh-toan.component.html',
  styleUrls: ['./thanh-toan.component.css']
})
export class ThanhToanComponent implements OnInit {
  // Trường lưu giá trị tìm kiếm tên phim
  searchTerm: string = '';
  
  // Danh sách giao dịch
  thanhToanList: ThanhToanItem[] = [];
  
  ngOnInit(): void {
    // Khởi tạo dữ liệu mẫu
    this.loadThanhToanData();
  }
  
  // Phương thức tải dữ liệu (có thể thay thế bằng API call trong thực tế)
  loadThanhToanData(): void {
    this.thanhToanList = [
      {
        maGD: 'HD 1234',
        tenPhim: 'Trạng Quỳnh',
        suatChieu: '12:00 - 14:00 12/03/2025',
        phongChieu: 'Cinema 1 - Cinema HN',
        trangThai: 'Đã thanh toán',
        tongTien: 140000,
        ngayDat: '11/03/2025'
      },
      {
        maGD: 'HD 1235',
        tenPhim: 'Trạng Quỳnh',
        suatChieu: '12:00 - 14:00 12/03/2025',
        phongChieu: 'Cinema 1 - Cinema HN',
        trangThai: 'Đã hủy',
        tongTien: 140000,
        ngayDat: '11/03/2025'
      },
      {
        maGD: 'HD 1236',
        tenPhim: 'Trạng Quỳnh',
        suatChieu: '12:00 - 14:00 12/03/2025',
        phongChieu: 'Cinema 1 - Cinema HN',
        trangThai: 'Đã thanh toán',
        tongTien: 140000,
        ngayDat: '11/03/2025'
      },
      {
        maGD: 'HD 1237',
        tenPhim: 'Godzilla x Kong',
        suatChieu: '18:30 - 20:30 15/03/2025',
        phongChieu: 'Cinema 3 - Cinema HN',
        trangThai: 'Đã thanh toán',
        tongTien: 180000,
        ngayDat: '14/03/2025'
      }
    ];
  }

  // Lọc theo tên phim
  get filteredThanhToanList(): ThanhToanItem[] {
    if (!this.searchTerm.trim()) {
      return this.thanhToanList;
    }
    
    const lowerSearch = this.searchTerm.toLowerCase().trim();
    return this.thanhToanList.filter(item =>
      item.tenPhim.toLowerCase().includes(lowerSearch)
    );
  }

  // Nút "Tra cứu GD"
  traCuuGD(): void {
    console.log('Tra cứu giao dịch...');
    // Thực hiện tìm kiếm nâng cao hoặc điều hướng đến trang tìm kiếm chi tiết
    alert('Đang chuyển đến trang tra cứu giao dịch chi tiết');
  }
}