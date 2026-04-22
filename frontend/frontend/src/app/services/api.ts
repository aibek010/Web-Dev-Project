import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://127.0.0.1:8000/api/';

  isLoggedIn = signal(!!localStorage.getItem('access_token'));

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}login/`, credentials).pipe(
      tap((res: any) => {
        localStorage.setItem('access_token', res.access);
        localStorage.setItem('refresh_token', res.refresh);
        this.isLoggedIn.set(true);
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.isLoggedIn.set(false);
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}categories/`);
  }

  createCategory(data: { name: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}categories/`, data);
  }

  getTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}transactions/`);
  }

  createTransaction(tx: any): Observable<any> {
    return this.http.post(`${this.baseUrl}transactions/`, tx);
  }

  getMonthlyReport(): Observable<any> {
    return this.http.get(`${this.baseUrl}report/`);
  }

  updateTransaction(id: number, tx: any): Observable<any> {
    return this.http.put(`${this.baseUrl}transactions/${id}/`, tx);
  }

  deleteTransaction(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}transactions/${id}/`);
  }
}
