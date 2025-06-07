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

# Seller Photo Upload & AI Plant Recognition Component Implementation Guide

## Task
Implement a Seller Photo Upload & AI Plant Recognition Component to allow sellers to upload plant photos, automatically detect species, care needs, and suggested pricing.

## Implementation Guide

### 1. Set Up the Photo Upload Component

- **File Location**: Create a new file `PhotoUpload.tsx` in `components/app/`.

- **Component Structure**:
  - Use `shadcn/ui` components for the file input and display.
  - Implement a drag-and-drop area or a click-to-select button for file uploads.
  - Ensure the component supports multiple image uploads if needed.

- **Styling**:
  - Use Tailwind CSS classes for styling, ensuring responsiveness.
  - Example classes: `bg-primary` for background, `text-primary-foreground` for text.

- **Example Code**:
  ```typescript
  import { useState } from 'react';
  import { FileInput } from '@/components/ui';
  import { LucideIcon } from 'lucide-react';

  const PhotoUpload = () => {
    const [images, setImages] = useState<File[]>([]);

    const handleFileChange = (files: FileList) => {
      setImages(Array.from(files));
      console.log('Files uploaded:', files);
    };

    return (
      <div className="p-4 bg-primary text-primary-foreground">
        <FileInput onChange={(e) => handleFileChange(e.target.files)} multiple>
          <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer">
            <LucideIcon name="upload" className="mr-2" />
            <span>Upload Plant Photos</span>
          </div>
        </FileInput>
      </div>
    );
  };

  export default PhotoUpload;
  ```

### 2. Integrate AI Image Recognition

- **File Location**: Create a utility file `ai.ts` in `lib/`.

- **AI Simulation**:
  - Use a real image recognition library or simulate AI analysis.
  - Display a loading indicator while processing the image.

- **Example Code**:
  ```typescript
  import { useState } from 'react';
  import { Spinner } from '@/components/ui';

  const simulateAIRecognition = async (image: File) => {
    console.log('Processing image:', image.name);
    // Simulate a delay for AI processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          species: 'Ficus Elastica',
          careNeeds: 'Moderate watering, indirect sunlight',
          suggestedPrice: 25.99,
          confidence: 0.95,
        });
      }, 2000);
    });
  };

  const PhotoUpload = () => {
    const [loading, setLoading] = useState(false);
    const [aiResults, setAiResults] = useState(null);

    const handleFileChange = async (files: FileList) => {
      setLoading(true);
      const results = await simulateAIRecognition(files[0]);
      setAiResults(results);
      setLoading(false);
    };

    return (
      <div className="p-4 bg-primary text-primary-foreground">
        <FileInput onChange={(e) => handleFileChange(e.target.files)} multiple>
          <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer">
            <LucideIcon name="upload" className="mr-2" />
            <span>Upload Plant Photos</span>
          </div>
        </FileInput>
        {loading && <Spinner />}
        {aiResults && (
          <div className="mt-4">
            <h3>AI Results:</h3>
            <p>Species: {aiResults.species}</p>
            <p>Care Needs: {aiResults.careNeeds}</p>
            <p>Suggested Price: ${aiResults.suggestedPrice}</p>
            <p>Confidence: {aiResults.confidence * 100}%</p>
          </div>
        )}
      </div>
    );
  };

  export default PhotoUpload;
  ```

### 3. Display AI Detection Results

- **UI Elements**:
  - Use card-based UI to display the AI detection results.
  - Allow fields to be editable for user corrections.

- **Styling**:
  - Use Tailwind CSS classes for consistent styling.
  - Example classes: `bg-primary`, `text-primary-foreground`.

- **Example Code**:
  ```typescript
  import { Card, Input } from '@/components/ui';

  const PhotoUpload = () => {
    // ... previous code

    return (
      <div className="p-4 bg-primary text-primary-foreground">
        {/* ... previous code */}
        {aiResults && (
          <Card className="mt-4 p-4">
            <h3>AI Results:</h3>
            <div className="flex flex-col space-y-2">
              <div>
                <label>Species:</label>
                <Input value={aiResults.species} />
              </div>
              <div>
                <label>Care Needs:</label>
                <Input value={aiResults.careNeeds} />
              </div>
              <div>
                <label>Suggested Price:</label>
                <Input type="number" value={aiResults.suggestedPrice} />
              </div>
              <div>
                <label>Confidence:</label>
                <span>{aiResults.confidence * 100}%</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  };

  export default PhotoUpload;
  ```

### 4. State Management

- **State Variables**:
  - `images`: Array of uploaded image files.
  - `loading`: Boolean indicating if AI processing is in progress.
  - `aiResults`: Object containing AI detection results.

- **State Management**:
  - Use `useState` for managing component state.
  - Log state changes for debugging purposes.

### 5. Debug Logging

- **Log Points**:
  - Log file uploads and AI processing start/completion.
  - Log AI results for verification.

- **Example Logs**:
  ```typescript
  console.log('Files uploaded:', files);
  console.log('Processing image:', image.name);
  console.log('AI Results:', results);
  ```

By following these steps, you will implement a Seller Photo Upload & AI Plant Recognition Component that allows sellers to upload plant photos, automatically detect species, care needs, and suggested pricing, and display the results in an editable format.