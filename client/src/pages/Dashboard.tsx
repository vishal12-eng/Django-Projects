import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  DollarSign, 
  Briefcase, 
  Plus, 
  Video,
  MessageSquare,
  ShoppingBag,
  BookOpen,
  Calendar as CalendarIcon,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  // Fetch recent posts
  const { data: recentPosts } = useQuery({
    queryKey: ["/api/posts"],
    enabled: isAuthenticated,
  });

  // Fetch recent products
  const { data: recentProducts } = useQuery({
    queryKey: ["/api/products"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
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
          {/* Dashboard Header */}
          <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-welcome-message">
                    Welcome back, {user?.firstName || "Creator"}! 👋
                  </h1>
                  <p className="text-muted-foreground mb-4">
                    Here's what's happening with your InfinityHub today.
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card data-testid="card-stat-followers">
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-foreground">1,234</div>
                        <div className="text-sm text-muted-foreground">Followers</div>
                      </CardContent>
                    </Card>
                    <Card data-testid="card-stat-posts">
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-foreground">89</div>
                        <div className="text-sm text-muted-foreground">Posts</div>
                      </CardContent>
                    </Card>
                    <Card data-testid="card-stat-revenue">
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-foreground">$2,340</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </CardContent>
                    </Card>
                    <Card data-testid="card-stat-gigs">
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-foreground">12</div>
                        <div className="text-sm text-muted-foreground">Active Gigs</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="mt-6 lg:mt-0 lg:ml-8">
                  <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2">
                    <Button className="flex items-center" data-testid="button-create-post">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Post
                    </Button>
                    <Button variant="secondary" className="flex items-center" data-testid="button-start-meeting">
                      <Video className="w-4 h-4 mr-2" />
                      Start Meeting
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              {/* Recent Activity & AI Assistant */}
              <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Recent Activity</CardTitle>
                        <Link href="/activity">
                          <Button variant="ghost" size="sm" data-testid="link-view-all-activity">
                            View all
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg" data-testid="activity-earnings">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground">You earned <span className="font-semibold">$150</span> from "Logo Design Package"</p>
                            <p className="text-xs text-muted-foreground">2 hours ago</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg" data-testid="activity-message">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground">New message from <span className="font-semibold">Sarah Johnson</span></p>
                            <p className="text-xs text-muted-foreground">5 hours ago</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg" data-testid="activity-likes">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground">Your blog post got <span className="font-semibold">25 new likes</span></p>
                            <p className="text-xs text-muted-foreground">1 day ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Assistant Card */}
                <Card className="bg-gradient-to-br from-primary/10 to-secondary/20" data-testid="card-ai-assistant">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle>Gemini AI Assistant</CardTitle>
                        <p className="text-xs text-muted-foreground">Powered by Gemini 2.5 Flash</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Get help with content creation, blog ideas, and more.</p>
                    
                    <div className="space-y-2 mb-4">
                      <Button variant="ghost" size="sm" className="w-full justify-start text-sm" data-testid="button-suggest-blog-topics">
                        📝 Suggest blog topics
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-sm" data-testid="button-improve-content">
                        ✨ Improve my content
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-sm" data-testid="button-generate-ideas">
                        💡 Generate gig ideas
                      </Button>
                    </div>
                    
                    <Link href="/ai-assistant">
                      <Button className="w-full" data-testid="button-open-ai-chat">
                        Open AI Chat
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              {/* Feature Modules Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Social Feed Module */}
                <Card className="hover:shadow-lg transition-shadow" data-testid="card-module-feed">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle>Social Feed</CardTitle>
                        <p className="text-xs text-muted-foreground">Share posts and engage</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Create posts, share updates, and connect with your community.</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-muted-foreground">Recent activity:</div>
                      <div className="text-sm">📸 3 new posts this week</div>
                      <div className="text-sm">❤️ 147 likes received</div>
                    </div>
                    
                    <Link href="/feed">
                      <Button variant="outline" className="w-full" data-testid="button-open-feed">
                        Open Feed
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Digital Store Module */}
                <Card className="hover:shadow-lg transition-shadow" data-testid="card-module-store">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle>Digital Store</CardTitle>
                        <p className="text-xs text-muted-foreground">Sell digital products</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Upload and sell digital products with PayPal integration.</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-muted-foreground">Store stats:</div>
                      <div className="text-sm">📦 8 products listed</div>
                      <div className="text-sm">💰 $1,240 total sales</div>
                    </div>
                    
                    <Link href="/store">
                      <Button variant="outline" className="w-full" data-testid="button-manage-store">
                        Manage Store
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Freelance Gigs Module */}
                <Card className="hover:shadow-lg transition-shadow" data-testid="card-module-gigs">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle>Freelance Gigs</CardTitle>
                        <p className="text-xs text-muted-foreground">Offer your services</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Create gigs and offer freelance services to clients.</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-muted-foreground">Gig performance:</div>
                      <div className="text-sm">🎯 5 active gigs</div>
                      <div className="text-sm">📈 12 pending orders</div>
                    </div>
                    
                    <Link href="/gigs">
                      <Button variant="outline" className="w-full" data-testid="button-view-gigs">
                        View Gigs
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* AI Blog Module */}
                <Card className="hover:shadow-lg transition-shadow" data-testid="card-module-blog">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle>AI Blog</CardTitle>
                        <p className="text-xs text-muted-foreground">AI-powered writing</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Create blog posts with AI assistance and markdown editor.</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-muted-foreground">Content stats:</div>
                      <div className="text-sm">📝 15 blog posts</div>
                      <div className="text-sm">👀 2,340 total views</div>
                    </div>
                    
                    <Link href="/blog">
                      <Button variant="outline" className="w-full" data-testid="button-write-blog">
                        Write Blog
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Messages Module */}
                <Card className="hover:shadow-lg transition-shadow" data-testid="card-module-messages">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle>Messages</CardTitle>
                        <p className="text-xs text-muted-foreground">Real-time chat</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Direct messaging with real-time notifications.</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-muted-foreground">Recent messages:</div>
                      <div className="text-sm">💬 3 unread messages</div>
                      <div className="text-sm">👥 8 active chats</div>
                    </div>
                    
                    <Link href="/chat">
                      <Button variant="outline" className="w-full" data-testid="button-open-messages">
                        Open Messages
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Calendar & Tasks Module */}
                <Card className="hover:shadow-lg transition-shadow" data-testid="card-module-calendar">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <CardTitle>Calendar & Tasks</CardTitle>
                        <p className="text-xs text-muted-foreground">Schedule & organize</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Manage your schedule and to-do list with AI suggestions.</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-muted-foreground">Upcoming:</div>
                      <div className="text-sm">📅 2 meetings today</div>
                      <div className="text-sm">✅ 5 pending tasks</div>
                    </div>
                    
                    <Link href="/calendar">
                      <Button variant="outline" className="w-full" data-testid="button-view-calendar">
                        View Calendar
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating AI Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/ai-assistant">
          <Button size="lg" className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow" data-testid="button-floating-ai">
            <Sparkles className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
          </Button>
        </Link>
      </div>
    </div>
  );
}
