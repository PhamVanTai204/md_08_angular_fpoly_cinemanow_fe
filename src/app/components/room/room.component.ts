import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SeatDto } from '../../../shared/dtos/seatDto.dto';
import { SeatService } from '../../../shared/services/seat.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-room',
  standalone: false,
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
  idRoom: string = '';
  seats: SeatDto[] = [];
  groupedSeats: { [key: string]: SeatDto[] } = {}; // Chứa các ghế đã nhóm theo hàng

  constructor(
    public bsModalRef: BsModalRef,
    private seatService: SeatService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idRoomParam = params.get('idRoom');
      this.idRoom = idRoomParam || '';
      
      if (this.idRoom) {
        this.list();
      } else {
        console.error('idRoom is missing');
      }
    });
  }

  // Method to safely access object keys
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  close(): void {
    this.bsModalRef.hide();
  }

  list(): void {
    console.log("Fetching seats for Room ID:", this.idRoom);
    this.seatService.getSeatByRoomId(this.idRoom).subscribe(
      data => {
        this.seats = data;
        console.log('Seats:', this.seats);
        // Nhóm ghế theo hàng
        this.groupedSeats = this.seatService.groupSeatsByRow(this.seats);
        console.log('Grouped Seats:', this.groupedSeats);
      },
      error => console.error('Error fetching seats:', error)
    );
  }
}