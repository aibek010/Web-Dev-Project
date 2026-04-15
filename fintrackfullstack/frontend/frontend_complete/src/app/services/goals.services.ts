import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Goal {
  id?: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  progress_percent?: number;
}

@Injectable({ providedIn: 'root' })
export class GoalsService {
  private baseUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}

  getGoals(): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.baseUrl}goals/`);
  }

  createGoal(goal: Partial<Goal>): Observable<Goal> {
    return this.http.post<Goal>(`${this.baseUrl}goals/`, goal);
  }

  deleteGoal(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}goals/${id}/`);
  }

  deposit(id: number, amount: number): Observable<any> {
    return this.http.post(`${this.baseUrl}goals/${id}/deposit/`, { amount });
  }
}