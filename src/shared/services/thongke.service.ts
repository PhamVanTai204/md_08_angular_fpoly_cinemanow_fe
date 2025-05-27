import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ThongKeService {
    private apiUrl = 'http://127.0.0.1:3000/thongke'; // Thay bằng URL API thực tế

    constructor(private http: HttpClient) { }

    // Lấy doanh thu theo khoảng ngày (thêm cinema_id)
    getRevenueByDateRange(startDate: string, endDate: string, cinema_id?: string): Observable<any> {
        let params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);

        if (cinema_id) {
            params = params.set('cinema_id', cinema_id);
        }

        return this.http.get(`${this.apiUrl}/date-range`, { params });
    }

    // Lấy doanh thu theo ngày (thêm cinema_id)
    getRevenueByDay(year: number, month: number, day: number, cinema_id?: string): Observable<any> {
        let params = new HttpParams()
            .set('year', year.toString())
            .set('month', month.toString())
            .set('day', day.toString());

        if (cinema_id) {
            params = params.set('cinema_id', cinema_id);
        }

        return this.http.get(`${this.apiUrl}/day`, { params });
    }

    // Lấy doanh thu theo tháng (thêm cinema_id)
    getRevenueByMonth(year: number, month: number, cinema_id?: string): Observable<any> {
        let params = new HttpParams()
            .set('year', year.toString())
            .set('month', month.toString());

        if (cinema_id) {
            params = params.set('cinema_id', cinema_id);
        }

        return this.http.get(`${this.apiUrl}/month`, { params });
    }

    // Lấy doanh thu theo năm (thêm cinema_id)
    getRevenueByYear(year: number, cinema_id?: string): Observable<any> {
        let params = new HttpParams()
            .set('year', year.toString());

        if (cinema_id) {
            params = params.set('cinema_id', cinema_id);
        }

        return this.http.get(`${this.apiUrl}/year`, { params });
    }

    // Lấy thống kê chi tiết (thêm cinema_id)
    getDetailedRevenueStats(startDate: string, endDate: string, cinema_id?: string): Observable<any> {
        let params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);

        if (cinema_id) {
            params = params.set('cinema_id', cinema_id);
        }

        return this.http.get(`${this.apiUrl}/detailed`, { params });
    }

    // Lấy doanh thu theo rạp (giữ nguyên)
    getRevenueByCinema(startDate: string, endDate: string): Observable<any> {
        const params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);

        return this.http.get(`${this.apiUrl}/by-cinema`, { params });
    }

    // Thêm phương thức mới: Lấy doanh thu theo phim (có thể filter theo cinema)
    getRevenueByMovie(startDate: string, endDate: string, cinema_id?: string): Observable<any> {
        let params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);

        if (cinema_id) {
            params = params.set('cinema_id', cinema_id);
        }

        return this.http.get(`${this.apiUrl}/by-movie`, { params });
    }
}