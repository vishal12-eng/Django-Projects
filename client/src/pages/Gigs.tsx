import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import CreateGigModal from "@/components/CreateGigModal";
import PayPalButton from "@/components/PayPalButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus,
  Search,
  Briefcase,
  DollarSign,
  Clock,
  Star,
  TrendingUp,
  Users,
  CheckCircle
} from "lucide-react";

export default function Gigs() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateGig, setShowCreateGig] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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

  // Fetch gigs
  const { data: gigs, isLoading: gigsLoading } = useQuery({
    queryKey: ["/api/gigs"],
    enabled: isAuthenticated,
  });

  // Fetch user's gigs
  const { data: userGigs } = useQuery({
    queryKey: ["/api/users/gigs"],
    enabled: isAuthenticated,
  });

  // Order gig mutation
  const orderGigMutation = useMutation({
    mutationFn: async (gigId: string) => {
      return apiRequest("POST", `/api/gigs/${gigId}/order`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Gig order created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gigs"] });
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
        description: "Failed to create gig order",
        variant: "destructive",
      });
    },
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "design", label: "Design & Graphics" },
    { value: "development", label: "Programming" },
    { value: "writing", label: "Writing & Translation" },
    { value: "marketing", label: "Digital Marketing" },
    { value: "video", label: "Video & Animation" },
    { value: "business", label: "Business" },
  ];

  const filteredGigs = gigs?.filter((gig: any) => {
    const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gig.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || gig.category === selectedCategory;
    return matchesSearch && matchesCategory && gig.active;
  }) || [];

  if (isLoading || gigsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading gigs...</p>
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
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-gigs-title">
                    Freelance Gigs
                  </h1>
                  <p className="text-muted-foreground">Offer your services and find great freelancers</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search gigs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                      data-testid="input-search-gigs"
                    />
                  </div>
                  <Button 
                    onClick={() => setShowCreateGig(true)}
                    data-testid="button-create-gig"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Gig
                  </Button>
                </div>
              </div>

              {/* Gig Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card data-testid="card-stat-total-gigs">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Briefcase className="w-5 h-5 text-primary mr-2" />
                      <div className="text-2xl font-bold text-foreground">{gigs?.length || 0}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Available Gigs</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-stat-my-gigs">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-5 h-5 text-green-600 mr-2" />
                      <div className="text-2xl font-bold text-foreground">{userGigs?.length || 0}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">My Gigs</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-stat-total-orders">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                      <div className="text-2xl font-bold text-foreground">
                        {gigs?.reduce((total: number, gig: any) => total + (gig.orders || 0), 0) || 0}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-stat-avg-price">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <DollarSign className="w-5 h-5 text-yellow-600 mr-2" />
                      <div className="text-2xl font-bold text-foreground">
                        ${gigs?.length > 0 ? (gigs.reduce((total: number, gig: any) => total + parseFloat(gig.price || 0), 0) / gigs.length).toFixed(0) : 0}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Price</div>
                  </CardContent>
                </Card>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-8">
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                    data-testid={`button-category-${category.value}`}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>

              {/* Gigs Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGigs.length > 0 ? (
                  filteredGigs.map((gig: any) => (
                    <Card key={gig.id} className="hover:shadow-lg transition-shadow" data-testid={`gig-${gig.id}`}>
                      <CardHeader>
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-10 h-10" data-testid={`avatar-gig-${gig.id}`}>
                            <AvatarImage src={gig.user?.profileImageUrl} />
                            <AvatarFallback>
                              {gig.user?.firstName?.[0]}{gig.user?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-sm" data-testid={`text-seller-${gig.id}`}>
                                {gig.user?.firstName} {gig.user?.lastName}
                              </span>
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-xs text-muted-foreground" data-testid={`text-rating-${gig.id}`}>
                                  {parseFloat(gig.rating || 0).toFixed(1)}
                                </span>
                              </div>
                            </div>
                            <CardTitle className="text-lg line-clamp-2" data-testid={`text-gig-title-${gig.id}`}>
                              {gig.title}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3" data-testid={`text-description-${gig.id}`}>
                          {gig.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          {gig.category && (
                            <Badge variant="outline" className="text-xs" data-testid={`badge-category-${gig.id}`}>
                              {gig.category}
                            </Badge>
                          )}
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span data-testid={`text-delivery-${gig.id}`}>
                              {gig.deliveryTime} day{gig.deliveryTime !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-xl font-bold text-foreground" data-testid={`text-price-${gig.id}`}>
                            Starting at ${parseFloat(gig.price).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground" data-testid={`text-orders-${gig.id}`}>
                            {gig.orders || 0} order{gig.orders !== 1 ? 's' : ''}
                          </div>
                        </div>
                        
                        {/* Only show order button if not own gig */}
                        {gig.userId !== user?.id ? (
                          <PayPalButton
                            amount={gig.price}
                            currency="USD"
                            intent="CAPTURE"
                          />
                        ) : (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            data-testid={`button-edit-gig-${gig.id}`}
                          >
                            Edit Gig
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full" data-testid="empty-gigs">
                    <Card>
                      <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <Briefcase className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No gigs found</h3>
                        <p className="text-muted-foreground mb-4">
                          {searchQuery || selectedCategory !== "all" 
                            ? "Try adjusting your search or filter." 
                            : "Start offering your services to earn money!"}
                        </p>
                        <Button 
                          onClick={() => setShowCreateGig(true)}
                          data-testid="button-create-first-gig"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Gig
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

      {/* Create Gig Modal */}
      <CreateGigModal
        open={showCreateGig}
        onOpenChange={setShowCreateGig}
        onGigCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/gigs"] });
          queryClient.invalidateQueries({ queryKey: ["/api/users/gigs"] });
          setShowCreateGig(false);
        }}
      />
    </div>
  );
}
