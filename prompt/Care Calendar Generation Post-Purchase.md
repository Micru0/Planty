We are building a next js project based on an existing next js template that have auth, payment built already, below are rules you have to follow:

<frontend rules>
1. MUST Use 'use client' directive for client-side components; In Next.js, page components are server components by default, and React hooks like useEffect can only be used in client components.
2. The UI has to look great, using polished component from shadcn, tailwind when possible; Don't recreate shadcn components, make sure you use 'shadcn@latest add xxx' CLI to add components
3. MUST adding debugging log & comment for every single feature we implement
4. Make sure to concatenate strings correctly using backslash
7. Use stock photos from picsum.photos where appropriate, only valid URLs you know exist
8. Don't update shadcn components unless otherwise specified
9. Configure next.config.js image remotePatterns to enable stock photos from picsum.photos
11. MUST implement the navigation elements items in their rightful place i.e. Left sidebar, Top header
12. Accurately implement necessary grid layouts
13. Follow proper import practices:
   - Use @/ path aliases
   - Keep component imports organized
   - Update current src/app/page.tsx with new comprehensive code
   - Don't forget root route (page.tsx) handling
   - You MUST complete the entire prompt before stopping
</frontend rules>

<styling_requirements>
- You ALWAYS tries to use the shadcn/ui library.
- You MUST USE the builtin Tailwind CSS variable based colors as used in the examples, like bg-primary or text-primary-foreground.
- You DOES NOT use indigo or blue colors unless specified in the prompt.
- You MUST generate responsive designs.
- The React Code Block is rendered on top of a white background. If v0 needs to use a different background color, it uses a wrapper element with a background color Tailwind class.
</styling_requirements>

<frameworks_and_libraries>
- You prefers Lucide React for icons, and shadcn/ui for components.
- You MAY use other third-party libraries if necessary or requested by the user.
- You imports the shadcn/ui components from "@/components/ui"
- You DOES NOT use fetch or make other network requests in the code.
- You DOES NOT use dynamic imports or lazy loading for components or libraries. Ex: const Confetti = dynamic(...) is NOT allowed. Use import Confetti from 'react-confetti' instead.
- Prefer using native Web APIs and browser features when possible. For example, use the Intersection Observer API for scroll-based animations or lazy loading.
</frameworks_and_libraries>

# Care Calendar Generation Post-Purchase Implementation Guide

## Task
Implement a Care Calendar feature that auto-generates a personalized care schedule for buyers after they complete a purchase.

## Implementation Guide

### 1. Set Up the Care Calendar Page

- **File Location**: `app/app/care-calendar/page.tsx`
- **Objective**: Create a page to display the care calendar for users who have completed a purchase.

#### Steps:

1. **Create the Page Component**:
   - Use the `shadcn/ui` components to build a responsive calendar or list view.
   - Import necessary components from `@/components/ui`.

2. **Design the UI**:
   - Use a calendar or list view to display care tasks.
   - Each task should include:
     - Care instruction
     - Due date
     - A "mark as done" checkbox
   - Use Tailwind CSS classes like `bg-primary` and `text-primary-foreground` for styling.

3. **Responsive Design**:
   - Ensure the layout is mobile-first using Tailwind's responsive classes.
   - Consider using a modal or bottom sheet for task details on smaller screens.

### 2. Integrate with Purchase Confirmation

- **Objective**: Automatically generate a care calendar once a purchase is confirmed.

#### Steps:

1. **Modify the Checkout Flow**:
   - After a successful purchase, trigger the care calendar generation.
   - Use the existing Stripe integration to detect purchase completion.

2. **Generate Care Tasks**:
   - Create care tasks based on the purchased plant's needs.
   - Use a predefined set of care instructions or integrate with an AI service for dynamic generation.

3. **Persist Care Tasks**:
   - Save the generated care tasks to the `care_task` table in Supabase.
   - Use the `createSupabaseAdminClient` from `utils/supabase/server.ts` to bypass RLS and save tasks.

### 3. Implement Care Calendar State Management

- **Objective**: Manage the state of care tasks within the application.

#### Steps:

1. **Define State Interfaces**:
   - Use the following TypeScript interfaces for state management:

   ```typescript
   export interface CareTask {
     id: string;
     task: string;
     dueDate: Date;
     completed: boolean;
   }

   export interface CareCalendarState {
     tasks: CareTask[];
     // Actions:
     markTaskCompleted: (taskId: string) => void;
     setTasks: (tasks: CareTask[]) => void;
   }
   ```

2. **Implement State Management**:
   - Use `useState` or `useReducer` to manage the care tasks state.
   - Implement actions to mark tasks as completed and to set the initial list of tasks.

### 4. Notification Setup

- **Objective**: Provide reminders for upcoming care tasks.

#### Steps:

1. **Implement Notifications**:
   - Use browser notifications or in-app alerts to remind users of upcoming tasks.
   - Set up a test notification system to ensure reminders are working.

2. **Notification Timing**:
   - Schedule notifications based on the due date of each task.
   - Consider using a library like `date-fns` for date manipulation.

### 5. Debug Logging

- **Objective**: Add detailed debug logs to track the care calendar generation and task completion.

#### Steps:

1. **Log Care Task Generation**:
   - Log the details of each generated care task, including task description and due date.

2. **Log Task Completion**:
   - Log when a user marks a task as completed, including the task ID and timestamp.

3. **Error Handling**:
   - Log any errors encountered during task generation or state updates.

### 6. Connect to Supabase

- **Objective**: Ensure seamless integration with Supabase for data persistence.

#### Steps:

1. **Set Up Supabase Client**:
   - Use the `createSupabaseAdminClient` for server-side operations.
   - Ensure environment variables for Supabase are correctly set in `.env.local`.

2. **Database Operations**:
   - Use the Supabase client to insert and update care tasks in the `care_task` table.
   - Handle any database errors gracefully and log them for debugging.

By following these steps, you will implement a fully functional Care Calendar feature that enhances the post-purchase experience for users by providing personalized plant care reminders.