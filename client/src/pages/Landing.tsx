import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  MessageSquare, 
  ShoppingBag, 
  Briefcase, 
  BookOpen, 
  Calendar,
  Video,
  Sparkles,
  Users,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">InfinityHub</span>
              <Badge variant="secondary">v2.5</Badge>
            </div>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Your Complete Digital
              <span className="block text-primary">Platform</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Combine social media, AI-powered content creation, digital marketplace, 
              freelance platform, and productivity tools in one powerful super app.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-get-started"
                className="text-lg px-8 py-4"
              >
                Get Started Free
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                data-testid="button-learn-more"
                className="text-lg px-8 py-4"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary" data-testid="text-users-count">10K+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary" data-testid="text-products-count">5K+</div>
              <div className="text-muted-foreground">Digital Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary" data-testid="text-gigs-count">2K+</div>
              <div className="text-muted-foreground">Active Gigs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary" data-testid="text-revenue-count">$500K+</div>
              <div className="text-muted-foreground">Creator Revenue</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stop juggling multiple apps. InfinityHub combines all essential tools 
              for modern creators and entrepreneurs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Social Feed */}
            <Card className="hover:shadow-lg transition-shadow" data-testid="card-feature-social">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Social Feed</CardTitle>
                <CardDescription>
                  Share posts, engage with community, and build your following
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Image & video posts</li>
                  <li>• Real-time engagement</li>
                  <li>• Hashtag discovery</li>
                  <li>• Community building</li>
                </ul>
              </CardContent>
            </Card>

            {/* AI Blog */}
            <Card className="hover:shadow-lg transition-shadow" data-testid="card-feature-blog">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>AI-Powered Blog</CardTitle>
                <CardDescription>
                  Create amazing content with Gemini 2.5 Flash assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• AI content generation</li>
                  <li>• Markdown editor</li>
                  <li>• SEO optimization</li>
                  <li>• Publishing tools</li>
                </ul>
              </CardContent>
            </Card>

            {/* Digital Store */}
            <Card className="hover:shadow-lg transition-shadow" data-testid="card-feature-store">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <ShoppingBag className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Digital Store</CardTitle>
                <CardDescription>
                  Sell digital products with PayPal integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• File upload & delivery</li>
                  <li>• PayPal checkout</li>
                  <li>• Sales analytics</li>
                  <li>• Customer management</li>
                </ul>
              </CardContent>
            </Card>

            {/* Freelance Gigs */}
            <Card className="hover:shadow-lg transition-shadow" data-testid="card-feature-gigs">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Freelance Gigs</CardTitle>
                <CardDescription>
                  Offer services and manage client projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Service listings</li>
                  <li>• Order management</li>
                  <li>• Payment processing</li>
                  <li>• Client communication</li>
                </ul>
              </CardContent>
            </Card>

            {/* Real-time Chat */}
            <Card className="hover:shadow-lg transition-shadow" data-testid="card-feature-chat">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Real-time Chat</CardTitle>
                <CardDescription>
                  Direct messaging with instant notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Instant messaging</li>
                  <li>• File sharing</li>
                  <li>• Read receipts</li>
                  <li>• Typing indicators</li>
                </ul>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="hover:shadow-lg transition-shadow" data-testid="card-feature-ai">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle>AI Assistant</CardTitle>
                <CardDescription>
                  Get help with content ideas and business decisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Content suggestions</li>
                  <li>• Business advice</li>
                  <li>• Task automation</li>
                  <li>• Creative ideas</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Why Choose InfinityHub?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center" data-testid="benefit-all-in-one">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">All-in-One Solution</h3>
              <p className="text-muted-foreground">
                Replace multiple subscriptions with one comprehensive platform 
                that handles everything from social media to payments.
              </p>
            </div>

            <div className="text-center" data-testid="benefit-ai-powered">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">AI-Powered Growth</h3>
              <p className="text-muted-foreground">
                Leverage Gemini 2.5 Flash AI to create better content, 
                generate ideas, and grow your business faster.
              </p>
            </div>

            <div className="text-center" data-testid="benefit-secure">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Secure & Reliable</h3>
              <p className="text-muted-foreground">
                Enterprise-grade security with PayPal integration 
                ensures your data and payments are always protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Digital Presence?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join thousands of creators and entrepreneurs who are already 
            building their success with InfinityHub.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-start-free-trial"
            className="text-lg px-8 py-4"
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">InfinityHub</span>
              <Badge variant="secondary">v2.5</Badge>
            </div>
            <p className="text-muted-foreground text-center md:text-right">
              © 2024 InfinityHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
