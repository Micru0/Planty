'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import {
  fetchUserFavorites,
  removeProductFromFavorites,
  type FavoriteWithListing, // Import the type
} from '@/utils/supabase/favorites';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function SavedItemsList() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { addItem: addItemToCart, isCartLoaded } = useCartStore();

  const [savedItems, setSavedItems] = useState<FavoriteWithListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSavedItems = useCallback(async () => {
    if (!session) {
      // Session might not be immediately available, don't set error yet unless unauthenticated
      if (session === null) setError("Please log in to see your saved items.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const items = await fetchUserFavorites(session);
      setSavedItems(items);
    } catch (e: any) {
      console.error("[SavedItemsList] Error fetching saved items:", e);
      setError(e.message || "Failed to load saved items.");
    }
    setIsLoading(false);
  }, [session]);

  useEffect(() => {
    loadSavedItems();
  }, [loadSavedItems]);

  const handleRemoveItem = async (favoriteId: number, itemName: string) => {
    if (!session) return;
    try {
      await removeProductFromFavorites(String(favoriteId), session);
      setSavedItems(prevItems => prevItems.filter(item => item.id !== favoriteId));
      toast({
        title: "Item Removed",
        description: `${itemName} has been removed from your saved items.`,
      });
    } catch (e: any) {
      console.error("[SavedItemsList] Error removing item:", e);
      toast({
        title: "Error Removing Item",
        description: e.message || "Could not remove the item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMoveToCart = (item: FavoriteWithListing) => {
    if (!item.listing) return; // Should not happen due to filtering in fetch
    if (!isCartLoaded) {
        toast({ title: "Cart not ready", description: "Please wait a moment for the cart to initialize.", variant: "destructive"});
        return;
    }

    const cartProductToAdd = {
      productId: String(item.listing.id),
      name: item.listing.species,
      price: item.listing.price,
      imageUrl: item.listing.images && item.listing.images.length > 0 ? item.listing.images[0] : undefined,
    };
    addItemToCart(cartProductToAdd, 1);
    // After adding to cart, remove from favorites
    handleRemoveItem(item.id, item.listing.species);
    toast({
      title: "Moved to Cart!",
      description: `${item.listing.species} has been moved to your cart.`,
      action: <Link href="/app/cart"><Button variant="outline" size="sm">View Cart</Button></Link>,
    });
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading saved items...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 flex flex-col items-center">
        <AlertTriangle className="w-12 h-12 mb-4" />
        <p className="text-xl font-semibold">Error Loading Saved Items</p>
        <p>{error}</p>
        {error.includes("log in") && 
            <Link href="/api/auth/signin" className="mt-4">
                <Button>Login</Button>
            </Link>
        }
      </div>
    );
  }

  if (savedItems.length === 0) {
    return (
      <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle>My Saved Items</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-xl text-muted-foreground">You haven't saved any items yet.</p>
          <Link href="/app/listings" className="mt-4 inline-block">
            <Button variant="outline">Browse Plants</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6 shadow-lg">
      <CardHeader>
        <CardTitle>My Saved Items ({savedItems.length})</CardTitle>
        <CardDescription>Plants you've saved for later.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {savedItems.map((item) => {
          if (!item.listing) return null; // Should be filtered by fetchUserFavorites
          const listing = item.listing;
          return (
            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0 flex-grow">
                {listing.images && listing.images.length > 0 ? (
                  <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image src={listing.images[0]} alt={listing.species} fill style={{ objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div className="relative w-20 h-20 rounded-md bg-muted flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No Image</span>
                  </div>
                )}
                <div className="flex-grow">
                  <Link href={`/app/listings/${listing.id}`} passHref legacyBehavior>
                    <a className="font-semibold text-lg hover:underline">{listing.species}</a>
                  </Link>
                  <p className="text-sm text-muted-foreground">Price: ${listing.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 mt-3 sm:mt-0 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => handleMoveToCart(item)} aria-label="Move to cart">
                  <ShoppingCart className="mr-2 h-4 w-4" /> Move to Cart
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id, listing.species)} className="text-destructive hover:text-destructive/80" aria-label="Remove from saved items">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
} 