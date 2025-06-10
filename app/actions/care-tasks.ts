'use server';

import { createSupabaseAdminClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateTaskCompletion(taskId: string, completed: boolean) {
  const supabase = await createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('care_task')
    .update({ completed: completed, completed_at: completed ? new Date().toISOString() : null })
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Error updating task completion:', error);
    return { error: 'Failed to update task.' };
  }

  // Revalidate the care calendar page to show the updated status
  revalidatePath('/app/care-calendar');

  return { data };
} 