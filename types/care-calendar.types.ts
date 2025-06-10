export interface CareTask {
  id: string; // Assuming care_task.id is a uuid or string
  user_id: string; // Foreign key to next_auth.users
  listing_id: string; // Foreign key to listing
  title: string;
  task_description: string;
  due_date: string; // Supabase timestampz will be string by default
  completed: boolean | null;
  created_at: string | null;
  completed_at?: string | null;
  updated_at?: string | null;
  // Joined from listings table
  listing?: {
    species: string;
    images?: string[];
  };
} 