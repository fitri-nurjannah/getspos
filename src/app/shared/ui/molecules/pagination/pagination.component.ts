import { Component, computed, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PageChangeEvent {
  first: number;
  rows: number;
  page: number;
}

@Component({
  imports: [ CommonModule ],
  selector: 'app-pagination',
  styleUrl: './pagination.component.css',
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  totalRecords = input<number>(0);
  rowsPerPageOptions = input<number[]>([10, 25, 50, 100]);
  
  // Two-way signal bindings:
  first = model<number>(0); // Current index offset (0, 10, 20...)
  rows = model<number>(10);  // Current page size

  pageChange = output<PageChangeEvent>();

  // Computed state
  currentPage = computed(() => Math.floor(this.first() / this.rows()) + 1);
  totalPages = computed(() => Math.ceil(this.totalRecords() / this.rows()) || 1);
  startRecord = computed(() => (this.totalRecords() === 0 ? 0 : this.first() + 1));
  endRecord = computed(() => Math.min(this.first() + this.rows(), this.totalRecords()));

  canPrev = computed(() => this.first() > 0);
  canNext = computed(() => this.first() + this.rows() < this.totalRecords());

  prevPage(): void {
    if (this.canPrev()) {
      const newFirst = Math.max(0, this.first() - this.rows());
      this.first.set(newFirst);
      this.emitChange();
    }
  }

  nextPage(): void {
    if (this.canNext()) {
      const newFirst = this.first() + this.rows();
      this.first.set(newFirst);
      this.emitChange();
    }
  }

  onRowsChange(newRowsStr: string): void {
    const newRows = parseInt(newRowsStr, 10);
    this.rows.set(newRows);
    this.first.set(0); // Reset to first page
    this.emitChange();
  }

  private emitChange(): void {
    this.pageChange.emit({
      first: this.first(),
      rows: this.rows(),
      page: this.currentPage(),
    });
  }
}