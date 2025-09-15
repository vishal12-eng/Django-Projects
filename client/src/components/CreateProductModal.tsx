import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileText, Image, DollarSign, Package } from "lucide-react";

interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated: () => void;
}

export default function CreateProductModal({ open, onOpenChange, onProductCreated }: CreateProductModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    active: true,
  });
  const [productFile, setProductFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const createProductMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      onProductCreated();
      resetForm();
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
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      category: "",
      active: true,
    });
    setProductFile(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductFile(file);
    }
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.price || !productFile) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and upload the product file",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("price", formData.price);
    submitData.append("category", formData.category);
    submitData.append("active", formData.active.toString());
    submitData.append("file", productFile);
    
    if (imageFile) {
      submitData.append("image", imageFile);
    }

    createProductMutation.mutate(submitData);
  };

  const categories = [
    { value: "ebooks", label: "eBooks" },
    { value: "courses", label: "Online Courses" },
    { value: "templates", label: "Templates" },
    { value: "software", label: "Software" },
    { value: "graphics", label: "Graphics & Design" },
    { value: "audio", label: "Audio" },
    { value: "other", label: "Other" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="create-product-modal">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="product-title">Product Title *</Label>
              <Input
                id="product-title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter product title"
                data-testid="input-product-title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product-price">Price (USD) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                  data-testid="input-product-price"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="product-description">Description *</Label>
            <Textarea
              id="product-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your product, what customers will get, key features..."
              className="min-h-[100px]"
              data-testid="textarea-product-description"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger data-testid="select-product-category">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product File */}
            <div className="space-y-2">
              <Label>Product File *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium mb-2">Upload your digital product</p>
                <p className="text-xs text-muted-foreground mb-3">
                  PDF, ZIP, or any digital file (max 50MB)
                </p>
                <Input
                  type="file"
                  onChange={handleProductFileSelect}
                  className="w-full"
                  data-testid="input-product-file"
                />
                {productFile && (
                  <p className="text-xs text-foreground mt-2 font-medium">
                    Selected: {productFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* Product Image */}
            <div className="space-y-2">
              <Label>Product Image</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                {imagePreview ? (
                  <div className="space-y-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded-lg"
                      data-testid="img-product-preview"
                    />
                    <p className="text-xs text-foreground font-medium">
                      {imageFile?.name}
                    </p>
                  </div>
                ) : (
                  <>
                    <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium mb-2">Upload product image</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      JPG, PNG (recommended: 600x400px)
                    </p>
                  </>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileSelect}
                  className="w-full"
                  data-testid="input-product-image"
                />
              </div>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <Label htmlFor="product-active">Active Product</Label>
              <p className="text-sm text-muted-foreground">
                Make this product available for purchase immediately
              </p>
            </div>
            <Switch
              id="product-active"
              checked={formData.active}
              onCheckedChange={(checked) => handleInputChange("active", checked)}
              data-testid="switch-product-active"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-product"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createProductMutation.isPending}
              data-testid="button-create-product"
            >
              {createProductMutation.isPending ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
