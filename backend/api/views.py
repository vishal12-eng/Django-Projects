from typing import Any, Dict, List
from datetime import datetime
import os
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt

# In-memory chat storage (per-process, for demo only)
CHAT_HISTORY: List[Dict[str, Any]] = []
CHAT_SEQ = 1

# Optional Gemini integration (uses GEMINI_API_KEY if provided)
_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
_GEMINI_READY = False
try:
    if _GEMINI_API_KEY:
        import google.generativeai as genai  # type: ignore

        genai.configure(api_key=_GEMINI_API_KEY)
        _GEMINI_MODEL_CHAT = genai.GenerativeModel("gemini-2.0-flash")
        _GEMINI_MODEL_IDEAS = genai.GenerativeModel("gemini-2.0-flash")
        _GEMINI_READY = True
except Exception:
    _GEMINI_READY = False


def _ai_generate_reply(prompt: str) -> str:
    if not _GEMINI_READY:
        return f"AI: {prompt}"
    try:
        res = _GEMINI_MODEL_CHAT.generate_content(
            f"You are InfinityHub's assistant. Be concise and helpful.\nUser: {prompt}"
        )
        text = res.text or ""
        return text.strip() or f"AI: {prompt}"
    except Exception:
        return f"AI: {prompt}"


def _ai_generate_ideas(topic: str) -> List[str]:
    if not _GEMINI_READY:
        return [f"Idea about {topic} #1", f"Idea about {topic} #2"]
    try:
        res = _GEMINI_MODEL_IDEAS.generate_content(
            f"List 8 creative, specific content ideas for '{topic}'. One per line."
        )
        text = (res.text or "").strip()
        lines = [ln.strip("- ") for ln in text.splitlines() if ln.strip()]
        return [ln for ln in lines if ln][:8] or [f"Idea about {topic} #1", f"Idea about {topic} #2"]
    except Exception:
        return [f"Idea about {topic} #1", f"Idea about {topic} #2"]


@api_view(["GET"])  # Simple health check
@permission_classes([AllowAny])
def health_check(_request):
    return Response({"status": "ok"})


# ---------------------- PayPal placeholders ----------------------
@api_view(["GET"])  # Return a fake client token
@permission_classes([AllowAny])
def paypal_setup(_request):
    return Response({"clientToken": "TEST_CLIENT_TOKEN"})


@api_view(["POST"])  # Create a fake order
@permission_classes([AllowAny])
def paypal_create_order(request):
    payload = request.data
    return Response({"id": "TEST_ORDER_ID", "status": "CREATED", **payload})


@api_view(["POST"])  # Capture fake order
@permission_classes([AllowAny])
def paypal_capture_order(_request, order_id: str):
    return Response({"id": order_id, "status": "COMPLETED"})


# ---------------------- Auth ----------------------
@api_view(["GET"])  # redirect-style placeholder
@permission_classes([AllowAny])
def auth_login(_request):
    return Response({"status": "login", "message": "Use your auth provider here"})


@api_view(["POST"])  # placeholder
@permission_classes([AllowAny])
def auth_logout(_request):
    return Response({"status": "logged_out"})


@api_view(["GET", "PATCH"])  # placeholder current user
@permission_classes([AllowAny])
def auth_user(request):
    if request.method == "PATCH":
        return Response({"updated": request.data})
    return Response({"id": 1, "username": "guest", "firstName": "Guest", "lastName": "User"})


# ---------------------- Users ----------------------
@api_view(["GET"])  # placeholder
@permission_classes([AllowAny])
def users_list(_request):
    return Response([{ "id": 1, "username": "guest" }])


@api_view(["GET"])  # placeholder user detail
@permission_classes([AllowAny])
def user_detail(_request, identifier: str):
    return Response({"id": 1, "username": identifier, "firstName": "Guest", "lastName": "User"})


@api_view(["GET"])  # placeholder user gigs
@permission_classes([AllowAny])
def user_gigs(_request):
    return Response([])


@api_view(["GET"])  # placeholder user products
@permission_classes([AllowAny])
def user_products(_request):
    return Response([])


@api_view(["GET"])  # placeholder user blogs
@permission_classes([AllowAny])
def user_blogs(_request):
    return Response([])


