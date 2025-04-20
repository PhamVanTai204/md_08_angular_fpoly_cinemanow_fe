// thongke.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ThongKeService {
    private apiUrl = 'http://127.0.0.1:3000/thongke'; // Thay bằng URL API thực tế

    constructor(private http: HttpClient) { }

    // Lấy doanh thu theo khoảng ngày
    getRevenueByDateRange(startDate: string, endDate: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/date-range`, {
            params: { startDate, endDate }
        });
    }

    // Lấy doanh thu theo ngày
    getRevenueByDay(year: number, month: number, day: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/day`, {
            params: { year, month, day }
        });
    }

    // Lấy doanh thu theo tháng
    getRevenueByMonth(year: number, month: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/month`, {
            params: { year, month }
        });
    }

    // Lấy doanh thu theo năm
    getRevenueByYear(year: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/year`, {
            params: { year }
        });
    }

    // Lấy thống kê chi tiết
    getDetailedRevenueStats(startDate: string, endDate: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/detailed`, {
            params: { startDate, endDate }
        });
    }
    // Thêm vào ThongKeService
    getRevenueByCinema(startDate: string, endDate: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/by-cinema`, {
            params: { startDate, endDate }
        });
    }
}