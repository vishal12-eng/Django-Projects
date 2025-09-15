import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Send,
  Sparkles,
  MessageSquare,
  Lightbulb,
  FileText,
  Briefcase,
  Copy,
  ThumbsUp,
  Bot,
  User
} from "lucide-react";

export default function AIAssistant() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Fetch AI chat history
  const { data: chatHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/ai/chats"],
    enabled: isAuthenticated,
  });

  // Chat with AI mutation
  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; chatType: string }) => {
      return apiRequest("POST", "/api/ai/chat", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/chats"] });
      setMessage("");
      setIsGenerating(false);
    },
    onError: (error) => {
      setIsGenerating(false);
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
        description: "Failed to get AI response",
        variant: "destructive",
      });
    },
  });

  // Generate content ideas mutation
  const generateIdeasMutation = useMutation({
    mutationFn: async (data: { topic: string; type: string }) => {
      return apiRequest("POST", "/api/ai/content-ideas", data);
    },
    onSuccess: (data) => {
      const ideasText = data.ideas.join('\n• ');
      chatMutation.mutate({
        message: `Generate content ideas for: ${data.topic}`,
        chatType: "ideas"
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
        description: "Failed to generate content ideas",
        variant: "destructive",
      });
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    setIsGenerating(true);
    chatMutation.mutate({
      message: message.trim(),
      chatType: "general"
    });
  };

  const handleQuickAction = (action: string, prompt: string) => {
    setIsGenerating(true);
    chatMutation.mutate({
      message: prompt,
      chatType: action
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading AI Assistant...</p>
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
          <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground" data-testid="text-ai-assistant-title">
                      AI Assistant
                    </h1>
                    <p className="text-muted-foreground">Powered by Gemini 2.5 Flash</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleQuickAction("blog", "Help me generate blog post ideas for my niche")}
                    className="flex items-center justify-start"
                    data-testid="button-blog-ideas"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Blog Ideas
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleQuickAction("content", "Give me content creation tips and strategies")}
                    className="flex items-center justify-start"
                    data-testid="button-content-tips"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Content Tips
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleQuickAction("gig", "Suggest freelance gig ideas based on my skills")}
                    className="flex items-center justify-start"
                    data-testid="button-gig-ideas"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Gig Ideas
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleQuickAction("general", "Help me improve my productivity and workflow")}
                    className="flex items-center justify-start"
                    data-testid="button-productivity"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Productivity
                  </Button>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                {chatHistory && chatHistory.length > 0 ? (
                  <div className="space-y-6">
                    {chatHistory.map((chat: any) => (
                      <div key={chat.id} className="space-y-4" data-testid={`chat-${chat.id}`}>
                        {/* User Message */}
                        <div className="flex justify-end">
                          <div className="max-w-2xl">
                            <div className="flex items-start space-x-3">
                              <div className="flex-1">
                                <div className="bg-primary text-primary-foreground rounded-lg px-4 py-3">
                                  <p className="whitespace-pre-wrap" data-testid={`text-user-message-${chat.id}`}>
                                    {chat.message}
                                  </p>
                                </div>
                                <div className="flex items-center justify-end space-x-2 mt-2">
                                  <span className="text-xs text-muted-foreground" data-testid={`text-message-time-${chat.id}`}>
                                    {formatTime(chat.createdAt)}
                                  </span>
                                  <Badge variant="outline" className="text-xs" data-testid={`badge-chat-type-${chat.id}`}>
                                    {chat.chatType}
                                  </Badge>
                                </div>
                              </div>
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-primary-foreground" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* AI Response */}
                        <div className="flex justify-start">
                          <div className="max-w-2xl">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="bg-muted rounded-lg px-4 py-3">
                                  <p className="whitespace-pre-wrap text-foreground" data-testid={`text-ai-response-${chat.id}`}>
                                    {chat.response}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => copyToClipboard(chat.response)}
                                      data-testid={`button-copy-response-${chat.id}`}
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      data-testid={`button-like-response-${chat.id}`}
                                    >
                                      <ThumbsUp className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    AI Assistant
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Loading indicator */}
                    {isGenerating && (
                      <div className="flex justify-start" data-testid="ai-thinking">
                        <div className="max-w-2xl">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-muted rounded-lg px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <div className="animate-pulse flex space-x-1">
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                  <div className="w-2 h-2 bg-primary rounded-full animation-delay-75"></div>
                                  <div className="w-2 h-2 bg-primary rounded-full animation-delay-150"></div>
                                </div>
                                <span className="text-sm text-muted-foreground">AI is thinking...</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12" data-testid="empty-chat">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to AI Assistant!</h3>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                      I'm here to help you with content creation, business ideas, productivity tips, and more. 
                      Ask me anything or use one of the quick actions above to get started.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                            onClick={() => handleQuickAction("blog", "Help me write a blog post about productivity tips")}
                            data-testid="card-example-blog">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-6 h-6 text-primary" />
                          <div className="text-left">
                            <p className="font-medium">Blog Writing</p>
                            <p className="text-sm text-muted-foreground">Get help with blog posts</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                            onClick={() => handleQuickAction("ideas", "Give me social media content ideas for a tech startup")}
                            data-testid="card-example-ideas">
                        <div className="flex items-center space-x-3">
                          <Lightbulb className="w-6 h-6 text-primary" />
                          <div className="text-left">
                            <p className="font-medium">Content Ideas</p>
                            <p className="text-sm text-muted-foreground">Brainstorm new content</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-border">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-end space-x-4">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Ask me anything about content creation, business ideas, or how to use InfinityHub..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                      className="min-h-[60px] max-h-32 resize-none"
                      data-testid="input-ai-message"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Press Enter to send, Shift+Enter for new line
                    </p>
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isGenerating}
                    size="lg"
                    data-testid="button-send-ai-message"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
