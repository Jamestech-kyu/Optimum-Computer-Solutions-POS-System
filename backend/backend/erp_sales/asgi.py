"""
ASGI config for erp_sales project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "erp_sales.settings")

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

django_asgi_app = get_asgi_application()

import notifications.routing
from notifications.auth import JwtAuthMiddleware

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    
    "websocket": JwtAuthMiddleware(URLRouter(
        notifications.routing.websocket_urlpatterns
    )),
})

