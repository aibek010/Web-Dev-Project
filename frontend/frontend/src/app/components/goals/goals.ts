import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoalsService, Goal } from '../../services/goals.services';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './goals.html',
  styleUrl: './goals.css'
})
export class GoalsComponent implements OnInit {
  goals: Goal[] = [];

  newGoal: Partial<Goal> = {
    name: '',
    target_amount: 0,
    deadline: ''
  };

  depositAmounts: { [id: number]: number } = {};
  depositErrors: { [id: number]: string } = {};
  completedGoalName = '';
  errorMessage = '';

  constructor(private goalsService: GoalsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadGoals();
  }

  loadGoals() {
    this.goalsService.getGoals().subscribe({
      next: (data) => {
        this.goals = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  createGoal() {
    this.errorMessage = '';
    if (!this.newGoal.name || !this.newGoal.target_amount) {
      this.errorMessage = 'Заполните название и сумму.';
      return;
    }
    this.goalsService.createGoal(this.newGoal).subscribe({
      next: () => {
        this.loadGoals();
        this.newGoal = { name: '', target_amount: 0, deadline: '' };
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Ошибка создания цели.';
        this.cdr.detectChanges();
      }
    });
  }

  deposit(goal: Goal) {
    const amount = this.depositAmounts[goal.id!];
    if (!amount || amount <= 0) return;

    const confirmed = window.confirm(
      `Вы точно хотите списать ${amount.toLocaleString()} ₸ с баланса на цель "${goal.name}"?`
    );
    if (!confirmed) return;

    this.depositErrors[goal.id!] = '';

    this.goalsService.deposit(goal.id!, amount).subscribe({
      next: (res) => {
        this.depositAmounts[goal.id!] = 0;
        if (res.completed) {
          this.completedGoalName = goal.name;
          setTimeout(() => {
            this.completedGoalName = '';
            this.cdr.detectChanges();
          }, 4000);
        }
        this.loadGoals();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.depositErrors[goal.id!] = err.error?.error || 'Ошибка пополнения.';
        this.cdr.detectChanges();
      }
    });
  }

  deleteGoal(id: number) {
    this.goalsService.deleteGoal(id).subscribe({
      next: () => {
        this.loadGoals();
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Ошибка удаления.';
        this.cdr.detectChanges();
      }
    });
  }

  getProgressWidth(goal: Goal): string {
    const pct = Math.min((Number(goal.current_amount) / Number(goal.target_amount)) * 100, 100);
    return `${pct}%`;
  }

  isCompleted(goal: Goal): boolean {
    return Number(goal.current_amount) >= Number(goal.target_amount);
  }
}
