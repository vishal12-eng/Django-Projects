import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Video,
  Edit3,
  Trash2
} from "lucide-react";

export default function Calendar() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    eventType: "task" as "meeting" | "task" | "reminder",
  });

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

  // Fetch events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
    enabled: isAuthenticated,
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      return apiRequest("POST", "/api/events", eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setShowCreateEvent(false);
      setNewEvent({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        eventType: "task",
      });
      toast({
        title: "Success",
        description: "Event created successfully",
      });
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
        description: "Failed to create event",
        variant: "destructive",
      });
    },
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return apiRequest("PATCH", `/api/events/${eventId}`, { completed: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Task completed",
      });
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
        description: "Failed to complete task",
        variant: "destructive",
      });
    },
  });

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.startDate || !newEvent.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createEventMutation.mutate(newEvent);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventsForDate = (date: Date) => {
    if (!events) return [];
    
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((event: any) => {
      const eventDate = new Date(event.startDate).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const todayEvents = getEventsForDate(new Date());
  const selectedDateEvents = getEventsForDate(selectedDate);
  const upcomingEvents = events?.filter((event: any) => {
    const eventDate = new Date(event.startDate);
    const now = new Date();
    return eventDate > now;
  }).slice(0, 5) || [];

  const pendingTasks = events?.filter((event: any) => 
    event.eventType === 'task' && !event.completed
  ) || [];

  if (isLoading || eventsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
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
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-calendar-title">
                    Calendar & Tasks
                  </h1>
                  <p className="text-muted-foreground">Manage your schedule and to-do list with AI suggestions</p>
                </div>
                <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-event">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="dialog-create-event">
                    <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={newEvent.title}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Event title"
                          data-testid="input-event-title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={newEvent.description}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Event description"
                          data-testid="input-event-description"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <Select 
                          value={newEvent.eventType} 
                          onValueChange={(value: any) => setNewEvent(prev => ({ ...prev, eventType: value }))}
                        >
                          <SelectTrigger data-testid="select-event-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="task">Task</SelectItem>
                            <SelectItem value="meeting">Meeting</SelectItem>
                            <SelectItem value="reminder">Reminder</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Start Date & Time</label>
                          <Input
                            type="datetime-local"
                            value={newEvent.startDate}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                            data-testid="input-start-date"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">End Date & Time</label>
                          <Input
                            type="datetime-local"
                            value={newEvent.endDate}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                            data-testid="input-end-date"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowCreateEvent(false)} data-testid="button-cancel-event">
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateEvent}
                          disabled={createEventMutation.isPending}
                          data-testid="button-save-event"
                        >
                          Create Event
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Calendar Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card data-testid="card-stat-today-events">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CalendarIcon className="w-5 h-5 text-primary mr-2" />
                      <div className="text-2xl font-bold text-foreground">{todayEvents.length}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Today's Events</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-stat-pending-tasks">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
                      <div className="text-2xl font-bold text-foreground">{pendingTasks.length}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Pending Tasks</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-stat-upcoming-events">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="w-5 h-5 text-blue-600 mr-2" />
                      <div className="text-2xl font-bold text-foreground">{upcomingEvents.length}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">Upcoming</div>
                  </CardContent>
                </Card>
                <Card data-testid="card-stat-completed-tasks">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <div className="text-2xl font-bold text-foreground">
                        {events?.filter((event: any) => event.eventType === 'task' && event.completed).length || 0}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Calendar */}
                <div className="lg:col-span-2">
                  <Card data-testid="card-calendar">
                    <CardHeader>
                      <CardTitle>Calendar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        className="rounded-md border"
                        data-testid="calendar-component"
                      />
                      
                      {/* Events for Selected Date */}
                      {selectedDateEvents.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="text-selected-date-events">
                            Events for {formatDate(selectedDate.toISOString())}
                          </h3>
                          <div className="space-y-3">
                            {selectedDateEvents.map((event: any) => (
                              <div key={event.id} className="p-3 border border-border rounded-lg" data-testid={`event-${event.id}`}>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-semibold text-foreground" data-testid={`text-event-title-${event.id}`}>
                                        {event.title}
                                      </span>
                                      <Badge variant={
                                        event.eventType === 'meeting' ? 'default' :
                                        event.eventType === 'task' ? 'secondary' : 'outline'
                                      } data-testid={`badge-event-type-${event.id}`}>
                                        {event.eventType === 'meeting' && <Users className="w-3 h-3 mr-1" />}
                                        {event.eventType === 'task' && <CheckCircle className="w-3 h-3 mr-1" />}
                                        {event.eventType === 'reminder' && <AlertCircle className="w-3 h-3 mr-1" />}
                                        {event.eventType}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2" data-testid={`text-event-description-${event.id}`}>
                                      {event.description}
                                    </p>
                                    <div className="text-xs text-muted-foreground" data-testid={`text-event-time-${event.id}`}>
                                      {formatTime(event.startDate)} - {formatTime(event.endDate)}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {event.eventType === 'task' && !event.completed && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => completeTaskMutation.mutate(event.id)}
                                        data-testid={`button-complete-task-${event.id}`}
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </Button>
                                    )}
                                    {event.eventType === 'meeting' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        data-testid={`button-join-meeting-${event.id}`}
                                      >
                                        <Video className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar with Today's Events and Tasks */}
                <div className="space-y-6">
                  {/* Today's Events */}
                  <Card data-testid="card-today-events">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CalendarIcon className="w-5 h-5 mr-2" />
                        Today's Events
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {todayEvents.length > 0 ? (
                        <div className="space-y-3">
                          {todayEvents.map((event: any) => (
                            <div key={event.id} className="p-3 bg-muted/50 rounded-lg" data-testid={`today-event-${event.id}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-foreground" data-testid={`text-today-event-title-${event.id}`}>
                                  {event.title}
                                </span>
                                <Badge variant="outline" className="text-xs" data-testid={`badge-today-event-type-${event.id}`}>
                                  {event.eventType}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground" data-testid={`text-today-event-time-${event.id}`}>
                                {formatTime(event.startDate)} - {formatTime(event.endDate)}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4" data-testid="no-events-today">
                          No events scheduled for today
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Pending Tasks */}
                  <Card data-testid="card-pending-tasks">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Pending Tasks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {pendingTasks.length > 0 ? (
                        <div className="space-y-3">
                          {pendingTasks.slice(0, 5).map((task: any) => (
                            <div key={task.id} className="flex items-center justify-between p-2" data-testid={`pending-task-${task.id}`}>
                              <div className="flex-1">
                                <span className="text-sm font-medium text-foreground" data-testid={`text-task-title-${task.id}`}>
                                  {task.title}
                                </span>
                                <p className="text-xs text-muted-foreground" data-testid={`text-task-date-${task.id}`}>
                                  Due: {formatDate(task.endDate)}
                                </p>
                              </div>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => completeTaskMutation.mutate(task.id)}
                                data-testid={`button-complete-pending-task-${task.id}`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4" data-testid="no-pending-tasks">
                          No pending tasks
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Upcoming Events */}
                  <Card data-testid="card-upcoming-events">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        Upcoming
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {upcomingEvents.length > 0 ? (
                        <div className="space-y-3">
                          {upcomingEvents.map((event: any) => (
                            <div key={event.id} className="p-2" data-testid={`upcoming-event-${event.id}`}>
                              <span className="text-sm font-medium text-foreground" data-testid={`text-upcoming-event-title-${event.id}`}>
                                {event.title}
                              </span>
                              <p className="text-xs text-muted-foreground" data-testid={`text-upcoming-event-date-${event.id}`}>
                                {formatDate(event.startDate)} at {formatTime(event.startDate)}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4" data-testid="no-upcoming-events">
                          No upcoming events
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
