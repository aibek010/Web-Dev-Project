from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Sum
from django.utils import timezone
from .models import Category, Transaction, Budget, FinancialGoal
from django.db import transaction as db_transaction
from decimal import Decimal


from .serializers import (
    CategorySerializer,
    TransactionModelSerializer,
    MonthlyStatisticsSerializer,
    UserRegistrationSerializer,
    BudgetSerializer,
    FinancialGoalSerializer,
)




class CategoryListCBV(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        categories = Category.objects.filter(user=request.user)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def transaction_list_fbv(request):
    if request.method == 'GET':
        transactions = Transaction.objects.filter(user=request.user).order_by('-date')
        serializer = TransactionModelSerializer(transactions, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = TransactionModelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TransactionDetailCBV(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Transaction.objects.get(pk=pk, user=user)
        except Transaction.DoesNotExist:
            return None

    def get(self, request, pk):
        transaction = self.get_object(pk, request.user)
        if not transaction:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = TransactionModelSerializer(transaction)
        return Response(serializer.data)

    def put(self, request, pk):
        transaction = self.get_object(pk, request.user)
       
        if not transaction:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = TransactionModelSerializer(transaction, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        transaction = self.get_object(pk, request.user)
      
        if not transaction:
            return Response(status=status.HTTP_404_NOT_FOUND)
        transaction.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)




@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def monthly_report_fbv(request):
    user = request.user

    
    now = timezone.now()
    transactions = Transaction.objects.filter(
        user=user,
        date__year=now.year,
        date__month=now.month,
    )

    total_income = (
        transactions.filter(transaction_type='INCOME')
        .aggregate(Sum('amount'))['amount__sum'] or 0
    )
    total_expense = (
        transactions.filter(transaction_type='EXPENSE')
        .aggregate(Sum('amount'))['amount__sum'] or 0
    )

    data = {
        'total_income': total_income,
        'total_expense': total_expense,
        'balance': total_income - total_expense,
        'month': now.strftime('%Y-%m'),
    }

    serializer = MonthlyStatisticsSerializer(data)
    return Response(serializer.data)




@api_view(['POST'])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'detail': 'Пользователь успешно создан.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





class BudgetListCBV(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        budgets = Budget.objects.filter(user=request.user)
        serializer = BudgetSerializer(budgets, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BudgetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BudgetDetailCBV(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Budget.objects.get(pk=pk, user=user)
        except Budget.DoesNotExist:
            return None

    def put(self, request, pk):
        budget = self.get_object(pk, request.user)
        if not budget:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = BudgetSerializer(budget, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        budget = self.get_object(pk, request.user)
        if not budget:
            return Response(status=status.HTTP_404_NOT_FOUND)
        budget.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



class FinancialGoalListCBV(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        goals = FinancialGoal.objects.filter(user=request.user)
        serializer = FinancialGoalSerializer(goals, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FinancialGoalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FinancialGoalDetailCBV(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return FinancialGoal.objects.get(pk=pk, user=user)
        except FinancialGoal.DoesNotExist:
            return None

    def put(self, request, pk):
        goal = self.get_object(pk, request.user)
        if not goal:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = FinancialGoalSerializer(goal, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        goal = self.get_object(pk, request.user)
        if not goal:
            return Response(status=status.HTTP_404_NOT_FOUND)
        goal.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def goal_deposit(request, pk):
    try:
        goal = FinancialGoal.objects.get(pk=pk, user=request.user)
    except FinancialGoal.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    amount = request.data.get('amount')
    if not amount or float(amount) <= 0:
        return Response({'error': 'Укажите сумму.'}, status=status.HTTP_400_BAD_REQUEST)

    amount = Decimal(str(amount))

    transactions = Transaction.objects.filter(user=request.user)
    total_income = transactions.filter(transaction_type='INCOME').aggregate(Sum('amount'))['amount__sum'] or Decimal(0)
    total_expense = transactions.filter(transaction_type='EXPENSE').aggregate(Sum('amount'))['amount__sum'] or Decimal(0)
    balance = total_income - total_expense


    if amount > balance:
        return Response(
            {'error': f'Недостаточно средств. Ваш баланс: {balance:.2f} ₸'},
            status=status.HTTP_400_BAD_REQUEST
        )

    with db_transaction.atomic():
        
        category, _ = Category.objects.get_or_create(
            user=request.user,
            name=goal.name
        )
        Transaction.objects.create(
            user=request.user,
            category=category,
            amount=amount,
            description=f'Пополнение цели: {goal.name}',
            transaction_type='EXPENSE',
            date=timezone.now().date()
        )

        goal.current_amount += amount
        goal_completed = goal.current_amount >= goal.target_amount
        if goal_completed:
            goal.current_amount = goal.target_amount
        goal.save()

    serializer = FinancialGoalSerializer(goal)
    return Response({
        **serializer.data,
        'completed': goal_completed
    })
