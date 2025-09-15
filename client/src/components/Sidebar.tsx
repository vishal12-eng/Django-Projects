import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard,
  User,
  MessageSquare,
  BookOpen,
  ShoppingBag,
  Briefcase,
  MessageCircle,
  Calendar,
  Video,
  Sparkles
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    testId: "sidebar-dashboard"
  },
  {
    name: "Public Bio",
    href: "/profile",
    icon: User,
    testId: "sidebar-profile"
  },
  {
    name: "Social Feed",
    href: "/feed",
    icon: MessageSquare,
    testId: "sidebar-feed"
  },
  {
    name: "AI Blog",
    href: "/blog",
    icon: BookOpen,
    badge: "AI",
    testId: "sidebar-blog"
  },
  {
    name: "Digital Store",
    href: "/store",
    icon: ShoppingBag,
    testId: "sidebar-store"
  },
  {
    name: "Freelance Gigs",
    href: "/gigs",
    icon: Briefcase,
    testId: "sidebar-gigs"
  },
  {
    name: "Messages",
    href: "/chat",
    icon: MessageCircle,
    badge: "3",
    badgeVariant: "destructive" as const,
    testId: "sidebar-chat"
  },
  {
    name: "Calendar & Tasks",
    href: "/calendar",
    icon: Calendar,
    testId: "sidebar-calendar"
  },
  {
    name: "Video Meetings",
    href: "/meetings",
    icon: Video,
    testId: "sidebar-meetings"
  },
];

const aiAssistant = {
  name: "AI Assistant",
  href: "/ai-assistant",
  icon: Sparkles,
  badge: "Live",
  badgeVariant: "default" as const,
  testId: "sidebar-ai-assistant"
};

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-card border-r border-border" data-testid="sidebar">
      <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
        <div className="flex-1 px-4 space-y-2">
          {/* Main Navigation */}
          {navigation.map((item) => {
            const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  data-testid={item.testId}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {item.badge && (
                    <Badge 
                      variant={item.badgeVariant || "default"} 
                      className="ml-auto text-xs px-2 py-1"
                      data-testid={`${item.testId}-badge`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </a>
              </Link>
            );
          })}

          {/* AI Assistant - Special Section */}
          <div className="pt-4 border-t border-border">
            <Link href={aiAssistant.href}>
              <a
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  location.startsWith(aiAssistant.href)
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary hover:from-primary/20 hover:to-secondary/20"
                )}
                data-testid={aiAssistant.testId}
              >
                <aiAssistant.icon className="mr-3 h-5 w-5" />
                {aiAssistant.name}
                <div className="ml-auto flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" data-testid="ai-status-indicator"></div>
                  <Badge 
                    variant={aiAssistant.badgeVariant} 
                    className="text-xs px-2 py-1"
                    data-testid={`${aiAssistant.testId}-badge`}
                  >
                    {aiAssistant.badge}
                  </Badge>
                </div>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
