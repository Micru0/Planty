'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createSupabaseClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CalendarDays, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"

// Interface for CareTask based on prompt/Care Calendar Generation Post-Purchase.md
// and aligning with existing 'care_task' table structure from prompt/0-supabase-sql.md
export interface CareTask {
  id: string; // Assuming care_task.id is a uuid or string
  user_id: string; // Foreign key to next_auth.users
  listing_id: string; // Foreign key to listing
  task_description: string;
  due_date: string; // Supabase timestampz will be string by default
  completed: boolean;
  created_at: string;
  // Optional: plant_name if we join with listings table
  plant_name?: string; 
}

export default function CareCalendarPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCareTasks = useCallback(async () => {
    if (!session?.supabaseAccessToken || !session?.user?.id) {
      setError("User session not found. Please log in.");
      setIsLoading(false);
      return;
    }

    console.log("CareCalendarPage: Fetching care tasks for user:", session.user.id);
    setIsLoading(true);
    setError(null);

    const supabase = createSupabaseClient(session.supabaseAccessToken);

    try {
      // Fetch care tasks and join with listings to get plant_name
      const { data, error: fetchError } = await supabase
        .from("care_task")
        .select(`
          *,
          listing:listing_id (
            species
          )
        `)
        .eq("user_id", session.user.id)
        .order("due_date", { ascending: true });

      if (fetchError) {
        console.error("CareCalendarPage: Error fetching care tasks:", fetchError);
        throw fetchError;
      }

      console.log("CareCalendarPage: Fetched tasks raw data:", data);

      const formattedTasks: CareTask[] = data.map((task: any) => ({
        id: task.id,
        user_id: task.user_id,
        listing_id: task.listing_id,
        task_description: task.task_description,
        due_date: task.due_date,
        completed: task.completed,
        created_at: task.created_at,
        plant_name: task.listing?.species || "Unknown Plant",
      }));
      
      setTasks(formattedTasks);
      console.log("CareCalendarPage: Formatted tasks set in state:", formattedTasks);

      // Check for tasks due today
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today to the start of the day
      const tasksDueToday = formattedTasks.filter(task => {
        if (task.completed) return false;
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0); // Normalize due date
        return dueDate.getTime() === today.getTime();
      });

      if (tasksDueToday.length > 0) {
        console.log(`CareCalendarPage: ${tasksDueToday.length} task(s) due today.`);
        toast({
          title: "Care Reminder!",
          description: `You have ${tasksDueToday.length} plant care task(s) due today. Check your Care Calendar!`,
          duration: 7000, // Show for 7 seconds
        });
      }

    } catch (e: any) {
      console.error("CareCalendarPage: Catch block error:", e);
      setError(`Failed to load care tasks: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [session, toast]);

  useEffect(() => {
    if (session) {
      fetchCareTasks();
    }
  }, [session, fetchCareTasks]);

  const handleTaskCompletionChange = async (taskId: string, completed: boolean) => {
    if (!session?.supabaseAccessToken) {
      setError("User session not found. Please log in.");
      return;
    }
    console.log(`CareCalendarPage: Updating task ${taskId} to completed: ${completed}`);
    const supabase = createSupabaseClient(session.supabaseAccessToken);
    try {
      const { error: updateError } = await supabase
        .from("care_task")
        .update({ completed })
        .eq("id", taskId);

      if (updateError) {
        console.error("CareCalendarPage: Error updating task:", updateError);
        throw updateError;
      }

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        )
      );
      console.log(`CareCalendarPage: Task ${taskId} successfully updated locally and in DB.`);
    } catch (e: any) {
      console.error("CareCalendarPage: Error in handleTaskCompletionChange:", e);
      setError(`Failed to update task status: ${e.message}`);
      // Optionally revert optimistic update here
    }
  };

  if (!session && !isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please log in to view your care calendar.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading your Care Calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Toaster />
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          My Care Calendar
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Keep your plants thriving with this personalized care schedule.
        </p>
      </header>

      {tasks.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Care Tasks Yet!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              It looks like you don't have any care tasks scheduled.
              Once you purchase a plant, your personalized care tasks will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {tasks.map((task) => (
            <Card key={task.id} className={`transition-all duration-300 ease-in-out ${task.completed ? "bg-muted/50 opacity-70" : "bg-card"}`}>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                  <div>
                    <CardTitle className="text-xl mb-1">{task.plant_name || "Plant Care Task"}</CardTitle>
                    <p className="text-sm text-muted-foreground">Task ID: {task.id}</p>
                  </div>
                  <Badge 
                    variant={task.completed ? "secondary" : "default"} 
                    className={`mt-2 sm:mt-0 text-xs px-2 py-1 force-primary-button ${task.completed ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"} text-white`}
                  >
                    {task.completed ? "Completed" : "Pending"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold mb-2">{task.task_description}</p>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={(checked) => {
                      // The 'checked' argument can be boolean or 'indeterminate'.
                      // We only care about boolean true/false.
                      if (typeof checked === 'boolean') {
                        handleTaskCompletionChange(task.id, checked);
                      }
                    }}
                    aria-label={`Mark task ${task.task_description} as ${task.completed ? 'not completed' : 'completed'}`}
                  />
                  <label
                    htmlFor={`task-${task.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {task.completed ? "Mark as Incomplete" : "Mark as Complete"}
                  </label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 