from rest_framework import serializers
from .models import Category, Transaction, Budget, FinancialGoal
from django.contrib.auth.models import User


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']  # ИСПРАВЛЕНИЕ 2: убрали user из ответа — незачем отдавать внутренний id


class TransactionModelSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Transaction
        # ИСПРАВЛЕНИЕ 1: поле date теперь есть в модели, поэтому ошибки не будет
        # ИСПРАВЛЕНИЕ 2: user не включён в fields — он задаётся автоматически в view
        fields = ['id', 'amount', 'description', 'transaction_type', 'date', 'category', 'category_name']


class MonthlyStatisticsSerializer(serializers.Serializer):
    total_income = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_expense = serializers.DecimalField(max_digits=10, decimal_places=2)
    balance = serializers.DecimalField(max_digits=10, decimal_places=2)
    month = serializers.CharField()


# ИСПРАВЛЕНИЕ 4: добавлена регистрация пользователя
class UserRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


# ИСПРАВЛЕНИЕ 3: добавлены сериализаторы для Budget и FinancialGoal
class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ['id', 'category', 'amount_limit', 'month']


class FinancialGoalSerializer(serializers.ModelSerializer):
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = FinancialGoal
        fields = ['id', 'name', 'target_amount', 'current_amount', 'deadline', 'progress_percent']

    def get_progress_percent(self, obj):
        if obj.target_amount == 0:
            return 0
        return round(float(obj.current_amount) / float(obj.target_amount) * 100, 1)
