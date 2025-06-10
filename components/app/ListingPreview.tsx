'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ListingData } from "@/app/app/seller/upload/page";
import { CheckCircle, Zap } from "lucide-react";

interface ListingPreviewProps {
  listingData: Partial<ListingData>;
  onEdit: () => void;
  onPublish: () => void;
}

export default function ListingPreview({ listingData, onEdit, onPublish }: ListingPreviewProps) {
  const {
    species,
    price,
    care_details,
    light_level,
    size,
    watering_frequency,
    tags,
    images
  } = listingData;

  // Fallback for image preview if URL is not yet available but file is
  const imageUrl = (images && images.length > 0) ? images[0] : (listingData.imageFile ? URL.createObjectURL(listingData.imageFile) : "/images/placeholder.svg");

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Confirm Your Listing</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          This is how your plant will appear to buyers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="w-full h-64 rounded-lg overflow-hidden border">
            <img 
              src={imageUrl} 
              alt={species || "Plant image"} 
              className="w-full h-full object-cover"
            />
        </div>

        <div className="text-center">
            <h2 className="text-3xl font-bold">{species || "N/A"}</h2>
            <p className="text-2xl font-semibold text-primary">${price?.toFixed(2) || "0.00"}</p>
        </div>

        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Care Guide</h3>
                <p className="text-sm text-muted-foreground">
                    {care_details || "No care details provided."}
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Attributes</h3>
                <ul className="space-y-2 text-sm">
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-primary" /><strong>Light:</strong><span className="ml-2">{light_level || "N/A"}</span></li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-primary" /><strong>Size:</strong><span className="ml-2">{size || "N/A"}</span></li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-primary" /><strong>Watering:</strong><span className="ml-2">{watering_frequency || "N/A"}</span></li>
                </ul>
            </div>
        </div>

        {tags && tags.length > 0 && (
            <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                </div>
            </div>
        )}

      </CardContent>
      <CardFooter className="flex justify-between p-6">
        <Button variant="outline" onClick={onEdit} className="force-outline-button">
          Back to Edit
        </Button>
        <Button onClick={onPublish} className="force-primary-button gap-2">
            <Zap className="w-4 h-4"/>
            Confirm & Publish
        </Button>
      </CardFooter>
    </Card>
  );
} 