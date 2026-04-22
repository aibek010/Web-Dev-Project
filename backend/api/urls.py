from django.urls import path
from .views import (
    CategoryListCBV,
    TransactionDetailCBV,
    transaction_list_fbv,
    monthly_report_fbv,
    register,
    BudgetListCBV,
    BudgetDetailCBV,
    FinancialGoalListCBV,
    FinancialGoalDetailCBV,
    goal_deposit,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    
    path('register/', register),                                       
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

   
    path('categories/', CategoryListCBV.as_view()),

    
    path('transactions/', transaction_list_fbv),
    path('transactions/<int:pk>/', TransactionDetailCBV.as_view()),


    path('report/', monthly_report_fbv),

 
    path('budgets/', BudgetListCBV.as_view()),
    path('budgets/<int:pk>/', BudgetDetailCBV.as_view()),

   
    path('goals/', FinancialGoalListCBV.as_view()),
    path('goals/<int:pk>/', FinancialGoalDetailCBV.as_view()),
    path('goals/<int:pk>/deposit/', goal_deposit), 
]
