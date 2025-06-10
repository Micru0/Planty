'use server';

import { getSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteListing(formData: FormData) {
    const listingId = formData.get('listingId') as string;

    if (!listingId) {
        throw new Error("Listing ID is required.");
    }

    const supabase = await getSupabaseClient();
    
    const { error } = await supabase
        .from('listing')
        .delete()
        .eq('id', listingId);

    if (error) {
        console.error('Error deleting listing:', error);
        // Here you could return an error message to display to the user
        throw new Error("Could not delete the listing. Please try again.");
    }

    // Revalidate paths to update the UI
    revalidatePath('/app/profile/my-listings');
    revalidatePath('/app/listings');
    revalidatePath(`/app/listings/${listingId}`);
} 