# ---------------------- Core resources ----------------------
@api_view(["GET", "POST"])  # Posts feature placeholder
@permission_classes([AllowAny])
def posts(request):
    if request.method == "POST":
        data = request.data
        return Response({"id": 1, **data})
    return Response([
        {"id": 1, "title": "Hello", "content": "World"},
    ])


@api_view(["GET", "POST"])  # Gigs feature placeholder
@permission_classes([AllowAny])
def gigs(request):
    if request.method == "POST":
        data = request.data
        return Response({"id": 1, **data})
    return Response([
        {"id": 1, "title": "Sample Gig", "price": 50, "active": True, "deliveryTime": 3, "rating": 4.8, "userId": 2, "user": {"firstName": "Alice", "lastName": "Smith"}},
    ])


@api_view(["POST"])  # Order a gig placeholder
@permission_classes([AllowAny])
def gig_order(_request, gig_id: str):
    return Response({"gigId": gig_id, "orderId": "ORDER123", "status": "CREATED"})


@api_view(["GET", "POST"])  # Products feature placeholder
@permission_classes([AllowAny])
def products(request):
    if request.method == "POST":
        data = request.data
        return Response({"id": 1, **data})
    return Response([
        {"id": 1, "name": "Sample Product", "price": 20},
    ])


@api_view(["GET", "POST"])  # Blogs feature placeholder
@permission_classes([AllowAny])
def blogs(request):
    if request.method == "POST":
        data = request.data
        return Response({"id": 1, **data})
    return Response([
        {"id": 1, "title": "First Blog", "content": "Lorem ipsum"},
    ])


@api_view(["POST"])  # Blog generator placeholder
@permission_classes([AllowAny])
def blogs_generate(request):
    topic = request.data.get("topic", "")
    return Response({"title": f"Generated: {topic}", "content": f"Auto content for {topic}"})


# ---------------------- Chat ----------------------
@api_view(["GET"])  # Conversations list placeholder
@permission_classes([AllowAny])
def conversations(_request):
    return Response([{"user": {"id": 2, "name": "Alice"}, "lastMessage": "Hi"}])


@api_view(["GET"])  # Conversation detail placeholder
@permission_classes([AllowAny])
def conversation_detail(_request, user_id: str):
    return Response({"user": {"id": user_id, "name": "Alice"}, "messages": []})


@api_view(["POST"])  # Send message placeholder
@permission_classes([AllowAny])
def messages(request):
    message = request.data
    return Response({"sent": message})


@api_view(["GET"])  # Chat messages list placeholder
@permission_classes([AllowAny])
def chat(request):
    return Response({"messages": []})


# ---------------------- Calendar / Events ----------------------
@api_view(["GET", "POST"])  # Events placeholder
@permission_classes([AllowAny])
def events(request):
    if request.method == "POST":
        return Response({"created": request.data})
    return Response([])


# ---------------------- AI ----------------------
@api_view(["GET"])  # AI chats list placeholder
@permission_classes([AllowAny])
def ai_chats(_request):
    return Response(CHAT_HISTORY)


@csrf_exempt
@api_view(["POST"])  # AI chat interaction placeholder
@permission_classes([AllowAny])
def ai_chat(request):
    global CHAT_SEQ
    prompt = request.data.get("message", "")
    chat_type = request.data.get("chatType", "general")
    reply = _ai_generate_reply(prompt)

    now = datetime.utcnow().isoformat()
    item = {
        "id": CHAT_SEQ,
        "message": prompt,
        "response": reply,
        "chatType": chat_type,
        "createdAt": now,
    }
    CHAT_SEQ += 1
    CHAT_HISTORY.append(item)
    return Response(item)


@csrf_exempt
@api_view(["POST"])  # AI content ideas placeholder
@permission_classes([AllowAny])
def ai_content_ideas(request):
    topic = request.data.get("topic", "")
    ideas = _ai_generate_ideas(topic)
    return Response({"ideas": ideas})


# ---------------------- Dashboard ----------------------
@api_view(["GET"])  # Dashboard stats placeholder
@permission_classes([AllowAny])
def dashboard_stats(_request):
    return Response({"posts": 1, "gigs": 1, "products": 1})


# ---------------------- Misc ----------------------
@api_view(["GET"])  # Profile feature placeholder
@permission_classes([AllowAny])
def profile(_request):
    return Response({"id": 1, "name": "Guest"})
