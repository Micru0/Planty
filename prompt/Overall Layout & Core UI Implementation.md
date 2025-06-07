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

# Overall Layout & Core UI Implementation Guide

## Task
Implement the overall layout and core UI for the Planty application.

## Implementation Guide

### 1. Update the Header Component

- **File Location**: `components/app/Header.tsx`
- **Objective**: Adjust the styling to match Planty’s visual language.

#### Steps:
1. **Import Required Libraries**:
   - Ensure you are using `shadcn/ui` components and `Lucide React` for icons.
   - Use Tailwind CSS classes for styling.

2. **Modify Header Styling**:
   - Set the header background using `bg-primary`.
   - Use `text-primary-foreground` for text color.
   - Ensure appropriate spacing and alignment for elements.

3. **Add Navigation Links**:
   - Include links for "Chat", "Listings", and "Cart".
   - Use `shadcn/ui` components for buttons or links.
   - Ensure links are responsive and accessible.

4. **Responsive Design**:
   - Use Tailwind CSS responsive classes to ensure the header adapts to different screen sizes.
   - Implement a mobile-first approach.

5. **Debug Logging**:
   - Add console logs to track navigation link clicks for debugging purposes.
   - Example: `console.log('Navigating to Chat')`.

### 2. Implement Overall Page Layout

- **File Location**: `app/app/page.tsx`
- **Objective**: Create a clean, responsive, and well-organized application layout.

#### Steps:
1. **Set Up Main Layout Structure**:
   - Use a main container to hold dynamic components.
   - Ensure the layout is flexible to accommodate future components like chat, listings, etc.

2. **Define Navigation Scheme**:
   - Implement a top navigation bar for desktop using `shadcn/ui` components.
   - For mobile, consider a bottom navigation or floating action button (FAB).

3. **Responsive Design**:
   - Use Tailwind CSS classes to define breakpoints.
   - Ensure the layout is mobile-first and expands to larger screens.

4. **Global Theme State**:
   - If needed, set up a global theme state using React Context.
   - Example: `const ThemeContext = React.createContext();`

5. **Debug Logging**:
   - Add logs to track layout rendering and component mounting.
   - Example: `console.log('Main layout rendered')`.

### 3. Define State & Data Points

- **Global Theme State**:
  - Use React Context or a state management library to manage theme state.
  - Example: `const [theme, setTheme] = useState('light');`

- **Navigation State**:
  - Track the active link for navigation highlighting.
  - Example: `const [activeLink, setActiveLink] = useState('home');`

### 4. Testing & Verification

- **Verify Header**:
  - Ensure the header displays correctly on all screen sizes.
  - Check that navigation links are functional and log clicks.

- **Verify Layout**:
  - Confirm the main layout adapts to different screen sizes.
  - Ensure dynamic components can be rendered within the main container.

### Additional Considerations

- **UI Consistency**:
  - Maintain consistent styling across all components using Tailwind CSS variables.
  - Ensure all UI elements are accessible and responsive.

- **Future Expansion**:
  - Design the layout to easily accommodate future components and features.
  - Keep the code modular and maintainable for future updates.

By following this guide, you will create a foundational layout for the Planty application that is both visually appealing and functionally robust, setting the stage for further feature development.