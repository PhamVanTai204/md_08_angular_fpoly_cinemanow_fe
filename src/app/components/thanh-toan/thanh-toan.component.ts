import { Component } from '@angular/core';

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
  standalone: false, // Chú ý: phải là false nếu bạn khai báo trong một module
  templateUrl: './thanh-toan.component.html',
  styleUrls: ['./thanh-toan.component.css']
})
export class ThanhToanComponent {
  // Trường lưu giá trị tìm kiếm tên phim
  searchTerm: string = '';

  // Danh sách (tương tự “giao dịch”) chứa dữ liệu mẫu
  thanhToanList: ThanhToanItem[] = [
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
    }
  ];

  // Lọc theo tên phim
  get filteredThanhToanList(): ThanhToanItem[] {
    if (!this.searchTerm) {
      return this.thanhToanList;
    }
    const lowerSearch = this.searchTerm.toLowerCase();
    return this.thanhToanList.filter(item =>
      item.tenPhim.toLowerCase().includes(lowerSearch)
    );
  }

  // Nút "Tra cứu GD"
  traCuuGD(): void {
    console.log('Tra cứu giao dịch...');
    // Thêm logic tra cứu hoặc điều hướng tùy theo dự án
  }

  // Nút "Tạo giao dịch"
  taoGiaoDich(): void {
    console.log('Tạo giao dịch mới...');
    // Thêm logic tạo giao dịch hoặc điều hướng tùy theo dự án
  }
}
