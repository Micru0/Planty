'use client';

import { useOptimistic, useTransition } from 'react';
import { CareTask } from '@/types/care-calendar.types';
import { updateTaskCompletion } from '@/app/actions/care-tasks';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface TaskCardProps {
  task: CareTask;
}

export function TaskCard({ task }: TaskCardProps) {
  const [optimisticTask, setOptimisticTask] = useOptimistic(
    task,
    (state, completed: boolean) => ({ ...state, completed })
  );
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const getStatus = (): { text: 'Completed' | 'Overdue' | 'Pending'; variant: 'default' | 'destructive' | 'secondary'; } => {
    if (optimisticTask.completed) {
      return { text: 'Completed', variant: 'default' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(optimisticTask.due_date);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      return { text: 'Overdue', variant: 'destructive' };
    }
    return { text: 'Pending', variant: 'secondary' };
  };

  const status = getStatus();

  const handleCheckedChange = (checked: boolean) => {
    startTransition(async () => {
      setOptimisticTask(checked);
      const result = await updateTaskCompletion(optimisticTask.id, checked);
      if (result?.error) {
        toast({
            title: 'Error updating task',
            description: result.error,
            variant: 'destructive',
        });
      }
    });
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const description = optimisticTask.task_description;
  const isLongDescription = description.length > 100;
  const displayedDescription = isLongDescription && !isExpanded
    ? `${description.substring(0, 100)}...`
    : description;

  return (
    <Card className={cn('w-full transition-opacity', optimisticTask.completed && 'opacity-50')}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{task.listing?.species || 'Plant Task'}</CardTitle>
            <CardDescription className="flex items-center pt-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Due: {new Date(task.due_date).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge variant={status.variant}>{status.text}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground">{displayedDescription}</p>
        {isLongDescription && (
            <Button variant="link" onClick={() => setIsExpanded(!isExpanded)} className="px-0 h-auto mt-2">
                {isExpanded ? 'Show Less' : 'Show More'}
            </Button>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex items-center space-x-2">
            <Checkbox
                id={`task-${optimisticTask.id}`}
                checked={optimisticTask.completed ?? false}
                onCheckedChange={(c) => handleCheckedChange(c as boolean)}
                disabled={isPending}
                aria-label={`Mark task as ${optimisticTask.completed ? 'incomplete' : 'complete'}`}
            />
            <label
                htmlFor={`task-${optimisticTask.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                {optimisticTask.completed ? 'Completed' : 'Mark as Complete'}
            </label>
        </div>
      </CardFooter>
    </Card>
  );
} 