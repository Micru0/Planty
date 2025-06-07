'use client'; // Mark as client component if using hooks like useSession or if it's imported by client components

import { createSupabaseClient } from '@/utils/supabase/client';
import { Filters } from '@/types';
import { TablesInsert, TablesUpdate } from '@/types/database.types';
import { Session } from 'next-auth'; // For typing the session object

// Function to get the current user ID from the session
// This is a helper and might be adapted based on how session is passed or accessed
const getCurrentUserId = (session: Session | null): string | undefined => {
	return session?.user?.id;
};

export const saveUserPreferences = async (filters: Filters, session: Session | null): Promise<{ error?: any }> => {
	const userId = getCurrentUserId(session);
	if (!userId || !session?.supabaseAccessToken) {
		console.error('User ID or access token not available for saving preferences.');
		return { error: 'User not authenticated or session invalid.' };
	}

	console.log('Saving user preferences for user:', userId, 'Filters:', filters);
	const supabase = createSupabaseClient(session.supabaseAccessToken);

	// Prepare data for Supabase: snake_case and ensure null for empty strings if column expects null
	// The search_preference table uses user_id as its primary key for upsert if we define it that way.
	// Or, it might have its own 'id' and a unique constraint on user_id.
	// For this example, assuming we upsert based on user_id if it's the PK or part of a unique key.
	// If 'search_preference' has its own auto-incrementing 'id' and user_id is just a column,
	// we might need to fetch existing preference ID first for an update, or insert if none.

	// The search_preference table in 0-supabase-sql.md has an 'id' primary key and a 'user_id' column.
	// We need to fetch if a preference for this user_id exists first.

	try {
		// 1. Check if preferences for this user already exist
		let { data: existingPreference, error: fetchError } = await supabase
			.from('search_preference')
			.select('id')
			.eq('user_id', userId)
			.maybeSingle(); // Use maybeSingle to get one record or null

		if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: no rows found, not an error for maybeSingle
			console.error('Error fetching existing preferences:', fetchError);
			return { error: fetchError };
		}
		
		const preferenceData: TablesInsert<'search_preference'> | TablesUpdate<'search_preference'> = {
			user_id: userId,
			light_level: filters.lightLevel || null, // Convert empty string to null
			size: filters.size || null, // Convert empty string to null
			watering_frequency: filters.wateringFrequency || null, // Convert empty string to null
		};

		let upsertError;
		if (existingPreference?.id) {
			// Update existing preference
			console.log('Updating existing preference for user:', userId, 'Data:', preferenceData);
			const { error } = await supabase
				.from('search_preference')
				.update(preferenceData as TablesUpdate<'search_preference'>) // We know all fields are optional in Update
				.eq('id', existingPreference.id);
			upsertError = error;
		} else {
			// Insert new preference
			console.log('Inserting new preference for user:', userId, 'Data:', preferenceData);
			const { error } = await supabase
				.from('search_preference')
				.insert(preferenceData as TablesInsert<'search_preference'>); // user_id is required for Insert if not defaulted by DB
			upsertError = error;
		}

		if (upsertError) {
			console.error('Error saving/updating preferences:', upsertError);
			return { error: upsertError };
		}
		console.log('User preferences saved successfully for user:', userId);
		return {}; // Success
	} catch (e: any) {
		console.error('Exception during saveUserPreferences:', e);
		return { error: e };
	}
};

export const fetchUserPreferences = async (session: Session | null): Promise<Filters> => {
	const userId = getCurrentUserId(session);
	if (!userId || !session?.supabaseAccessToken) {
		console.warn('User ID or access token not available for fetching preferences.');
		return {};
	}

	console.log('Fetching user preferences for user:', userId);
	const supabase = createSupabaseClient(session.supabaseAccessToken);
	try {
		const { data, error } = await supabase
			.from('search_preference')
			.select('light_level, size, watering_frequency')
			.eq('user_id', userId)
			.maybeSingle(); // Fetches one row or null, not an array

		if (error && error.code !== 'PGRST116') { // PGRST116: no rows found, not an error for maybeSingle
			console.error('Error fetching preferences:', error);
			return {}; // Return empty filters on error
		}

		if (data) {
			console.log('Fetched preferences:', data);
			// Map snake_case from DB to camelCase for Filters interface
			const preferences: Filters = {
				lightLevel: data.light_level || undefined,
				size: data.size || undefined,
				wateringFrequency: data.watering_frequency || undefined,
			};
			return preferences;
		}
		console.log('No preferences found for user:', userId);
		return {}; // No preferences found
	} catch (e: any) {
		console.error('Exception during fetchUserPreferences:', e);
		return {};
	}
};
