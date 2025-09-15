import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Feed from "@/pages/Feed";
import Blog from "@/pages/Blog";
import Store from "@/pages/Store";
import Gigs from "@/pages/Gigs";
import Chat from "@/pages/Chat";
import Calendar from "@/pages/Calendar";
import AIAssistant from "@/pages/AIAssistant";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/profile" component={Profile} />
          <Route path="/u/:username" component={Profile} />
          <Route path="/feed" component={Feed} />
          <Route path="/blog" component={Blog} />
          <Route path="/store" component={Store} />
          <Route path="/gigs" component={Gigs} />
          <Route path="/chat" component={Chat} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/ai-assistant" component={AIAssistant} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
