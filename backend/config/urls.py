from django.contrib import admin
from django.urls import include, path, re_path
from api import views as api_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),

    # PayPal SDK related endpoints at root
    path("setup", api_views.paypal_setup, name="paypal-setup"),
    path("order", api_views.paypal_create_order, name="paypal-create-order-root"),
    re_path(r"^order/(?P<order_id>[^/]+)/capture$", api_views.paypal_capture_order, name="paypal-capture-order"),
]
