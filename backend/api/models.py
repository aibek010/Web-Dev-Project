from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver



class Category(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return f"{self.name} ({self.user.username})"


class Transaction(models.Model):
    TRANSACTION_TYPES = [('INCOME', 'Income'), ('EXPENSE', 'Expense')]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    # ИСПРАВЛЕНИЕ 1: добавлено поле date, на которое ссылался сериализатор
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type}: {self.amount} ({self.category.name})"


class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    amount_limit = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.DateField(help_text="Первое число месяца, для которого ставится лимит")

    def __str__(self):
        return f"Лимит для {self.category.name}: {self.amount_limit}"


class FinancialGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    name = models.CharField(max_length=200)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deadline = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Цель: {self.name} ({self.current_amount}/{self.target_amount})"
    
    
@receiver(post_save, sender=FinancialGoal)
def create_goal_category(sender, instance, created, **kwargs):
    if created:
        Category.objects.get_or_create(
            user=instance.user,
            name=instance.name
        )
