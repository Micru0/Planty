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

# Implement Dynamic Filters & Product Discovery Enhancements

## Task
Implement a dynamic filtering system for product discovery, allowing users to filter plants by parameters such as light level, size, and watering frequency. Additionally, provide personalized recommendations based on past interactions.

## Implementation Guide

### 1. Create the Filters Panel Component

**File Location:** `components/app/FiltersPanel.tsx`

#### Steps:
1. **Set Up the Component:**
   - Use `shadcn/ui` components for the UI elements like checkboxes, sliders, and dropdowns.
   - Import necessary components from `@/components/ui`.

2. **Define Filter Options:**
   - Create filter options for light level, size, and watering frequency.
   - Use Tailwind CSS classes for styling, ensuring responsiveness.

3. **Implement State Management:**
   - Use `useState` or `useReducer` to manage the filter state locally within the component.
   - Define a `Filters` interface to type the filter state.

4. **Render the Filters:**
   - Use a collapsible sidebar for desktop and a modal for mobile to display filters.
   - Include a "Clear All" button to reset filters.

5. **Add Animations:**
   - Use CSS transitions for smooth opening and closing of the filter panel.

#### Example Code:
```typescript
import React, { useState } from 'react';
import { Checkbox, Slider, Dropdown } from '@/components/ui';
import { Filters } from '@/types';

const FiltersPanel: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({});

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className="bg-primary p-4 rounded-lg shadow-lg">
      <h2 className="text-primary-foreground">Filter Plants</h2>
      <div className="mt-4">
        <Checkbox
          label="Light Level"
          options={['Low', 'Medium', 'High']}
          onChange={(value) => handleFilterChange('lightLevel', value)}
        />
        <Slider
          label="Size"
          min={1}
          max={3}
          onChange={(value) => handleFilterChange('size', value.toString())}
        />
        <Dropdown
          label="Watering Frequency"
          options={['Daily', 'Weekly', 'Monthly']}
          onChange={(value) => handleFilterChange('wateringFrequency', value)}
        />
      </div>
      <button className="mt-4 bg-primary text-primary-foreground" onClick={clearFilters}>
        Clear All
      </button>
    </div>
  );
};

export default FiltersPanel;
```

### 2. Integrate Filters with Product Listings

**File Location:** `app/app/listings/page.tsx`

#### Steps:
1. **Import the Filters Panel:**
   - Import `FiltersPanel` from `components/app/FiltersPanel`.

2. **Manage Filtered Product State:**
   - Use `useState` to manage the list of products and the filtered results.
   - Fetch the initial product list from Supabase using the server-side client.

3. **Apply Filters:**
   - Filter the product list based on the selected filter criteria.
   - Update the displayed products in real-time as filters change.

4. **Render the Product List:**
   - Use a grid or list layout to display the filtered products.
   - Ensure the layout is responsive using Tailwind CSS classes.

#### Example Code:
```typescript
import React, { useState, useEffect } from 'react';
import { FiltersPanel } from '@/components/app/FiltersPanel';
import { createSupabaseClient } from '@/utils/supabase/client';
import { Product } from '@/types';

const ListingsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = await createSupabaseClient();
      const { data, error } = await supabase.from('products').select();
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data);
        setFilteredProducts(data);
      }
    };

    fetchProducts();
  }, []);

  const applyFilters = (filters: Filters) => {
    const filtered = products.filter((product) => {
      return (
        (!filters.lightLevel || product.lightLevel === filters.lightLevel) &&
        (!filters.size || product.size === filters.size) &&
        (!filters.wateringFrequency || product.wateringFrequency === filters.wateringFrequency)
      );
    });
    setFilteredProducts(filtered);
  };

  return (
    <div className="p-4">
      <FiltersPanel onChange={applyFilters} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold">{product.name}</h3>
            <p>{product.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListingsPage;
```

### 3. Persist User Preferences

**File Location:** `utils/supabase/user.ts`

#### Steps:
1. **Update User Preferences:**
   - Use Supabase to persist user filter preferences in the `search_preference` table.
   - Create a function to save preferences when filters are applied.

2. **Fetch Preferences on Load:**
   - Retrieve user preferences on page load and apply them to the filter state.

#### Example Code:
```typescript
import { createSupabaseClient } from '@/utils/supabase/client';
import { Filters } from '@/types';

export const saveUserPreferences = async (filters: Filters) => {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.from('search_preference').upsert(filters);
  if (error) {
    console.error('Error saving preferences:', error);
  }
};

export const fetchUserPreferences = async (): Promise<Filters> => {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.from('search_preference').select().single();
  if (error) {
    console.error('Error fetching preferences:', error);
    return {};
  }
  return data;
};
```

### 4. Debug Logging

- Add console logs at key points in the code to track the flow and state changes.
- Log filter changes, product fetch results, and any errors encountered.

### Example Debug Logs:
```typescript
console.log('Filters applied:', filters);
console.log('Fetched products:', products);
console.error('Error fetching products:', error);
```

### Summary

- Implemented a dynamic filtering system using `shadcn/ui` components and Tailwind CSS for styling.
- Integrated filters with the product listing page, allowing real-time updates.
- Persisted user preferences using Supabase, enhancing the personalized experience.
- Added debug logs for easier tracking and troubleshooting.