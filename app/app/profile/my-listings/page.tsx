import Link from "next/link";
import { Database } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/utils/supabase/server";
import { auth } from "@/lib/auth";
import { deleteListing } from "@/app/actions/listings";
import { Trash2 } from "lucide-react";

type Listing = Database["public"]["Tables"]["listing"]["Row"];

export default async function MyListingsPage() {
  const supabase = await getSupabaseClient();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return <p>You must be logged in to see your listings.</p>;
  }

  const { data: listings, error } = await supabase
    .from("listing")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching listings:", error);
    return <p>There was an error fetching your listings.</p>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Button asChild>
          <Link href="/app/seller/upload">Create New Listing</Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">You haven't created any listings yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing: Listing) => (
            <div key={listing.id} className="border rounded-lg shadow-sm flex flex-col">
              <Link href={`/app/listings/${listing.id}`} className="flex-grow">
                <div className="p-4">
                    {/* We can add an image here later */}
                    <h2 className="text-lg font-semibold truncate">{listing.species}</h2>
                    <p className="text-gray-500">${listing.price}</p>
                </div>
              </Link>
              <div className="p-2 border-t bg-muted/50 flex items-center justify-end">
                  <form action={deleteListing}>
                      <input type="hidden" name="listingId" value={listing.id} />
                      <Button type="submit" variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 size={18}/>
                      </Button>
                  </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 