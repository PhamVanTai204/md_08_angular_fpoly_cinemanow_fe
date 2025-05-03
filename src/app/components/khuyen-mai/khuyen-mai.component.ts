import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

import { ReviewsService } from '../../../shared/services/reviews.service';
import { ReviewsDto } from '../../../shared/dtos/reviewsDto.dto';

@Component({
  selector: 'app-khuyen-mai',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './khuyen-mai.component.html',
  styleUrls: ['./khuyen-mai.component.css']
})
export class KhuyenMaiComponent implements OnInit, OnDestroy {
  /* ---------- PHIM ---------- */
  films: { movieId: string; movieName: string }[] = [];
  searchTerm   = '';
  loadingFilms = false;

  currentPage = 1;
  pageSize    = 10;
  totalFilms  = 0;
  totalPages  = 0;
  pages: number[] = [];

  /* ---------- REVIEWS ---------- */
  selectedMovieId: string | null = null;
  reviews: ReviewsDto[] = [];
  loadingReviews = false;

  private destroy$ = new Subject<void>();

  constructor(private reviewsSvc: ReviewsService) {}

  /* ========== LIFE CYCLE ========== */
  ngOnInit(): void { this.loadFilms(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ========== PHIM & PHÂN TRANG ========== */
  loadFilms(): void {
    this.loadingFilms = true;
    this.reviewsSvc
      .getMoviesPage(this.currentPage, this.pageSize, this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.films      = res.items;
          this.totalFilms = res.total;
          this.totalPages = res.totalPages;
          this.pages      = Array.from({ length: this.totalPages }, (_, i) => i + 1);
          this.loadingFilms = false;
        },
        error: () => (this.loadingFilms = false)
      });
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadFilms();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadFilms();
    }
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadFilms();
    }
  }
  goToPage(p: number): void {
    if (p === this.currentPage) return;
    this.currentPage = p;
    this.loadFilms();
  }

  /* ========== REVIEWS ========== */
  chooseFilm(id: string): void {
    this.selectedMovieId = id;
    this.loadReviews();
  }

  backToList(): void {
    this.selectedMovieId = null;
    this.reviews = [];
  }

  loadReviews(): void {
    if (!this.selectedMovieId) return;
    this.loadingReviews = true;
    this.reviewsSvc
      .getReviewsByMovie(this.selectedMovieId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.reviews        = data;
          this.loadingReviews = false;
        },
        error: () => (this.loadingReviews = false)
      });
  }

  confirmDelete(id: string | undefined): void {
    if (!id) return;
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá?')) return;
    this.loadingReviews = true;
    this.reviewsSvc
      .deleteReview(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadReviews(),
        error: err => {
          this.loadingReviews = false;
          alert('Xóa thất bại: ' + (err?.message ?? err));
        }
      });
  }
}
