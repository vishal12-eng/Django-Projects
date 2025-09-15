import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Star, 
  Bell, 
  Menu,
  User,
  Settings,
  LogOut,
  Sparkles
} from "lucide-react";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer" data-testid="logo">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">InfinityHub</span>
              <Badge variant="secondary" className="text-xs" data-testid="version-badge">v2.5</Badge>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/feed">
              <Button 
                variant={location === "/feed" ? "default" : "ghost"} 
                size="sm"
                data-testid="nav-feed"
              >
                Feed
              </Button>
            </Link>
            <Link href="/blog">
              <Button 
                variant={location === "/blog" ? "default" : "ghost"} 
                size="sm"
                data-testid="nav-blog"
              >
                Blog
              </Button>
            </Link>
            <Link href="/store">
              <Button 
                variant={location === "/store" ? "default" : "ghost"} 
                size="sm"
                data-testid="nav-store"
              >
                Store
              </Button>
            </Link>
            <Link href="/gigs">
              <Button 
                variant={location === "/gigs" ? "default" : "ghost"} 
                size="sm"
                data-testid="nav-gigs"
              >
                Gigs
              </Button>
            </Link>
            <Link href="/chat">
              <Button 
                variant={location === "/chat" ? "default" : "ghost"} 
                size="sm"
                data-testid="nav-chat"
              >
                Chat
              </Button>
            </Link>
            <Link href="/ai-assistant">
              <Button 
                variant={location === "/ai-assistant" ? "default" : "outline"} 
                size="sm"
                className="bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:from-primary/90 hover:to-secondary/90"
                data-testid="nav-ai-assistant"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Assistant
              </Button>
            </Link>
          </div>

          {/* Profile & Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs text-destructive-foreground flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Profile Dropdown */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="user-menu-trigger">
                    <Avatar className="h-8 w-8" data-testid="user-avatar">
                      <AvatarImage src={user.profileImageUrl} alt="User avatar" />
                      <AvatarFallback>
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount data-testid="user-menu">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium" data-testid="user-name">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid="user-email">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full" data-testid="menu-profile">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem data-testid="menu-settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => window.location.href = "/api/login"} data-testid="button-login">
                Sign In
              </Button>
            )}

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" data-testid="mobile-menu-trigger">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80" data-testid="mobile-menu">
                  <div className="flex flex-col space-y-4 mt-8">
                    <Link href="/feed" onClick={() => setShowMobileMenu(false)}>
                      <Button variant="ghost" className="w-full justify-start" data-testid="mobile-nav-feed">
                        Feed
                      </Button>
                    </Link>
                    <Link href="/blog" onClick={() => setShowMobileMenu(false)}>
                      <Button variant="ghost" className="w-full justify-start" data-testid="mobile-nav-blog">
                        Blog
                      </Button>
                    </Link>
                    <Link href="/store" onClick={() => setShowMobileMenu(false)}>
                      <Button variant="ghost" className="w-full justify-start" data-testid="mobile-nav-store">
                        Store
                      </Button>
                    </Link>
                    <Link href="/gigs" onClick={() => setShowMobileMenu(false)}>
                      <Button variant="ghost" className="w-full justify-start" data-testid="mobile-nav-gigs">
                        Gigs
                      </Button>
                    </Link>
                    <Link href="/chat" onClick={() => setShowMobileMenu(false)}>
                      <Button variant="ghost" className="w-full justify-start" data-testid="mobile-nav-chat">
                        Chat
                      </Button>
                    </Link>
                    <Link href="/ai-assistant" onClick={() => setShowMobileMenu(false)}>
                      <Button variant="outline" className="w-full justify-start" data-testid="mobile-nav-ai">
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Assistant
                      </Button>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
