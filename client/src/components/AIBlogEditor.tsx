import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Sparkles, 
  FileText, 
  Eye, 
  Save, 
  Wand2, 
  Lightbulb,
  RefreshCw,
  Copy,
  PenTool
} from "lucide-react";

interface AIBlogEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog?: any;
  onBlogSaved: () => void;
}

export default function AIBlogEditor({ open, onOpenChange, blog, onBlogSaved }: AIBlogEditorProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    published: false,
  });
  const [aiPrompt, setAiPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("write");
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize form with existing blog data
  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || "",
        content: blog.content || "",
        excerpt: blog.excerpt || "",
        published: blog.published || false,
      });
    } else {
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        published: false,
      });
    }
  }, [blog]);

  // Save blog mutation
  const saveBlogMutation = useMutation({
    mutationFn: async (data: any) => {
      if (blog?.id) {
        return apiRequest("PUT", `/api/blogs/${blog.id}`, data);
      } else {
        return apiRequest("POST", "/api/blogs", data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: blog?.id ? "Blog updated successfully" : "Blog created successfully",
      });
      onBlogSaved();
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
        description: "Failed to save blog",
        variant: "destructive",
      });
    },
  });

  // Generate blog content mutation
  const generateContentMutation = useMutation({
    mutationFn: async (prompt: string) => {
      return apiRequest("POST", "/api/blogs/generate", { 
        prompt, 
        title: formData.title || "AI Generated Blog Post" 
      });
    },
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || data.content.slice(0, 150) + "...",
      }));
      setIsGenerating(false);
      setActiveTab("write");
      toast({
        title: "Success",
        description: "AI content generated successfully",
      });
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
        description: "Failed to generate content",
        variant: "destructive",
      });
    },
  });

  // Get content ideas mutation
  const getIdeasMutation = useMutation({
    mutationFn: async (topic: string) => {
      return apiRequest("POST", "/api/ai/content-ideas", { 
        topic, 
        type: "blog" 
      });
    },
    onSuccess: (data) => {
      const ideas = data.ideas.join('\n\n• ');
      toast({
        title: "Content Ideas Generated",
        description: "Check the AI tab for your content ideas",
      });
      setAiPrompt(`Here are some blog ideas for "${data.topic}":\n\n• ${ideas}`);
      setActiveTab("ai");
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
        description: "Failed to generate ideas",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateContent = () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for AI content generation",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateContentMutation.mutate(aiPrompt);
  };

  const handleGetIdeas = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a blog title first to get content ideas",
        variant: "destructive",
      });
      return;
    }

    getIdeasMutation.mutate(formData.title);
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    saveBlogMutation.mutate({
      ...formData,
      aiGenerated: !!blog?.aiGenerated || generateContentMutation.isSuccess,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    });
  };

  const quickPrompts = [
    "Write a comprehensive guide about productivity tips for remote workers",
    "Create a beginner's tutorial on digital marketing strategies",
    "Explain the benefits of AI in modern business operations",
    "Write about the latest trends in web development",
    "Create a how-to guide for starting a successful freelance career",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col" data-testid="ai-blog-editor">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary" />
              {blog?.id ? "Edit Blog Post" : "Create New Blog Post"}
            </DialogTitle>
            <Badge variant="secondary" className="flex items-center">
              <Wand2 className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="write" className="flex items-center" data-testid="tab-write">
                <PenTool className="w-4 h-4 mr-2" />
                Write
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center" data-testid="tab-ai">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center" data-testid="tab-preview">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto mt-4">
              {/* Write Tab */}
              <TabsContent value="write" className="space-y-4 h-full" data-testid="write-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="blog-title">Title *</Label>
                    <Input
                      id="blog-title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Enter your blog post title"
                      data-testid="input-blog-title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="blog-excerpt">Excerpt</Label>
                    <Input
                      id="blog-excerpt"
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange("excerpt", e.target.value)}
                      placeholder="Brief description or summary"
                      data-testid="input-blog-excerpt"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blog-content">Content *</Label>
                  <Textarea
                    id="blog-content"
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    placeholder="Write your blog content here. You can use markdown formatting."
                    className="min-h-[400px] font-mono"
                    data-testid="textarea-blog-content"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supports Markdown formatting. Character count: {formData.content.length}
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label htmlFor="blog-published">Publish immediately</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this blog post visible to everyone
                    </p>
                  </div>
                  <Switch
                    id="blog-published"
                    checked={formData.published}
                    onCheckedChange={(checked) => handleInputChange("published", checked)}
                    data-testid="switch-blog-published"
                  />
                </div>
              </TabsContent>

              {/* AI Assistant Tab */}
              <TabsContent value="ai" className="space-y-4" data-testid="ai-content">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">AI Writing Assistant</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleGetIdeas}
                      disabled={getIdeasMutation.isPending || !formData.title.trim()}
                      data-testid="button-get-ideas"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Get Ideas
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ai-prompt">AI Prompt</Label>
                    <Textarea
                      id="ai-prompt"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Describe what you want to write about. Be specific about the topic, tone, and target audience."
                      className="min-h-[120px]"
                      data-testid="textarea-ai-prompt"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quick Prompts</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {quickPrompts.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-left h-auto p-3 justify-start whitespace-normal"
                          onClick={() => setAiPrompt(prompt)}
                          data-testid={`quick-prompt-${index}`}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleGenerateContent}
                      disabled={isGenerating || !aiPrompt.trim()}
                      className="flex-1"
                      data-testid="button-generate-content"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate Content
                        </>
                      )}
                    </Button>
                    {formData.content && (
                      <Button 
                        variant="outline" 
                        onClick={() => copyToClipboard(formData.content)}
                        data-testid="button-copy-content"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-4" data-testid="preview-content">
                <div className="prose prose-sm max-w-none">
                  <h1 className="text-3xl font-bold mb-4" data-testid="preview-title">
                    {formData.title || "Untitled Blog Post"}
                  </h1>
                  {formData.excerpt && (
                    <p className="text-lg text-muted-foreground mb-6 italic" data-testid="preview-excerpt">
                      {formData.excerpt}
                    </p>
                  )}
                  <div className="whitespace-pre-wrap" data-testid="preview-content-body">
                    {formData.content || "No content to preview. Start writing or use AI to generate content."}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center space-x-2">
            {blog?.aiGenerated && (
              <Badge variant="secondary" className="flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Generated
              </Badge>
            )}
            {formData.published ? (
              <Badge variant="default">Published</Badge>
            ) : (
              <Badge variant="outline">Draft</Badge>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-blog"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saveBlogMutation.isPending || !formData.title.trim() || !formData.content.trim()}
              data-testid="button-save-blog"
            >
              {saveBlogMutation.isPending ? "Saving..." : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {blog?.id ? "Update" : "Save"} Blog
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
