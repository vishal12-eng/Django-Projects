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
import { DollarSign, Clock, Briefcase } from "lucide-react";

interface CreateGigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGigCreated: () => void;
}

export default function CreateGigModal({ open, onOpenChange, onGigCreated }: CreateGigModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    deliveryTime: "3",
    active: true,
  });

  const createGigMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/gigs", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Gig created successfully",
      });
      onGigCreated();
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
        description: "Failed to create gig",
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
      deliveryTime: "3",
      active: true,
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
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

    const deliveryTime = parseInt(formData.deliveryTime);
    if (isNaN(deliveryTime) || deliveryTime <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid delivery time",
        variant: "destructive",
      });
      return;
    }

    createGigMutation.mutate({
      title: formData.title,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      deliveryTime: deliveryTime,
      active: formData.active,
    });
  };

  const categories = [
    { value: "design", label: "Design & Graphics" },
    { value: "development", label: "Programming & Development" },
    { value: "writing", label: "Writing & Translation" },
    { value: "marketing", label: "Digital Marketing" },
    { value: "video", label: "Video & Animation" },
    { value: "business", label: "Business Consulting" },
    { value: "lifestyle", label: "Lifestyle" },
    { value: "other", label: "Other" },
  ];

  const deliveryOptions = [
    { value: "1", label: "1 day" },
    { value: "2", label: "2 days" },
    { value: "3", label: "3 days" },
    { value: "5", label: "5 days" },
    { value: "7", label: "1 week" },
    { value: "14", label: "2 weeks" },
    { value: "21", label: "3 weeks" },
    { value: "30", label: "1 month" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="create-gig-modal">
        <DialogHeader>
          <DialogTitle>Create New Gig</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Gig Title */}
          <div className="space-y-2">
            <Label htmlFor="gig-title">Gig Title *</Label>
            <Input
              id="gig-title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="I will create a professional logo design for your business"
              data-testid="input-gig-title"
            />
            <p className="text-xs text-muted-foreground">
              Start with "I will..." and clearly describe what you offer
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="gig-description">Description *</Label>
            <Textarea
              id="gig-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your service in detail. What will you deliver? What's included? What makes your service special?"
              className="min-h-[120px]"
              data-testid="textarea-gig-description"
            />
          </div>

          {/* Price and Delivery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gig-price">Starting Price (USD) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="gig-price"
                  type="number"
                  min="5"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="25.00"
                  className="pl-10"
                  data-testid="input-gig-price"
                />
              </div>
              <p className="text-xs text-muted-foreground">Minimum $5</p>
            </div>

            <div className="space-y-2">
              <Label>Delivery Time *</Label>
              <Select value={formData.deliveryTime} onValueChange={(value) => handleInputChange("deliveryTime", value)}>
                <SelectTrigger data-testid="select-delivery-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deliveryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger data-testid="select-gig-category">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service Details */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-4">
            <h4 className="font-medium">What's Included in Your Service</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="font-medium text-muted-foreground">Consider including:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Number of revisions</li>
                  <li>• File formats provided</li>
                  <li>• Commercial use rights</li>
                  <li>• Source files inclusion</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-muted-foreground">Professional tips:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Be specific about deliverables</li>
                  <li>• Set clear expectations</li>
                  <li>• Mention your experience</li>
                  <li>• Add portfolio examples</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <Label htmlFor="gig-active">Active Gig</Label>
              <p className="text-sm text-muted-foreground">
                Make this gig available for orders immediately
              </p>
            </div>
            <Switch
              id="gig-active"
              checked={formData.active}
              onCheckedChange={(checked) => handleInputChange("active", checked)}
              data-testid="switch-gig-active"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-gig"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createGigMutation.isPending}
              data-testid="button-create-gig"
            >
              {createGigMutation.isPending ? "Creating..." : "Create Gig"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
