'use client';

import React, { useState, useEffect, useCallback } from 'react';
import FiltersPanel from '@/components/app/FiltersPanel';
import { createSupabaseClient } from '@/utils/supabase/client';
import { Product, Filters } from '@/types';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Tables } from '@/types/database.types';
import { fetchUserPreferences, saveUserPreferences } from '@/utils/supabase/user';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter
} from "@/components/ui/sheet";
import { SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

const ListingsPage: React.FC = () => {
  const { data: sessionData, status: sessionStatus } = useSession();
  const session = sessionData as Session | null;

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<Filters>({});
  const [initialFiltersLoaded, setInitialFiltersLoaded] = useState<boolean>(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const applyFiltersToList = useCallback((filtersToApply: Filters, productsToFilter: Product[]) => {
    console.log('[ListingsPage] applyFiltersToList CALLED with filters:', JSON.stringify(filtersToApply, null, 2), 'on product list (length):', productsToFilter.length);
    let tempFiltered = [...productsToFilter];
    if (filtersToApply.lightLevel && filtersToApply.lightLevel !== '') {
      tempFiltered = tempFiltered.filter(p => p.lightLevel === filtersToApply.lightLevel);
    }
    if (filtersToApply.size && filtersToApply.size !== '') {
      tempFiltered = tempFiltered.filter(p => p.size === filtersToApply.size);
    }
    if (filtersToApply.wateringFrequency && filtersToApply.wateringFrequency !== '') {
      tempFiltered = tempFiltered.filter(p => p.wateringFrequency === filtersToApply.wateringFrequency);
    }
    console.log('[ListingsPage] applyFiltersToList - Calculated tempFiltered count:', tempFiltered.length, 'Items:', JSON.stringify(tempFiltered.map(p=>p.id)));
    
    setTimeout(() => {
        console.log('[ListingsPage] Deferred update: setting filteredProducts.');
        setFilteredProducts(tempFiltered);
    }, 0);
  }, []);

  const fetchProductsAndPreferences = useCallback(async () => {
    console.log('fetchProductsAndPreferences. Session status:', sessionStatus);
    if (sessionStatus !== 'authenticated' || !session?.supabaseAccessToken) {
      console.log('Session not authenticated or no Supabase access token for fetching products/prefs.');
      if (sessionStatus === 'unauthenticated') setError("Please log in to view listings.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting to fetch products from Supabase...');
      const supabase = createSupabaseClient(session.supabaseAccessToken);
      const { data: productData, error: fetchError } = await supabase.from('listing').select('*');

      if (fetchError) {
        console.error('Error fetching products:', fetchError);
        setError(`Failed to fetch products: ${fetchError.message}`);
        setAllProducts([]);
      } else if (productData) {
        console.log('Successfully fetched products:', productData);
        const processedProducts: Product[] = productData.map((p: Tables<'listing'>) => ({
          id: p.id,
          species: p.species,
          price: p.price,
          images: p.images,
          care_details: p.care_details,
          tags: p.tags,
          user_id: p.user_id,
          created_at: p.created_at,
          updated_at: p.updated_at,
          lightLevel: p.light_level || undefined,
          size: p.size || undefined,
          wateringFrequency: p.watering_frequency || undefined,
          description: `A lovely ${p.species}. Care: ${p.care_details ? p.care_details.substring(0, 70) + '...' : 'Care details not available.'}`,
        }));
        setAllProducts(processedProducts);

        if (!initialFiltersLoaded) {
          console.log('Fetching user preferences...');
          const userPrefs = await fetchUserPreferences(session);
          console.log('Fetched user preferences:', userPrefs);
          setTimeout(() => {
            console.log('[ListingsPage] Deferred update: setting currentFilters from userPrefs.');
            setCurrentFilters(userPrefs);
          }, 0);
          setInitialFiltersLoaded(true);
        }
      } else {
        console.log('No products found or data is null.');
        setAllProducts([]);
      }
    } catch (e: any) {
      console.error('Exception during product/preference fetch:', e);
      setError(`An unexpected error occurred: ${e.message}`);
      setAllProducts([]);
    }
    setIsLoading(false);
  }, [session, sessionStatus, initialFiltersLoaded]);

  useEffect(() => {
    if (sessionStatus !== 'loading') {
      fetchProductsAndPreferences();
    }
  }, [sessionStatus, fetchProductsAndPreferences]);

  useEffect(() => {
    if (initialFiltersLoaded) {
      console.log('[ListingsPage] useEffect for [currentFilters, allProducts] triggered. Applying filters.');
      applyFiltersToList(currentFilters, allProducts);
    }
  }, [currentFilters, allProducts, initialFiltersLoaded, applyFiltersToList]);

  const handleFilterChange = useCallback(async (newFilters: Filters) => {
    console.log('[ListingsPage] handleFilterChange received newFilters:', JSON.stringify(newFilters, null, 2));

    setTimeout(() => {
        try {
            console.log('[ListingsPage] Deferred update: setting currentFilters from handleFilterChange.');
            setCurrentFilters(newFilters);
        } catch (error) {
            console.error('[ListingsPage] Error in deferred setCurrentFilters from handleFilterChange:', error, 'Filters object was:', newFilters);
        }
    }, 0);

    if (session && sessionStatus === 'authenticated') {
      const hasActiveFilter = Object.values(newFilters).some(v => v && v !== '');
      const allFiltersCleared = Object.keys(newFilters).length > 0 && !hasActiveFilter;
      const noFiltersAtAll = Object.keys(newFilters).length === 0;

      if (hasActiveFilter || allFiltersCleared || noFiltersAtAll ) {
        console.log('[ListingsPage] Attempting to save user preferences:', newFilters);
        await saveUserPreferences(newFilters, session);
      }
    }
  }, [session, sessionStatus]);

  if (sessionStatus === 'loading') {
    return <div className="p-4 text-center">Loading session...</div>;
  }

  if (isLoading && !allProducts.length && sessionStatus === 'authenticated') {
    return <div className="p-4 text-center">Loading products...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }
   if (sessionStatus === 'unauthenticated') {
    return <div className="p-4 text-center text-orange-500">Please log in to browse our plants!</div>;
  }

  return (
    <div className="p-4">
      {sessionStatus === 'authenticated' && (
        <div className="mb-4 flex justify-start">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-xs p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Filter Plants</SheetTitle>
                <SheetDescription>
                  Refine your plant search using the options below.
                </SheetDescription>
              </SheetHeader>
              <div className="overflow-y-auto h-[calc(100vh-140px)]">
                <FiltersPanel onChange={handleFilterChange} initialFilters={currentFilters} />
              </div>
              <SheetFooter className="p-4 border-t">
                <SheetClose asChild>
                    <Button type="button" variant="outline" className="w-full">Done</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      )}

      <div className="lg:flex-grow">
        {filteredProducts.length === 0 && !isLoading ? (
          <div className="text-center py-10">
            <p className="text-xl text-muted-foreground">No products currently available or matching your filters.</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting or clearing your filter criteria, or check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
                <CardHeader className="p-0">
                  {product.images && product.images.length > 0 ? (
                    <div className="relative w-full h-56">
                        <Image 
                            src={product.images[0]} 
                            alt={product.species ?? 'Plant image'}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            style={{objectFit:"cover"}}
                            className="rounded-t-lg"
                        />
                    </div>
                  ) : (
                    <div className="w-full h-56 bg-muted rounded-t-lg flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">No image</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <CardTitle className="text-lg font-semibold">{product.species}</CardTitle>
                  <p className="text-base text-muted-foreground mt-1">${product.price ? product.price.toFixed(2) : '0.00'}</p>
                  <p className="text-sm text-foreground/80 mt-2 line-clamp-3">
                    {product.care_details} 
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button asChild className="w-full">
                    <Link href={`/app/listings/${product.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        {isLoading && allProducts.length > 0 && sessionStatus === 'authenticated' && (
            <div className="text-center py-10"><p>Loading products...</p></div>
        )}
      </div>
    </div>
  );
};

export default ListingsPage; 