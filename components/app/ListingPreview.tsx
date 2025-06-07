'use client';

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export interface AiResults {
  species: string;
  careNeeds: string;
  suggestedPrice: number;
  confidence: number;
}

export interface ListingData extends AiResults {
  imageFile: File | null;
  images?: string[];
  description?: string;
  tags?: string[];
}

interface ListingPreviewProps {
  listingData: Partial<ListingData>;
  onEdit: () => void;
  onPublish: () => void;
}

export default function ListingPreview({ listingData, onEdit, onPublish }: ListingPreviewProps) {
  const { 
    species = 'N/A', 
    careNeeds = 'N/A', 
    suggestedPrice = 0, 
    images,
    description,
    tags = []
  } = listingData;

  const displayImageUrl = images && images.length > 0 ? images[0] : null;

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Preview Listing</CardTitle>
        <CardDescription>Review the details of your plant listing before publishing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {displayImageUrl && (
          <div className="relative w-full h-64 rounded-md overflow-hidden">
            <Image 
              src={displayImageUrl}
              alt={species || 'Plant image'} 
              layout="fill" 
              objectFit="cover" 
            />
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Plant Details</h3>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Species</p>
              <p className="text-lg">{species}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Suggested Price</p>
              <p className="text-lg font-semibold">${suggestedPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Care Needs</h3>
          <p>{careNeeds}</p>
        </div>

        {description && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p>{description}</p>
          </div>
        )}

        {tags && tags.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button /*variant="outline"*/ onClick={onEdit} className="force-outline-button">Back to Edit</Button>
        <Button onClick={onPublish} /*variant="default"*/ className="force-primary-button">Confirm & Publish</Button>
      </CardFooter>
    </Card>
  );
} 