'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { createSupabaseClient } from '@/utils/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2, Leaf } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";
import { PlantCareCard, PlantCareSummary } from '@/components/app/care-calendar/PlantCareCard';
import { CareTask } from '@/types/care-calendar.types';

export default function CareCalendarPage() {
  const { data: session } = useSession();
  const [todaysCarePlants, setTodaysCarePlants] = useState<PlantCareSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCareTasks = useCallback(async () => {
    if (!session?.supabaseAccessToken || !session?.user?.id) {
      setError("User session not found. Please log in.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const supabase = createSupabaseClient(session.supabaseAccessToken);

    try {
      const { data, error: fetchError } = await supabase
        .from("care_task")
        .select(`*, listing:listing_id (species, images)`)
        .eq("user_id", session.user.id)
        .order("due_date", { ascending: true });

      if (fetchError) throw fetchError;

      const formattedTasks: CareTask[] = data.map((task: any) => ({
        ...task,
        listing: task.listing,
      }));

      // Group tasks by plant, but only for those due today or overdue
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      
      const plants: { [key: string]: PlantCareSummary } = {};

      formattedTasks.forEach(task => {
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);

        // Include only tasks that are not completed and are due today or in the past.
        if (!task.completed && dueDate <= today) {
          const listingId = task.listing_id;
          if (!plants[listingId]) {
            plants[listingId] = {
              listingId: listingId,
              species: task.listing?.species || 'Unknown Plant',
              imageUrl: task.listing?.images?.[0],
              tasks: [],
            };
          }
          plants[listingId].tasks.push(task);
        }
      });
      
      setTodaysCarePlants(Object.values(plants));

    } catch (e: any) {
      setError(`Failed to load care tasks: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchCareTasks();
    }
  }, [session, fetchCareTasks]);

  if (!session && !isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>Please log in to view your care calendar.</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Today's Care...</p>
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
          Today's Care
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A focused view of plants that need your attention today.
        </p>
      </header>

      {todaysCarePlants.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {todaysCarePlants.map((plantSummary) => (
            <PlantCareCard key={plantSummary.listingId} plantSummary={plantSummary} />
          ))}
        </div>
      ) : (
         <div className="text-center py-16 border-2 border-dashed rounded-lg flex flex-col items-center">
            <Leaf className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-medium text-foreground mt-4">All Caught Up!</h3>
            <p className="text-muted-foreground mt-2">
              None of your plants need immediate attention.
            </p>
        </div>
      )}
    </div>
  );
} 