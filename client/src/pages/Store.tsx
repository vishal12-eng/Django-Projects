import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import CreateProductModal from "@/components/CreateProductModal";
import PayPalButton from "@/components/PayPalButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Plus,
  Search,
  ShoppingBag,
  DollarSign,
  Package,
  TrendingUp,
  Star,
  Download
} from "lucide-react";

export default function Store() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateProduct, setShowCreateProduct] = useState(false);
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

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    enabled: isAuthenticated,
  });

  // Fetch user's products
  const { data: userProducts } = useQuery({
    queryKey: ["/api/users/products"],
    enabled: isAuthenticated,
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "ebooks", label: "eBooks" },
    { value: "courses", label: "Courses" },
    { value: "templates", label: "Templates" },
    { value: "software", label: "Software" },
    { value: "graphics", label: "Graphics" },
    { value: "audio", label: "Audio" },
  ];

  const filteredProducts = products?.filter((product: any) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  if (isLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading store...</p>
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
                  <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-store-title">
                    Digital Store
                  </h1>
                  <p className="text-muted-foreground">Sell your digital products with PayPal integration</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                      data-testid="input-search-products"
                    />
                  </div>
                  <Button 
                    onClick={() => setShowCreateProduct(true)}
                    data-testid="button-create-product"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>

              {/* Store Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card data-testid="card-stat-total-products">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Package className="w-5 h-5 text-primary mr-2" />
                      <div className="text-2xl font-bold text-foreground">{products?.length || 0}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Total Products</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-stat-my-products">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <ShoppingBag className="w-5 h-5 text-green-600 mr-2" />
                      <div className="text-2xl font-bold text-foreground">{userProducts?.length || 0}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">My Products</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-stat-total-sales">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <DollarSign className="w-5 h-5 text-yellow-600 mr-2" />
                      <div className="text-2xl font-bold text-foreground">
                        ${products?.reduce((total: number, product: any) => total + (product.sales || 0) * parseFloat(product.price || 0), 0).toFixed(0) || 0}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">Total Sales</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-stat-avg-rating">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-5 h-5 text-orange-600 mr-2" />
                      <div className="text-2xl font-bold text-foreground">4.8</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Rating</div>
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

              {/* Products Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product: any) => (
                    <Card key={product.id} className="hover:shadow-lg transition-shadow" data-testid={`product-${product.id}`}>
                      <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.title}
                            className="w-full h-full object-cover"
                            data-testid={`img-product-${product.id}`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg line-clamp-2" data-testid={`text-product-title-${product.id}`}>
                            {product.title}
                          </CardTitle>
                          {product.category && (
                            <Badge variant="outline" className="text-xs ml-2" data-testid={`badge-category-${product.id}`}>
                              {product.category}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2" data-testid={`text-description-${product.id}`}>
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-2xl font-bold text-foreground" data-testid={`text-price-${product.id}`}>
                            ${parseFloat(product.price).toFixed(2)}
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Download className="w-4 h-4" />
                            <span data-testid={`text-sales-${product.id}`}>{product.sales || 0} sales</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <PayPalButton
                            amount={product.price}
                            currency="USD"
                            intent="CAPTURE"
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            data-testid={`button-preview-${product.id}`}
                          >
                            Preview
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full" data-testid="empty-products">
                    <Card>
                      <CardContent className="p-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
                        <p className="text-muted-foreground mb-4">
                          {searchQuery || selectedCategory !== "all" 
                            ? "Try adjusting your search or filter." 
                            : "Start selling your digital products today!"}
                        </p>
                        <Button 
                          onClick={() => setShowCreateProduct(true)}
                          data-testid="button-create-first-product"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Product
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

      {/* Create Product Modal */}
      <CreateProductModal
        open={showCreateProduct}
        onOpenChange={setShowCreateProduct}
        onProductCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/products"] });
          queryClient.invalidateQueries({ queryKey: ["/api/users/products"] });
          setShowCreateProduct(false);
        }}
      />
    </div>
  );
}
