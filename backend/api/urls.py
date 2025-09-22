from django.urls import path, re_path
from . import views

urlpatterns = [
    path("health/", views.health_check, name="health"),

    # Auth
    path("login", views.auth_login, name="login"),
    path("logout", views.auth_logout, name="logout"),
    path("auth/user", views.auth_user, name="auth-user"),

    # Users
    path("users", views.users_list, name="users-list"),
    re_path(r"^users/(?P<identifier>[^/]+)$", views.user_detail, name="user-detail"),
    path("users/gigs", views.user_gigs, name="user-gigs"),
    path("users/products", views.user_products, name="user-products"),
    path("users/blogs", views.user_blogs, name="user-blogs"),

    # Core resources
    path("posts", views.posts, name="posts"),
    path("gigs", views.gigs, name="gigs"),
    re_path(r"^gigs/(?P<gig_id>[^/]+)/order$", views.gig_order, name="gig-order"),
    path("products", views.products, name="products"),
    path("blogs", views.blogs, name="blogs"),
    path("blogs/generate", views.blogs_generate, name="blogs-generate"),

    # Chat
    path("conversations", views.conversations, name="conversations"),
    re_path(r"^conversations/(?P<user_id>[^/]+)$", views.conversation_detail, name="conversation-detail"),
    path("messages", views.messages, name="messages"),
    path("chat", views.chat, name="chat"),

    # Calendar / Events
    path("events", views.events, name="events"),

    # AI
    path("ai/chats", views.ai_chats, name="ai-chats"),
    path("ai/chat", views.ai_chat, name="ai-chat"),
    path("ai/content-ideas", views.ai_content_ideas, name="ai-content-ideas"),

    # Dashboard
    path("dashboard/stats", views.dashboard_stats, name="dashboard-stats"),

    # Legacy simple endpoints
    path("profile", views.profile, name="profile"),
]
