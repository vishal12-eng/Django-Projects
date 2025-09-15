import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  User,
  Globe,
  Twitter,
  Instagram,
  Github,
  Linkedin,
  ExternalLink,
  Edit3,
  Save,
  X
} from "lucide-react";

export default function Profile() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  
  // Check if we're viewing someone else's profile
  const [match, params] = useRoute("/u/:username");
  const isOwnProfile = !match;
  const username = params?.username;

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    bio: "",
    socialLinks: {
      website: "",
      twitter: "",
      instagram: "",
      github: "",
      linkedin: "",
    }
  });

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

  // Fetch profile data
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: isOwnProfile ? ["/api/auth/user"] : ["/api/users", username],
    enabled: isAuthenticated && (isOwnProfile || !!username),
  });

  // Fetch user's posts
  const { data: userPosts } = useQuery({
    queryKey: ["/api/users", profileData?.id, "posts"],
    enabled: !!profileData?.id,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PATCH", "/api/auth/user", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
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
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (profileData && isOwnProfile) {
      setEditData({
        bio: profileData.bio || "",
        socialLinks: profileData.socialLinks || {
          website: "",
          twitter: "",
          instagram: "",
          github: "",
          linkedin: "",
        }
      });
    }
  }, [profileData, isOwnProfile]);

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editData);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (profileData) {
      setEditData({
        bio: profileData.bio || "",
        socialLinks: profileData.socialLinks || {
          website: "",
          twitter: "",
          instagram: "",
          github: "",
          linkedin: "",
        }
      });
    }
  };

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Profile Not Found</h1>
              <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 min-h-screen bg-background">
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              {/* Profile Header */}
              <Card className="mb-8" data-testid="card-profile-header">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                    <Avatar className="w-24 h-24" data-testid="img-profile-avatar">
                      <AvatarImage src={profileData.profileImageUrl} />
                      <AvatarFallback className="text-2xl">
                        {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-foreground" data-testid="text-profile-name">
                          {profileData.firstName} {profileData.lastName}
                        </h1>
                        {isOwnProfile && (
                          <div className="flex items-center space-x-2">
                            {isEditing ? (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={handleSaveProfile}
                                  disabled={updateProfileMutation.isPending}
                                  data-testid="button-save-profile"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={handleCancelEdit}
                                  data-testid="button-cancel-edit"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setIsEditing(true)}
                                data-testid="button-edit-profile"
                              >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Profile
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-4" data-testid="text-profile-email">
                        {profileData.email}
                      </p>
                      
                      {/* Bio */}
                      <div className="mb-4">
                        {isEditing ? (
                          <Textarea
                            value={editData.bio}
                            onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                            placeholder="Tell us about yourself..."
                            className="min-h-[80px]"
                            data-testid="input-bio"
                          />
                        ) : (
                          <p className="text-foreground" data-testid="text-bio">
                            {profileData.bio || "No bio available."}
                          </p>
                        )}
                      </div>
                      
                      {/* Social Links */}
                      <div className="flex flex-wrap gap-4">
                        {isEditing ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Website</label>
                              <Input
                                value={editData.socialLinks.website}
                                onChange={(e) => setEditData(prev => ({
                                  ...prev,
                                  socialLinks: { ...prev.socialLinks, website: e.target.value }
                                }))}
                                placeholder="https://your-website.com"
                                data-testid="input-website"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Twitter</label>
                              <Input
                                value={editData.socialLinks.twitter}
                                onChange={(e) => setEditData(prev => ({
                                  ...prev,
                                  socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                                }))}
                                placeholder="@username"
                                data-testid="input-twitter"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Instagram</label>
                              <Input
                                value={editData.socialLinks.instagram}
                                onChange={(e) => setEditData(prev => ({
                                  ...prev,
                                  socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                                }))}
                                placeholder="@username"
                                data-testid="input-instagram"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">GitHub</label>
                              <Input
                                value={editData.socialLinks.github}
                                onChange={(e) => setEditData(prev => ({
                                  ...prev,
                                  socialLinks: { ...prev.socialLinks, github: e.target.value }
                                }))}
                                placeholder="username"
                                data-testid="input-github"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">LinkedIn</label>
                              <Input
                                value={editData.socialLinks.linkedin}
                                onChange={(e) => setEditData(prev => ({
                                  ...prev,
                                  socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                                }))}
                                placeholder="username"
                                data-testid="input-linkedin"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            {profileData.socialLinks?.website && (
                              <a 
                                href={profileData.socialLinks.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-primary hover:text-primary/80"
                                data-testid="link-website"
                              >
                                <Globe className="w-4 h-4" />
                                <span>Website</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {profileData.socialLinks?.twitter && (
                              <a 
                                href={`https://twitter.com/${profileData.socialLinks.twitter.replace('@', '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-primary hover:text-primary/80"
                                data-testid="link-twitter"
                              >
                                <Twitter className="w-4 h-4" />
                                <span>Twitter</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {profileData.socialLinks?.instagram && (
                              <a 
                                href={`https://instagram.com/${profileData.socialLinks.instagram.replace('@', '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-primary hover:text-primary/80"
                                data-testid="link-instagram"
                              >
                                <Instagram className="w-4 h-4" />
                                <span>Instagram</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {profileData.socialLinks?.github && (
                              <a 
                                href={`https://github.com/${profileData.socialLinks.github}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-primary hover:text-primary/80"
                                data-testid="link-github"
                              >
                                <Github className="w-4 h-4" />
                                <span>GitHub</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {profileData.socialLinks?.linkedin && (
                              <a 
                                href={`https://linkedin.com/in/${profileData.socialLinks.linkedin}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-primary hover:text-primary/80"
                                data-testid="link-linkedin"
                              >
                                <Linkedin className="w-4 h-4" />
                                <span>LinkedIn</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card data-testid="card-stat-posts">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{userPosts?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Posts</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-stat-followers">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">1,234</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-stat-following">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">567</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-stat-likes">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">8.9K</div>
                    <div className="text-sm text-muted-foreground">Likes</div>
                  </CardContent>
                </Card>
              </div>

              {/* Posts Grid */}
              <Card data-testid="card-user-posts">
                <CardHeader>
                  <CardTitle>Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  {userPosts && userPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userPosts.map((post: any) => (
                        <div key={post.id} className="border border-border rounded-lg p-4" data-testid={`post-${post.id}`}>
                          <p className="text-foreground mb-2">{post.content}</p>
                          {post.mediaUrl && (
                            <img 
                              src={post.mediaUrl} 
                              alt="Post media" 
                              className="w-full h-48 object-cover rounded-lg mb-2"
                              data-testid={`img-post-media-${post.id}`}
                            />
                          )}
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{post.likes} likes</span>
                            <span>{post.commentsCount} comments</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8" data-testid="empty-posts">
                      <p className="text-muted-foreground">No posts yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
