import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Send,
  Search,
  MessageCircle,
  Users,
  MoreVertical,
  Phone,
  Video,
  Plus
} from "lucide-react";

export default function Chat() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Setup WebSocket connection
  useEffect(() => {
    if (isAuthenticated) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message') {
          // Refresh conversations and messages
          queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
          if (selectedConversation) {
            queryClient.invalidateQueries({ 
              queryKey: ["/api/conversations", selectedConversation.user.id] 
            });
          }
        }
      };

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
      };
    }
  }, [isAuthenticated, selectedConversation, queryClient]);

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: isAuthenticated,
  });

  // Fetch messages for selected conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/conversations", selectedConversation?.user.id],
    enabled: isAuthenticated && !!selectedConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest("POST", "/api/messages", messageData);
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", selectedConversation?.user.id] 
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedConversation.user.id,
      content: newMessage.trim(),
      messageType: "text",
    });
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredConversations = conversations?.filter((conv: any) =>
    conv.user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading || conversationsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 min-h-screen bg-background">
          <div className="h-[calc(100vh-4rem)] flex">
            {/* Conversations Sidebar */}
            <div className="w-80 border-r border-border flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground" data-testid="text-chat-title">Messages</h2>
                  <Button size="sm" variant="outline" data-testid="button-new-chat">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-conversations"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation: any) => (
                    <div
                      key={conversation.user.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedConversation?.user.id === conversation.user.id ? 'bg-muted' : ''
                      }`}
                      data-testid={`conversation-${conversation.user.id}`}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-12 h-12" data-testid={`avatar-${conversation.user.id}`}>
                          <AvatarImage src={conversation.user.profileImageUrl} />
                          <AvatarFallback>
                            {conversation.user.firstName?.[0]}{conversation.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-foreground truncate" data-testid={`text-user-name-${conversation.user.id}`}>
                              {conversation.user.firstName} {conversation.user.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground" data-testid={`text-last-message-time-${conversation.user.id}`}>
                              {formatMessageTime(conversation.lastMessage.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate" data-testid={`text-last-message-${conversation.user.id}`}>
                            {conversation.lastMessage.content}
                          </p>
                          {!conversation.lastMessage.read && conversation.lastMessage.senderId !== user?.id && (
                            <Badge variant="destructive" className="text-xs mt-1" data-testid={`badge-unread-${conversation.user.id}`}>
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center" data-testid="empty-conversations">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No conversations yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border flex items-center justify-between" data-testid="chat-header">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10" data-testid="avatar-selected-user">
                        <AvatarImage src={selectedConversation.user.profileImageUrl} />
                        <AvatarFallback>
                          {selectedConversation.user.firstName?.[0]}{selectedConversation.user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground" data-testid="text-selected-user-name">
                          {selectedConversation.user.firstName} {selectedConversation.user.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">Online</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" data-testid="button-voice-call">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" data-testid="button-video-call">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" data-testid="button-chat-options">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="messages-area">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : messages && messages.length > 0 ? (
                      messages.map((message: any) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                          data-testid={`message-${message.id}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <p className="whitespace-pre-wrap" data-testid={`text-message-content-${message.id}`}>
                              {message.content}
                            </p>
                            <p className={`text-xs mt-1 ${
                              message.senderId === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`} data-testid={`text-message-time-${message.id}`}>
                              {formatMessageTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-full" data-testid="empty-messages">
                        <div className="text-center">
                          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border" data-testid="message-input-area">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                        data-testid="input-new-message"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        data-testid="button-send-message"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center" data-testid="no-conversation-selected">
                  <div className="text-center">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">Choose a conversation from the sidebar to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
