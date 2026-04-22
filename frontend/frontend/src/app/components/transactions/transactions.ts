import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

interface Transaction {
  id?: number;
  amount: number;
  description: string;
  transaction_type: string;
  category: number;
  category_name?: string;
  date: string;
}

interface Category {
  id: number;
  name: string;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  categories: Category[] = [];

  newTx: Omit<Transaction, 'id' | 'category_name'> = {
    amount: 0,
    description: '',
    transaction_type: 'EXPENSE',
    category: 0,
    date: new Date().toISOString().split('T')[0],
  };

  // Фильтры
  searchQuery = '';
  filterType = '';
  filterCategory = '';
  filterDateFrom = '';
  filterDateTo = '';

  errorMessage = '';
  showCategoryModal = false;
  newCategoryName = '';
  categoryError = '';

  // Редактирование
  showEditModal = false;
  editTx: Transaction | null = null;
  editError = '';

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadTransactions();
    this.loadCategories();
  }

  loadCategories() {
    this.api.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        if (data.length > 0) this.newTx.category = data[0].id;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Ошибка загрузки категорий', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadTransactions() {
    this.api.getTransactions().subscribe({
      next: (data) => {
        this.transactions = data;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Ошибка загрузки транзакций', err);
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters() {
    let result = [...this.transactions];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(t =>
        (t.description || '').toLowerCase().includes(q) ||
        (t.category_name || '').toLowerCase().includes(q)
      );
    }
    if (this.filterType) result = result.filter(t => t.transaction_type === this.filterType);
    if (this.filterCategory) result = result.filter(t => t.category_name === this.filterCategory);
    if (this.filterDateFrom) result = result.filter(t => t.date >= this.filterDateFrom);
    if (this.filterDateTo) result = result.filter(t => t.date <= this.filterDateTo);
    this.filteredTransactions = result;
    this.cdr.detectChanges();
  }

  resetFilters() {
    this.searchQuery = '';
    this.filterType = '';
    this.filterCategory = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.applyFilters();
  }

  onCategoryChange(value: any) {
    if (value === 'add_new') {
      this.showCategoryModal = true;
      this.newTx.category = this.categories[0]?.id ?? 0;
    } else {
      this.newTx.category = Number(value);
    }
  }

  closeModal() {
    this.showCategoryModal = false;
    this.newCategoryName = '';
    this.categoryError = '';
    this.cdr.detectChanges();
  }

  saveCategory() {
    this.categoryError = '';
    if (!this.newCategoryName.trim()) {
      this.categoryError = 'Введите название категории.';
      return;
    }
    this.api.createCategory({ name: this.newCategoryName.trim() }).subscribe({
      next: (cat: Category) => {
        this.categories.push(cat);
        this.newTx.category = cat.id;
        this.closeModal();
        this.cdr.detectChanges();
      },
      error: () => {
        this.categoryError = 'Ошибка создания категории.';
        this.cdr.detectChanges();
      }
    });
  }

  saveTransaction() {
    this.errorMessage = '';
    if (!this.newTx.amount || !this.newTx.category || !this.newTx.date) {
      this.errorMessage = 'Заполните все обязательные поля.';
      return;
    }
    this.api.createTransaction(this.newTx).subscribe({
      next: () => {
        this.loadTransactions();
        this.newTx = {
          amount: 0,
          description: '',
          transaction_type: 'EXPENSE',
          category: this.categories[0]?.id ?? 0,
          date: new Date().toISOString().split('T')[0],
        };
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Ошибка сохранения. Проверьте данные.';
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  // Удаление
  deleteTransaction(id: number) {
    if (!confirm('Удалить эту транзакцию?')) return;
    this.api.deleteTransaction(id).subscribe({
      next: () => {
        this.loadTransactions();
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Ошибка удаления.';
        this.cdr.detectChanges();
      }
    });
  }

  // Редактирование
  openEditModal(tx: Transaction) {
    this.editTx = { ...tx };
    this.editError = '';
    this.showEditModal = true;
    this.cdr.detectChanges();
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editTx = null;
    this.editError = '';
    this.cdr.detectChanges();
  }

  saveEdit() {
    if (!this.editTx) return;
    this.editError = '';
    if (!this.editTx.amount || !this.editTx.category || !this.editTx.date) {
      this.editError = 'Заполните все обязательные поля.';
      return;
    }
    this.api.updateTransaction(this.editTx.id!, {
      amount: this.editTx.amount,
      description: this.editTx.description,
      transaction_type: this.editTx.transaction_type,
      category: this.editTx.category,
      date: this.editTx.date,
    }).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadTransactions();
        this.cdr.detectChanges();
      },
      error: () => {
        this.editError = 'Ошибка сохранения.';
        this.cdr.detectChanges();
      }
    });
  }
}
