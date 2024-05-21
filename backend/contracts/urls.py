from django.urls import path
from . import views

app_name = "contracts"

urlpatterns = [
    # path("", views.Contracts.as_view(), name="contracts"),
    path("generate", views.Generate.as_view(), name="contract_generate"),
    path("contracts", views.Generate.as_view(), name="get_contracts"),
    path("deploy", views.Deploy.as_view(), name="deploy_contract"),
    path("edit_title", views.EditTitle.as_view(), name="edit_title"),
    path("remove", views.Remove.as_view(), name="remove_contract"),
    path("save", views.Save.as_view(), name="remove_contract"),
]
