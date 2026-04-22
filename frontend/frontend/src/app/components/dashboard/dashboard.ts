import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;

  stats: any = null;
  loading = true;
  error = '';
  chart: Chart | null = null;

  limit: number | null = null;
  showLimitModal = false;
  newLimit: number = 0;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const saved = localStorage.getItem('monthly_limit');
    if (saved) this.limit = Number(saved);

    this.api.getMonthlyReport().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.buildChart(), 0);
      },
      error: (err) => {
        this.error = 'Не удалось загрузить отчёт.';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  buildChart() {
    if (!this.chartCanvas || !this.stats) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const income = Number(this.stats.total_income);
    const expense = Number(this.stats.total_expense);
    const balance = Number(this.stats.balance);

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Доходы', 'Расходы', 'Баланс'],
        datasets: [{
          data: [income, expense, balance],
          backgroundColor: [
            'rgba(0, 212, 170, 0.2)',
            'rgba(249, 112, 102, 0.2)',
            'rgba(99, 179, 237, 0.2)',
          ],
          borderColor: [
            '#00d4aa',
            '#f97066',
            '#63b3ed',
          ],
          borderWidth: 2,
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `₸ ${Number(ctx.raw).toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#4a5a78', font: { size: 12 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: '#4a5a78',
              font: { size: 11 },
              callback: (val) => `₸ ${Number(val).toLocaleString()}`
            }
          }
        }
      }
    });
  }

  get limitExceeded(): boolean {
    return this.limit !== null && this.stats?.total_expense > this.limit;
  }

  get limitProgress(): number {
    if (!this.limit || !this.stats) return 0;
    return Math.min((this.stats.total_expense / this.limit) * 100, 100);
  }

  saveLimit() {
    if (!this.newLimit || this.newLimit <= 0) return;
    this.limit = this.newLimit;
    localStorage.setItem('monthly_limit', String(this.newLimit));
    this.showLimitModal = false;
    this.newLimit = 0;
    this.cdr.detectChanges();
  }

  deleteLimit() {
    this.limit = null;
    localStorage.removeItem('monthly_limit');
    this.cdr.detectChanges();
  }
}
