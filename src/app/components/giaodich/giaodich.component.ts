import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-giaodich',
  standalone: false,
  templateUrl: './giaodich.component.html',
  styleUrls: ['./giaodich.component.css']
})
export class GiaodichComponent implements OnInit {
  // Các thuộc tính
  searchTerm: string = '';
  filteredThanhToanList: any[] = [];
  
  constructor() { }

  ngOnInit(): void {
    // Khởi tạo dữ liệu mẫu
    this.filteredThanhToanList = [
      {
        maGD: 'GD001',
        tenPhim: 'Người đẹp và quái vật',
        suatChieu: '20:30',
        phongChieu: 'P01',
        trangThai: 'Đã thanh toán',
        tongTien: 120000,
        ngayDat: '2025-01-15'
      },
      {
        maGD: 'GD002',
        tenPhim: 'Avengers: Endgame',
        suatChieu: '18:15',
        phongChieu: 'P02',
        trangThai: 'Đã hủy',
        tongTien: 150000,
        ngayDat: '2025-01-16'
      }
    ];
  }

  // Các phương thức
  traCuuGD(): void {
    console.log('Tra cứu giao dịch');
    // Lọc danh sách giao dịch theo searchTerm
    if (this.searchTerm) {
      this.filteredThanhToanList = this.filteredThanhToanList.filter(item => 
        item.tenPhim.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  taoGiaoDich(): void {
    console.log('Tạo giao dịch mới');
    // Logic tạo giao dịch mới
  }
}