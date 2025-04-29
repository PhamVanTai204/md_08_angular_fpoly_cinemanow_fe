import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VNPaymentService } from '../../../shared/services/vnpayment.service';

@Component({
  selector: 'app-comfirm-vnpay',
  standalone: false,
  templateUrl: './comfirm-vnpay.component.html',
  styleUrls: ['./comfirm-vnpay.component.css']
})
export class ComfirmVNPayComponent implements OnInit {
  paymentInfo: any = {};
  isSuccess: boolean = false;
  verificationResult: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vnpaymentService: VNPaymentService
  ) { }

  ngOnInit(): void {
    // Lấy queryParams từ URL
    this.route.queryParams.subscribe(params => {
      this.paymentInfo = params;
      this.isSuccess = params['vnp_ResponseCode'] === '00';

      // Gọi API backend để xác minh giao dịch
      this.verifyPayment(params);
    });
  }
  verifyPayment(params: any): void {
    console.log(params);

    this.vnpaymentService.verifyPayment(params).subscribe(
      response => {
        if (response) {
          // Nếu xác minh thành công
          console.log('Payment verified successfully:', response);
          this.verificationResult = response;
        } else {
          // Nếu xác minh thất bại
          console.error('Payment verification failed');
          this.verificationResult = { success: false, message: 'Payment verification failed' };
        }
      },
      error => {
        // Xử lý lỗi nếu có
        console.error('Error during payment verification:', error);
        this.verificationResult = { success: false, message: 'Error during verification' };
      }
    );
  }
  goHome(): void {
    this.router.navigate(['/layout']);
  }
}
