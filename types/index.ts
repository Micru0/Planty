export interface Filters {
  lightLevel?: string;
  size?: string;
  wateringFrequency?: string;
  [key: string]: string | undefined; // Allow other string keys
}

export interface Product {
  id: string; // Changed from number to string (UUID)
  // name: string; // Removed, use species as the primary identifier/name
  // description?: string; // Removed: Not in DB 'listing' table. Use care_details or species for display.
  lightLevel?: string; // For filtering - will need to add to DB 'listing' table
  size?: string; // For filtering - will need to add to DB 'listing' table
  wateringFrequency?: string; // For filtering - will need to add to DB 'listing' table
  species: string; // From listing table
  price: number; // From listing table
  images: string[]; // From listing table
  care_details: string; // From listing table
  tags: string[] | null; // From listing table
  user_id: string; // Added from listing table, might be useful
  created_at: string; // Added from listing table
  updated_at: string; // Added from listing table
} 