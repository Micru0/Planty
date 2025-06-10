import { createSupabaseClient } from './client'; // Assuming client.ts is in the same directory
import type { Session } from 'next-auth';
import type { Tables } from '@/types/database.types'; // Import Tables

/**
 * Saves a product to the user's favorites.
 * @param productId The ID of the product to save.
 * @param session The user's session, containing the supabaseAccessToken.
 * @returns A promise that resolves when the operation is complete.
 * @throws If the session is invalid or the Supabase operation fails.
 */
export async function saveProductToFavorites(
  productId: string,
  session: Session | null
): Promise<void> {
  if (!session?.supabaseAccessToken) {
    console.error('[saveProductToFavorites] No session or Supabase access token found.');
    throw new Error('User session is invalid. Please log in.');
  }
  if (!session.user?.id) {
    console.error('[saveProductToFavorites] User ID not found in session.');
    throw new Error('User ID not found. Please log in.');
  }

  console.log(`[saveProductToFavorites] Attempting to save product ID: ${productId} for user ID: ${session.user.id}`);

  const supabase = createSupabaseClient(session.supabaseAccessToken);

  const { error } = await supabase
    .from('favorite')
    .insert({ product_id: productId, user_id: session.user.id }); // user_id is automatically handled by RLS if default is set, but explicit is safer

  if (error) {
    console.error('[saveProductToFavorites] Error saving product to favorites:', error);
    throw new Error(`Failed to save product to favorites: ${error.message}`);
  }

  console.log(`[saveProductToFavorites] Product ID: ${productId} saved successfully for user ID: ${session.user.id}`);
}

// Define the shape of the listing data we expect from the join
interface FetchedListing extends Pick<Tables<'listing'>, 'id' | 'species' | 'price' | 'images' | 'care_details' | 'tags' | 'light_level' | 'size' | 'watering_frequency'> {}

// Define the shape of the favorite item with the (potentially null) joined listing
interface FavoriteWithFetchedListingNullable extends Pick<Tables<'favorite'>, 'id' | 'product_id' | 'user_id'> {
  listing: FetchedListing | null;
}

// Define the final shape after filtering out null listings
export interface FavoriteWithListing extends Pick<Tables<'favorite'>, 'id' | 'product_id' | 'user_id'> {
  listing: FetchedListing;
}

/**
 * Fetches all favorited products for the current user, along with their listing details.
 * @param session The user's session, containing the supabaseAccessToken.
 * @returns A promise that resolves to an array of favorite items with their associated listing details.
 * @throws If the session is invalid or the Supabase operation fails.
 */
export async function fetchUserFavorites(
  session: Session | null
): Promise<FavoriteWithListing[]> {
  if (!session?.supabaseAccessToken) {
    console.error('[fetchUserFavorites] No session or Supabase access token found.');
    throw new Error('User session is invalid. Please log in.');
  }
  if (!session.user?.id) {
    console.error('[fetchUserFavorites] User ID not found in session.');
    throw new Error('User ID is invalid.');
  }

  const userId = session.user.id;
  console.log(`[fetchUserFavorites] Attempting to fetch favorites for user ID: ${userId}`);
  const supabase = createSupabaseClient(session.supabaseAccessToken);

  // Using explicit foreign key join: listing!favorite_product_id_fkey(columns) or listing!inner(columns)
  // Assuming favorite.product_id is the FK to listing.id
  // The syntax is typically targetTable!fkNameOrForeignKeyColumnOnSourceTable(columns)
  // Or, if Supabase infers the relationship via product_id: product_id!inner(columns)
  // Let's try the explicit join via the `listing` table and its relation to `favorite.product_id`
  const { data, error } = await supabase
    .from('favorite')
    .select(`
      id,
      product_id,
      user_id,
      listing:listing(id, species, price, images, care_details, tags, light_level, size, watering_frequency)
    `)
    .eq('user_id', userId);
    
  // Type casting for the Supabase response before filtering
  const fetchedData = data as FavoriteWithFetchedListingNullable[] | null;

  if (error) {
    console.error('[fetchUserFavorites] Error fetching user favorites:', error);
    // Log the raw data if error for more insight
    if(fetchedData) console.error('[fetchUserFavorites] Data received on error:', JSON.stringify(fetchedData, null, 2));
    throw new Error(`Failed to fetch user favorites: ${error.message}`);
  }
  
  console.log('[fetchUserFavorites] Successfully fetched favorites:', fetchedData);
  
  if (!fetchedData) {
    return [];
  }

  // Filter out favorites where the listing is null and assert the non-null type
  const validData: FavoriteWithListing[] = fetchedData
    .filter((fav): fav is FavoriteWithListing => fav.listing !== null);
  
  return validData;
}

/**
 * Removes a product from the user's favorites.
 * @param favoriteId The ID of the favorite entry to remove (this is the ID from the 'favorite' table itself).
 * @param session The user's session, containing the supabaseAccessToken.
 * @returns A promise that resolves when the operation is complete.
 * @throws If the session is invalid or the Supabase operation fails.
 */
export async function removeProductFromFavorites(
  favoriteId: string,
  session: Session | null
): Promise<void> {
  if (!session?.supabaseAccessToken) {
    console.error('[removeProductFromFavorites] No session or Supabase access token found.');
    throw new Error('User session is invalid. Please log in.');
  }
   if (!session.user?.id) {
    console.error('[removeProductFromFavorites] User ID not found in session.');
    throw new Error('User ID not found. Please log in.');
  }

  const userId = session.user.id; // Use a non-optional variable after check

  console.log(`[removeProductFromFavorites] Attempting to remove favorite ID: ${favoriteId} for user ID: ${userId}`);
  const supabase = createSupabaseClient(session.supabaseAccessToken);

  const { error } = await supabase
    .from('favorite')
    .delete()
    .eq('id', favoriteId)
    .eq('user_id', userId);

  if (error) {
    console.error('[removeProductFromFavorites] Error removing product from favorites:', error);
    throw new Error(`Failed to remove product from favorites: ${error.message}`);
  }

  console.log(`[removeProductFromFavorites] Favorite ID: ${favoriteId} removed successfully for user ID: ${userId}`);
}

// Placeholder for fetching favorites if needed later
// export async function fetchUserFavorites(session: Session | null): Promise<any[]> {
//   if (!session?.supabaseAccessToken) {
//     console.error('[fetchUserFavorites] No session or Supabase access token found.');
//     return [];
//   }
//   const supabase = createSupabaseClient(session.supabaseAccessToken);
//   const { data, error } = await supabase.from('favorite').select('*, listing(*)'); // Example: join with listing table
//   if (error) {
//     console.error('[fetchUserFavorites] Error fetching favorites:', error);
//     throw error;
//   }
//   return data || [];
// } 