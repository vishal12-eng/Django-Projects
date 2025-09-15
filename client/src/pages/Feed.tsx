import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import CreatePostModal from "@/components/CreatePostModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Heart,
  MessageCircle,
  Share2,
  Plus,
  MoreHorizontal
} from "lucide-react";

export default function Feed() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreatePost, setShowCreatePost] = useState(false);

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

  // Fetch posts
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts"],
    enabled: isAuthenticated,
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      return apiRequest("POST", `/api/posts/${postId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
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
        description: "Failed to like post",
        variant: "destructive",
      });
    },
  });

  const handleLikePost = (postId: string) => {
    likePostMutation.mutate(postId);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1h";
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1d";
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString();
  };

  if (isLoading || postsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading feed...</p>
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
          <div className="max-w-2xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-feed-title">Social Feed</h1>
              <Button onClick={() => setShowCreatePost(true)} data-testid="button-create-post">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </div>

            {/* Posts */}
            <div className="space-y-6">
              {posts && posts.length > 0 ? (
                posts.map((post: any) => (
                  <Card key={post.id} data-testid={`post-${post.id}`}>
                    <CardContent className="p-6">
                      {/* Post Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Avatar data-testid={`avatar-post-${post.id}`}>
                            <AvatarImage src={post.user?.profileImageUrl} />
                            <AvatarFallback>
                              {post.user?.firstName?.[0]}{post.user?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-foreground" data-testid={`text-author-${post.id}`}>
                                {post.user?.firstName} {post.user?.lastName}
                              </span>
                              <span className="text-muted-foreground text-sm">
                                @{post.user?.email?.split('@')[0]}
                              </span>
                              <span className="text-muted-foreground text-sm">·</span>
                              <span className="text-muted-foreground text-sm" data-testid={`text-time-${post.id}`}>
                                {formatRelativeTime(post.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" data-testid={`button-more-${post.id}`}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        <p className="text-foreground whitespace-pre-wrap" data-testid={`text-content-${post.id}`}>
                          {post.content}
                        </p>
                        {post.mediaUrl && (
                          <img 
                            src={post.mediaUrl} 
                            alt="Post media" 
                            className="w-full mt-3 rounded-lg border border-border"
                            data-testid={`img-media-${post.id}`}
                          />
                        )}
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center space-x-6 pt-4 border-t border-border">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleLikePost(post.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                          data-testid={`button-like-${post.id}`}
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          <span>{post.likes || 0}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-muted-foreground hover:text-blue-500 transition-colors"
                          data-testid={`button-comment-${post.id}`}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          <span>{post.commentsCount || 0}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-muted-foreground hover:text-green-500 transition-colors"
                          data-testid={`button-share-${post.id}`}
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          <span>Share</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card data-testid="empty-feed">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                    <p className="text-muted-foreground mb-4">Be the first to share something with the community!</p>
                    <Button onClick={() => setShowCreatePost(true)} data-testid="button-create-first-post">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Post
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal 
        open={showCreatePost} 
        onOpenChange={setShowCreatePost}
        onPostCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
          setShowCreatePost(false);
        }}
      />
    </div>
  );
}
