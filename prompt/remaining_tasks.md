# Planty - Remaining Development Tasks

This document outlines the remaining tasks and areas for enhancement in the Planty application.

## 1. Chat Feature Enhancements
- **Interactive "View Details" Button**:
    - Make the "View Details (Coming Soon)" button in AI chat suggestions functional.
    - This requires linking the suggestion (e.g., `plantName` or a `productId` from AI) to the corresponding product page (`/app/app/listings/[listingId]`).
- **Advanced Response Formatting** (Optional):
    - Further enhance chat response cards if more structured data becomes available or if current UI needs refinement beyond recent updates.

## 2. Core Buyer Flow Completion
- **Checkout Process & Order Confirmation**:
    - **Stripe Elements Integration**: Ensure the frontend payment process is robust, user-friendly, and handles errors gracefully.
    - **Order Confirmation Page (`/app/success`)**: Dynamically display order details (items purchased, total, shipping info if applicable) after a successful Stripe checkout.
    - **Order Confirmation Emails**: Implement automated email notifications to users upon successful order placement.
- **Plant Care Calendar UI Enhancements**:
    - Review and refine the UI/UX of the Care Calendar page (`/app/app/care-calendar/page.tsx`).
    - Consider features like filtering tasks (by date, plant), clearer visual cues for overdue tasks, or more engaging task displays.

## 3. UI Revamp (Phase 1 - Visual Polish & Cohesion)
- **Color Palette**: Define and apply a consistent and appealing color palette across the application, moving beyond the default white/muted schemes.
- **Typography**: Standardize and refine typography (fonts, sizes, weights) for better readability and visual hierarchy.
- **Component Styling**: Improve the styling of common UI elements (Cards, Buttons, Inputs, Modals, etc.) for a more polished and professional look.
- **Global Spacing & Layout**: Ensure consistent spacing, alignment, and responsive layouts across all pages.

## 4. Seller Feature Enhancements
- **Real AI Plant Recognition**:
    - Integrate a live AI service for plant image recognition during the seller's listing creation process (`components/app/PhotoUpload.tsx`).
    - Replace the current simulated AI analysis with actual species detection, care need suggestions, etc. (Refer to `prompt/Seller Photo Upload & AI Plant Recognition Component.md`).
- **Seller Dashboard / Listing Management**:
    - Develop a dedicated interface for sellers to view, manage (edit, mark as sold, delist), and track the performance of their active listings.

## 5. Backend & Schema Maintenance
- **`public.users` Table Redundancy**:
    - Investigate if the `@auth/supabase-adapter` can be configured to use *only* the `next_auth` schema to avoid populating `public.users`.
- **Full Schema Audit (Deferred but Important)**:
    - At a suitable future point, conduct a thorough review of `prompt/0-supabase-sql.md` against the live Supabase database schema to ensure they are perfectly synchronized.
    - Document any discrepancies and update the markdown file.

## 6. Longer-Term PRD Features (Post-MVP / Future Scope)
- **Admin Dashboard**: For site administrators to manage users, listings, content, and view analytics.
- **Content Management System (CMS)**:
    - Implement features for creating and managing blog posts, plant care guides, or other informational content.
- **Ratings & Reviews System**:
    - Allow buyers to rate and review products and/or sellers.
- **Advanced User Notifications**:
    - Expand beyond basic toasts and order confirmations (e.g., shipping updates, new matching listings, community interactions if applicable). 