'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/utils/supabase/client';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { Tables } from '@/types/database.types';
import { Product } from '@/types';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useCartStore } from '@/store/cartStore';

// Function to map Supabase listing to Product type (can be moved to a types helper if used elsewhere)
const mapListingToProduct = (listing: Tables<'listing'>): Product => ({
  id: listing.id,
  species: listing.species,
  price: listing.price,
  images: listing.images,
  care_details: listing.care_details,
  tags: listing.tags,
  user_id: listing.user_id,
  created_at: listing.created_at,
  updated_at: listing.updated_at,
  lightLevel: listing.light_level || undefined,
  size: listing.size || undefined,
  wateringFrequency: listing.watering_frequency || undefined,
});

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.listingId as string;

  const { data: sessionData } = useSession();
  const session = sessionData as Session | null;
  const { toast } = useToast();

  // Get addItem action from Zustand store
  const { addItem: addItemToCartStore } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!listingId || !session?.supabaseAccessToken) {
        if (!session?.supabaseAccessToken && session) {
            // Avoid setting error if session is present but token is momentarily unavailable during auth flow
        } else if (!session) {
            setError("Session not available. Please log in.");
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const supabase = createSupabaseClient(session.supabaseAccessToken);
        const { data, error: fetchError } = await supabase
          .from('listing')
          .select('*')
          .eq('id', listingId)
          .single();

        if (fetchError) {
          console.error('Error fetching product:', fetchError);
          setError(`Failed to fetch product: ${fetchError.message}`);
          setProduct(null);
        } else if (data) {
          const mappedProduct = mapListingToProduct(data as Tables<'listing'>);
          setProduct(mappedProduct);
        } else {
          setError('Listing not found.');
          setProduct(null);
        }
      } catch (e: any) {
        console.error('Exception during product fetch:', e);
        setError(`An unexpected error occurred: ${e.message}`);
        setProduct(null);
      }
      setIsLoading(false);
    };

    if (session !== undefined) { // Ensure session loading is complete
        fetchProduct();
    }
  }, [listingId, session]);

  const handleAddToCart = () => {
    if (product) {
      const cartItem: Omit<import('@/types/cart.types').CartItem, 'id' | 'quantity'> = {
        productId: product.id,
        name: product.species,
        price: product.price,
        imageUrl: product.images && product.images.length > 0 ? product.images[0] : undefined,
      };
      addItemToCartStore(cartItem, 1);
      toast({
        title: "Added to Cart!",
        description: `${product.species} has been added to your cart.`,
        action: (
          <Button variant="outline" size="sm" onClick={() => router.push('/app/cart')}>
            View Cart
          </Button>
        ),
      });
    } else {
      toast({
        title: "Error",
        description: "Cannot add to cart: product details are not available.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading product details...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!product) {
    return <div className="p-4 text-center">Product not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <Button /*variant="default"*/ onClick={() => router.back()} className="mb-6 hover:bg-primary/90 force-primary-button">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Listings
      </Button>
      <Card className="overflow-hidden shadow-lg">
        <div className="md:flex">
          <div className="md:w-1/2 h-64 md:h-auto relative">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.species}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-sm text-muted-foreground">No image available</span>
              </div>
            )}
          </div>
          <div className="md:w-1/2 p-6 flex flex-col">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-3xl font-bold">{product.species}</CardTitle>
              <CardDescription className="text-xl text-primary font-semibold mt-1">
                ${product.price.toFixed(2)}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 flex-grow space-y-4">
              {product.care_details && <p className="text-muted-foreground text-sm leading-relaxed">{product.care_details}</p>}
              
              <Separator />

              <div className="space-y-2">
                {product.lightLevel && <p className="text-sm"><strong className="font-medium">Light:</strong> {product.lightLevel}</p>}
                {product.size && <p className="text-sm"><strong className="font-medium">Size:</strong> {product.size}</p>}
                {product.wateringFrequency && <p className="text-sm"><strong className="font-medium">Watering:</strong> {product.wateringFrequency}</p>}
              </div>

              {product.tags && product.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1 text-sm">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="p-0 pt-6 mt-auto">
              <Button size="lg" className="w-full hover:bg-primary/90 flex items-center force-primary-button" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>
      <Toaster />
    </div>
  );
} 