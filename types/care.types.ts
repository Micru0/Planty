export interface CareTask {
  id: string; // Corresponds to the UUID from Supabase
  user_id: string;
  listing_id: string;
  task_description: string;
  due_date: string; // Using string to represent TIMESTAMPTZ, can be parsed to Date object in frontend
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CareCalendarState {
  tasks: CareTask[];
  isLoading: boolean;
  error: string | null;
  // Actions - these will be part of the store, not directly in the state type
  // markTaskCompleted: (taskId: string) => void;
  // setTasks: (tasks: CareTask[]) => void;
  // fetchTasks: (userId: string) => Promise<void>;
}

// Interface for data coming from Supabase, joining care_task with listing
export interface CareTaskWithListingDetails extends CareTask {
  listing_name: string; // e.g., plant species or common name from listing table
  listing_image_url?: string; // from listing table
} 