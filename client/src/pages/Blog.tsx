import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import AIBlogEditor from "@/components/AIBlogEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus,
  Search,
  BookOpen,
  Eye,
  Calendar,
  Sparkles,
  Edit3
} from "lucide-react";

export default function Blog() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [showEditor, setShowEditor] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Fetch published blogs
  const { data: blogs, isLoading: blogsLoading } = useQuery({
    queryKey: ["/api/blogs"],
    enabled: isAuthenticated,
  });

  // Fetch user's blogs
  const { data: userBlogs } = useQuery({
    queryKey: ["/api/users/blogs"],
    enabled: isAuthenticated,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredBlogs = blogs?.filter((blog: any) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading || blogsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blogs...</p>
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
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-blog-title">
                    AI-Powered Blog
                  </h1>
                  <p className="text-muted-foreground">Create amazing content with Gemini 2.5 Flash assistance</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search blogs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                      data-testid="input-search-blogs"
                    />
                  </div>
                  <Button 
                    onClick={() => {
                      setSelectedBlog(null);
                      setShowEditor(true);
                    }}
                    data-testid="button-create-blog"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Blog
                  </Button>
                </div>
              </div>

              {/* AI Features Banner */}
              <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10" data-testid="card-ai-features">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">Powered by Gemini 2.5 Flash</h3>
                      <p className="text-muted-foreground">
                        Generate blog posts, improve your content, and get creative ideas with AI assistance.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedBlog(null);
                        setShowEditor(true);
                      }}
                      data-testid="button-try-ai-writing"
                    >
                      Try AI Writing
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Blog Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card data-testid="card-stat-total-blogs">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{blogs?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Blogs</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-stat-my-blogs">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{userBlogs?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">My Blogs</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-stat-total-views">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {blogs?.reduce((total: number, blog: any) => total + (blog.views || 0), 0) || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Views</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-stat-ai-generated">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {blogs?.filter((blog: any) => blog.aiGenerated).length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">AI Generated</div>
                  </CardContent>
                </Card>
              </div>

              {/* Blog Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.length > 0 ? (
                  filteredBlogs.map((blog: any) => (
                    <Card key={blog.id} className="hover:shadow-lg transition-shadow" data-testid={`blog-${blog.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2" data-testid={`text-blog-title-${blog.id}`}>
                              {blog.title}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mb-2">
                              {blog.aiGenerated && (
                                <Badge variant="secondary" className="text-xs" data-testid={`badge-ai-${blog.id}`}>
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                              {blog.published ? (
                                <Badge variant="default" className="text-xs" data-testid={`badge-published-${blog.id}`}>
                                  Published
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs" data-testid={`badge-draft-${blog.id}`}>
                                  Draft
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedBlog(blog);
                              setShowEditor(true);
                            }}
                            data-testid={`button-edit-${blog.id}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3" data-testid={`text-excerpt-${blog.id}`}>
                          {blog.excerpt || blog.content.slice(0, 150) + "..."}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span data-testid={`text-date-${blog.id}`}>
                              {formatDate(blog.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Eye className="w-4 h-4" />
                            <span data-testid={`text-views-${blog.id}`}>
                              {blog.views || 0}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full" data-testid="empty-blogs">
                    <Card>
                      <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No blogs found</h3>
                        <p className="text-muted-foreground mb-4">
                          {searchQuery ? "Try adjusting your search terms." : "Start creating amazing content with AI assistance!"}
                        </p>
                        <Button 
                          onClick={() => {
                            setSelectedBlog(null);
                            setShowEditor(true);
                          }}
                          data-testid="button-create-first-blog"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Blog
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* AI Blog Editor Modal */}
      <AIBlogEditor
        open={showEditor}
        onOpenChange={setShowEditor}
        blog={selectedBlog}
        onBlogSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
          queryClient.invalidateQueries({ queryKey: ["/api/users/blogs"] });
          setShowEditor(false);
        }}
      />
    </div>
  );
}
