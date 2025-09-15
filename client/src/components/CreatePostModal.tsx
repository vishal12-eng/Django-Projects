import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Image, Video, FileText, Upload, X } from "lucide-react";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated: () => void;
}

export default function CreatePostModal({ open, onOpenChange, onPostCreated }: CreatePostModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<"text" | "image" | "video">("text");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest("POST", "/api/posts", formData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post created successfully",
      });
      onPostCreated();
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
        description: "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setContent("");
    setPostType("text");
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Set post type based on file type
    if (file.type.startsWith('image/')) {
      setPostType('image');
    } else if (file.type.startsWith('video/')) {
      setPostType('video');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPostType("text");
  };

  const handleSubmit = () => {
    if (!content.trim() && !selectedFile) {
      toast({
        title: "Error",
        description: "Please add content or attach a file",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("content", content);
    formData.append("postType", postType);
    
    if (selectedFile) {
      formData.append("media", selectedFile);
    }

    createPostMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="create-post-modal">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="post-content">What's on your mind?</Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, ideas, or updates with the community..."
              className="min-h-[120px] resize-none"
              data-testid="textarea-post-content"
            />
            <div className="text-xs text-muted-foreground text-right">
              {content.length}/500
            </div>
          </div>

          {/* Post Type Selection */}
          <div className="space-y-2">
            <Label>Post Type</Label>
            <Select value={postType} onValueChange={(value: any) => setPostType(value)}>
              <SelectTrigger data-testid="select-post-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Text Only
                  </div>
                </SelectItem>
                <SelectItem value="image">
                  <div className="flex items-center">
                    <Image className="w-4 h-4 mr-2" />
                    Image Post
                  </div>
                </SelectItem>
                <SelectItem value="video">
                  <div className="flex items-center">
                    <Video className="w-4 h-4 mr-2" />
                    Video Post
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          {postType !== "text" && (
            <div className="space-y-2">
              <Label>Media Upload</Label>
              {!selectedFile ? (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Choose a file to upload</p>
                    <p className="text-xs text-muted-foreground">
                      {postType === "image" ? "PNG, JPG, GIF up to 10MB" : "MP4, MOV up to 50MB"}
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept={postType === "image" ? "image/*" : "video/*"}
                    onChange={handleFileSelect}
                    className="mt-4"
                    data-testid="input-media-file"
                  />
                </div>
              ) : (
                <div className="relative border border-border rounded-lg overflow-hidden">
                  {postType === "image" && previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-64 object-cover"
                      data-testid="img-post-preview"
                    />
                  ) : postType === "video" && previewUrl ? (
                    <video 
                      src={previewUrl} 
                      className="w-full h-64 object-cover" 
                      controls
                      data-testid="video-post-preview"
                    />
                  ) : null}
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeFile}
                    data-testid="button-remove-file"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  
                  <div className="p-3 bg-muted/50">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-post"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createPostMutation.isPending || (!content.trim() && !selectedFile)}
              data-testid="button-create-post"
            >
              {createPostMutation.isPending ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
