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

# Seller Listing & Publishing Flow Implementation Guide

## Task
Implement a multi-step seller listing and publishing flow that allows sellers to upload plant photos, receive AI-generated suggestions, edit details, preview listings, and publish them.

## Implementation Guide

### Step 1: Photo Upload with AI Detection

1. **Create the Upload Page**
   - File: `app/app/seller/upload/page.tsx`
   - Use the `PhotoUpload` component from `components/app/PhotoUpload.tsx`.
   - Ensure the page is styled using Tailwind CSS classes like `bg-primary` and `text-primary-foreground`.

2. **Build the PhotoUpload Component**
   - File: `components/app/PhotoUpload.tsx`
   - Use `shadcn/ui` file input elements for image uploads.
   - Integrate an image recognition library to simulate AI analysis.
   - Display a loading spinner from `shadcn/ui` while processing the image.
   - Show detection results including species, care suggestions, and pricing suggestions with confidence ratings.
   - Allow fields to be editable.

3. **State Management**
   - Define a state to hold the uploaded image and AI results.
   - Example:
     ```typescript
     const [uploadedImage, setUploadedImage] = useState<File | null>(null);
     const [aiResults, setAiResults] = useState<{
       species: string;
       careNeeds: string;
       suggestedPrice: number;
       confidence: number;
     } | null>(null);
     ```

4. **Debug Logging**
   - Log the image upload and AI processing steps.
   - Example:
     ```typescript
     console.log("Image uploaded:", uploadedImage);
     console.log("AI results:", aiResults);
     ```

### Step 2: Edit and Adjust AI-Provided Details

1. **Create the ListingWizard Component**
   - File: `components/app/ListingWizard.tsx`
   - Use a card-based UI with `shadcn/ui` components to display AI suggestions and allow edits.
   - Include form controls for species, price, and care details.

2. **State Management**
   - Define a state to hold the current listing details.
   - Example:
     ```typescript
     const [listingDetails, setListingDetails] = useState({
       species: aiResults?.species || '',
       price: aiResults?.suggestedPrice || 0,
       careDetails: aiResults?.careNeeds || '',
     });
     ```

3. **Debug Logging**
   - Log any changes made to the listing details.
   - Example:
     ```typescript
     console.log("Listing details updated:", listingDetails);
     ```

### Step 3: Preview Listing with Comparisons

1. **Create the Preview Step**
   - Integrate a side-by-side view comparing the new listing with similar market products.
   - Use static placeholder data or integrate with another component for suggestions.

2. **UI Details**
   - Display plant image, AI suggestions, editable fields, and smart tags.
   - Use `shadcn/ui` buttons styled with `bg-primary` for navigation.

3. **Debug Logging**
   - Log the preview data and any user interactions.
   - Example:
     ```typescript
     console.log("Preview data:", listingDetails);
     ```

### Step 4: Publish the Listing

1. **Integrate with Supabase**
   - Use the existing Supabase utilities to write to the `user_listings` table.
   - File: `utils/supabase/server.ts`
   - Example:
     ```typescript
     const supabase = await createSupabaseAdminClient();
     const { data, error } = await supabase.from('listing').insert({
       images: [uploadedImageUrl],
       species: listingDetails.species,
       price: listingDetails.price,
       care_details: listingDetails.careDetails,
       user_id: userId,
     });
     if (error) {
       console.error("Error publishing listing:", error);
     } else {
       console.log("Listing published:", data);
     }
     ```

2. **UI Details**
   - Use a wizard-style progress indicator at the top of the flow.
   - Include "Next", "Back", and "Publish" buttons using `shadcn/ui`.

3. **Debug Logging**
   - Log the publishing process and any errors.
   - Example:
     ```typescript
     console.log("Publishing listing...");
     ```

### Additional Considerations

- Ensure all UI components use `shadcn/ui` and Tailwind classes for styling.
- Implement responsive design using Tailwind's mobile-first approach.
- Maintain a consistent visual language across all steps of the flow.

By following these steps, you will create a seamless seller listing and publishing flow that leverages AI for plant recognition and provides a user-friendly interface for sellers to manage their listings.