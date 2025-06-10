'use client';

import { useState, useEffect, useCallback, useTransition, useOptimistic } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { createSupabaseClient } from '@/utils/supabase/client';
import { updateTaskCompletion } from '@/app/actions/care-tasks';

import { CareTask } from '@/types/care-calendar.types';
import { Loader2, ArrowLeft, CheckCircle, Info, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';


// We need a more detailed listing type for this page
type ListingDetails = {
  id: string;
  species: string;
  images?: string[];
  care_tips?: string[] | null;
};

export default function PlantActionPage() {
  const { listingId } = useParams();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [optimisticTasks, setOptimisticTask] = useOptimistic(
    tasks,
    (state, { taskId, completed }: { taskId: string, completed: boolean }) => {
      return state.map(task => task.id === taskId ? { ...task, completed } : task);
    }
  );

  const handleCompleteTask = (taskId: string, currentStatus: boolean | null) => {
    startTransition(async () => {
      const newStatus = !currentStatus;
      setOptimisticTask({ taskId, completed: newStatus });
      const result = await updateTaskCompletion(taskId, newStatus);
      if (result?.error) {
        toast({
          title: "Error",
          description: "Failed to update task. Please try again.",
          variant: "destructive"
        });
        // Revert optimistic update on failure
        setOptimisticTask({ taskId, completed: currentStatus ?? false });
      }
    });
  };

  const fetchData = useCallback(async () => {
    if (!session?.supabaseAccessToken || typeof listingId !== 'string') {
      return;
    }
    
    setIsLoading(true);
    const supabase = createSupabaseClient(session.supabaseAccessToken);

    try {
      const [listingRes, tasksRes] = await Promise.all([
        supabase.from('listing').select('id, species, images, care_tips').eq('id', listingId).single(),
        supabase.from('care_task').select('*').eq('listing_id', listingId).order('due_date', { ascending: true })
      ]);

      if (listingRes.error) throw new Error(`Failed to fetch plant details: ${listingRes.error.message}`);
      if (tasksRes.error) throw new Error(`Failed to fetch care tasks: ${tasksRes.error.message}`);

      setListing(listingRes.data);
      setTasks(tasksRes.data as CareTask[]);

    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [session, listingId]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, fetchData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }
  
  if (!listing) {
    return <div className="text-center py-10">Plant not found.</div>;
  }
  
  const upcomingTasks = optimisticTasks.filter(t => !t.completed);
  const primaryTask = upcomingTasks.length > 0 ? upcomingTasks[0] : null;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Toaster />
      <Link href="/app/care-calendar" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Today's Care
      </Link>
      
      <div className="relative h-48 w-full rounded-lg overflow-hidden mb-6">
        <Image 
            src={listing.images?.[0] || 'https://picsum.photos/seed/plant/800/200'}
            alt={listing.species}
            fill
            className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <h1 className="absolute bottom-4 left-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">{listing.species}</h1>
      </div>


      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Primary Action</CardTitle>
                <CardDescription>The most urgent task for your plant.</CardDescription>
              </CardHeader>
              <CardContent>
                {primaryTask ? (
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold">{primaryTask.title}</p>
                        <p className="text-sm text-muted-foreground">Due: {new Date(primaryTask.due_date).toLocaleDateString()}</p>
                    </div>
                    <Button size="lg" onClick={() => handleCompleteTask(primaryTask.id, primaryTask.completed)} disabled={isPending}>
                        <Check className="h-5 w-5 mr-2" />
                        Mark as Done
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center text-muted-foreground">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    <p>No upcoming actions for this plant. All caught up!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>All Tasks</CardTitle>
                    <CardDescription>The complete care schedule for your {listing.species}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {optimisticTasks.map(task => (
                            <div key={task.id} className={cn("p-3 border rounded-lg flex justify-between items-center", task.completed && "bg-muted/50 opacity-70")}>
                                <div>
                                    <p className={cn("font-medium", task.completed ? 'line-through text-muted-foreground' : '')}>{task.title}</p>
                                    <p className="text-sm text-muted-foreground">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                                </div>
                                <Checkbox
                                    checked={!!task.completed}
                                    onCheckedChange={() => handleCompleteTask(task.id, task.completed)}
                                    disabled={isPending}
                                    aria-label="Mark task as complete"
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Care Tips</CardTitle>
                <CardDescription>General advice for a happy plant.</CardDescription>
              </CardHeader>
              <CardContent>
                {listing.care_tips && listing.care_tips.length > 0 ? (
                  <ul className="space-y-3">
                    {listing.care_tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Info className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific care tips available for this plant.</p>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
} 