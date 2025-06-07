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

# Implementation Guide: Basic Cart & Checkout Flow for Buyers

## Task Overview
Implement a cart and checkout flow for buyers, allowing them to add plants to their cart and proceed with a secure checkout process using the existing Stripe integration.

## Implementation Steps

### 1. Cart Component Setup

**Objective:** Create a cart component that displays added products and integrates with the existing Stripe CheckoutButton.

#### Steps:

1. **Create Cart Page:**
   - File: `app/app/cart/page.tsx`
   - Purpose: Render the cart component and integrate it with the Stripe checkout process.

2. **Design Cart Layout:**
   - Use a card/grid layout to display each cart item with the following details:
     - Plant image
     - Name
     - Price
     - Quantity controls (increment/decrement buttons)
   - Use `shadcn/ui` components and Tailwind CSS classes for styling:
     - Example: Use `bg-primary` for the cart background and `text-primary-foreground` for text.

3. **Implement Cart State Management:**
   - Define a `CartState` interface in a new file, e.g., `types/cart.types.ts`:
     ```typescript
     export interface CartItem {
       id: string;
       productId: string;
       quantity: number;
       price: number;
     }

     export interface CartState {
       items: CartItem[];
       addItem: (item: CartItem) => void;
       removeItem: (itemId: string) => void;
       updateItemQuantity: (itemId: string, quantity: number) => void;
       clearCart: () => void;
     }
     ```
   - Use React's `useState` or `useReducer` to manage cart state within the cart component.

4. **Add Cart Functionality:**
   - Implement functions to add, remove, and update cart items.
   - Ensure the cart state updates correctly when users interact with quantity controls.

### 2. Integrate Stripe Checkout

**Objective:** Use the existing Stripe integration to handle the checkout process.

#### Steps:

1. **Add Checkout Button:**
   - Use the existing `CheckoutButton` component from `components/CheckoutButton.tsx`.
   - Place the button prominently on the cart page, styled with `shadcn/ui` components.

2. **Configure Checkout Process:**
   - Ensure the `CheckoutButton` is configured to handle the cart's total amount and items.
   - Use the existing Stripe utilities in `utils/stripe.ts` to manage payment processing.

3. **Handle Checkout Success:**
   - Redirect users to a success page upon successful payment.
   - Use the existing success pages in `app/success/` for post-payment confirmation.

### 3. Implement "Save for Later" Feature

**Objective:** Allow users to save items for later purchase.

#### Steps:

1. **Create Favorites Table:**
   - Ensure the `favorite` table exists in the database schema:
     ```sql
     create table favorite (
       id integer generated always as identity primary key,
       product_id uuid not null,
       user_id uuid not null default next_auth.uid()
     );
     ```

2. **Add "Save for Later" Button:**
   - Add a button next to each cart item to save it for later.
   - Use `shadcn/ui` components for the button, styled with Tailwind CSS classes.

3. **Persist Favorites:**
   - Use Supabase utilities to persist favorite items:
     ```typescript
     import { createSupabaseClient } from '@/utils/supabase/client';

     async function saveForLater(productId: string) {
       const supabase = await createSupabaseClient();
       const { error } = await supabase.from('favorite').insert({ product_id: productId });
       if (error) {
         console.error('Error saving for later:', error);
       }
     }
     ```

### 4. Responsive Design

**Objective:** Ensure the cart and checkout flow are mobile-friendly.

#### Steps:

1. **Responsive Layout:**
   - Use Tailwind CSS responsive classes to adjust the layout for different screen sizes.
   - Example: Use `flex-col` for mobile and `flex-row` for desktop views.

2. **Mobile Cart Summary:**
   - Implement a bottom sheet or modal for the cart summary on mobile devices.
   - Ensure the checkout button is easily accessible on smaller screens.

### Debug Logging

**Objective:** Add detailed debug logs to track user actions and system events.

#### Steps:

1. **Log Cart Actions:**
   - Add console logs for cart actions (add, remove, update) to track user interactions.
   - Example:
     ```typescript
     console.log(`Added item to cart: ${item.productId}`);
     ```

2. **Log Checkout Events:**
   - Log checkout initiation and completion events for monitoring.
   - Example:
     ```typescript
     console.log('Checkout initiated for cart total:', cartTotal);
     ```

By following these steps, you will implement a functional and user-friendly cart and checkout flow for Planty, leveraging existing Stripe integration and ensuring a seamless user experience.