'use client';

import { useState } from 'react';
import PhotoUpload from '@/components/app/PhotoUpload';
import ListingWizard from '@/components/app/ListingWizard';
import ListingPreview from '@/components/app/ListingPreview';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/utils/supabase/client";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

// New structure for an individual actionable task
export interface ActionableTask {
  title: string;
  description: string;
  frequency_days: number;
  is_optional: boolean;
}

// Data structure received from the Gemini Vision API
export interface AiResults {
  plantName: string;
  actionable_tasks: ActionableTask[];
  care_tips: string[];
  tags: string[];
  light_level: string;
  size: string;
  watering_frequency: string;
}

// Data structure for the entire listing flow
export interface ListingData {
  imageFile: File | null;
  images?: string[]; // URLs after upload
  species: string;
  care_details: string; // Will hold the raw JSON string for submission
  actionable_tasks?: ActionableTask[]; // Raw from AI
  care_tips?: string[]; // Raw from AI
  tags: string[];
  price?: number;
  light_level?: string;
  size?: string;
  watering_frequency?: string;
}

type WizardStep = 'upload' | 'edit' | 'preview' | 'publish';

export default function SellerUploadPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [listingData, setListingData] = useState<Partial<ListingData>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const handlePhotoAnalysisComplete = (results: AiResults, imageFile: File) => {
    console.log("SellerUploadPage: PhotoAnalysisComplete received", { results, imageFile });
    setListingData(prevData => ({
      ...prevData,
      species: results.plantName,
      // Store the raw tasks and tips
      actionable_tasks: results.actionable_tasks,
      care_tips: results.care_tips,
      // Other fields from AI
      tags: results.tags,
      light_level: results.light_level,
      size: results.size,
      watering_frequency: results.watering_frequency,
      imageFile,
    }));
    setCurrentStep('edit');
  };

  const handleDetailsSaved = (updatedDetails: Partial<ListingData>) => {
    console.log("SellerUploadPage: DetailsSaved received", updatedDetails);
    setListingData(prevData => ({
      ...prevData,
      ...updatedDetails,
    }));
    setCurrentStep('preview');
  };
  
  const handleGoBack = () => {
    if (currentStep === 'edit') {
      setCurrentStep('upload');
    } else if (currentStep === 'preview') {
      setCurrentStep('edit');
    } else if (currentStep === 'publish') {
      setPublishError(null);
      setIsPublishing(false);
      setCurrentStep('preview');
    }
  };

  const handleConfirmAndPublish = async () => {
    console.log("SellerUploadPage: ConfirmAndPublish initiated with current listing data:", listingData);
    let filePath: string | null = null;

    if (!session?.supabaseAccessToken || !session.user?.id) {
      setPublishError("Authentication error. Please ensure you are logged in and try again.");
      setIsPublishing(false);
      setCurrentStep('publish');
      return;
    }
    if (!listingData.imageFile || !listingData.species || !listingData.price || !listingData.care_details) {
        setPublishError("Missing required listing information (image, species, price, care details). Please go back and complete all fields.");
        setIsPublishing(false);
        setCurrentStep('publish');
        return;
    }

    setIsPublishing(true);
    setPublishError(null);
    setCurrentStep('publish');

    try {
      const supabase = createSupabaseClient(session.supabaseAccessToken);
      let finalImageUrls: string[] = [];

      if (listingData.imageFile) {
        const file = listingData.imageFile;
        filePath = `public/${session.user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        
        console.log(`Attempting to upload image to Supabase Storage at path: ${filePath}`);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error("Supabase Storage upload error:", uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        console.log("Image uploaded successfully, attempting to get public URL for path:", filePath);
        const { data: publicUrlData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(filePath);
        
        if (!publicUrlData || !publicUrlData.publicUrl) {
          console.error("Failed to get public URL for uploaded image. publicUrlData:", publicUrlData);
          throw new Error("Failed to get public URL for the uploaded image.");
        }
        finalImageUrls = [publicUrlData.publicUrl];
        console.log("Public URL obtained:", finalImageUrls[0]);
      } else {
        console.warn("No image file found to upload, proceeding without image.");
      }
      
      const rawAiJson = (listingData.actionable_tasks && listingData.care_tips) 
        ? JSON.stringify({
            plantName: listingData.species,
            actionable_tasks: listingData.actionable_tasks,
            care_tips: listingData.care_tips,
            tags: listingData.tags,
            light_level: listingData.light_level,
            size: listingData.size,
            watering_frequency: listingData.watering_frequency,
          })
        : listingData.care_details;

      const listingToInsert = {
        images: finalImageUrls,
        species: listingData.species!,
        price: listingData.price!,
        care_details: rawAiJson!,
        tags: listingData.tags || [],
        user_id: session.user.id,
        ...(listingData.light_level && { light_level: listingData.light_level }),
        ...(listingData.size && { size: listingData.size }),
        ...(listingData.watering_frequency && { watering_frequency: listingData.watering_frequency }),
      };

      console.log("Attempting to insert listing into Supabase table:", JSON.stringify(listingToInsert, null, 2));

      const { data: insertData, error: insertError } = await supabase
        .from('listing') 
        .insert([listingToInsert])
        .select()
        .single();

      if (insertError) {
        console.error("Supabase table insert error:", insertError);
        if (finalImageUrls.length > 0 && filePath) {
          console.warn("Database insert failed, attempting to delete orphaned image from storage:", filePath);
          await supabase.storage.from('listing-images').remove([filePath]);
        }
        throw new Error(`Failed to publish listing to database: ${insertError.message}`);
      }
      
      console.log("Listing published successfully to database! Inserted data:", insertData);
      setListingData(prev => ({
          ...prev,
          images: finalImageUrls, 
          imageFile: null 
      })); 

    } catch (err: any) {
      console.error("Publishing process error:", err);
      setPublishError(`An unexpected error occurred: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const progressValue = () => {
    if (currentStep === 'upload') return 25;
    if (currentStep === 'edit') return 50;
    if (currentStep === 'preview') return 75;
    if (currentStep === 'publish') return 100;
    return 0;
  };
  
  const getStepTitle = () => {
    if (currentStep === 'upload') return "Step 1: Upload Photo";
    if (currentStep === 'edit') return "Step 2: Edit Details";
    if (currentStep === 'preview') return "Step 3: Preview Listing";
    if (currentStep === 'publish') return "Step 4: Publish Listing";
    return "Plant Listing";
  }

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
       <div className="w-full max-w-lg mb-8">
        <h1 className="text-2xl font-bold text-center mb-2">{getStepTitle()}</h1>
        <Progress value={progressValue()} className="w-full" />
      </div>

      {currentStep === 'upload' && (
        <PhotoUpload onAnalysisComplete={handlePhotoAnalysisComplete} formId="photo-upload-form" />
      )}
      {currentStep === 'edit' && (
        <ListingWizard 
            initialData={listingData} 
            onSave={handleDetailsSaved} 
            onBack={handleGoBack} 
        />
      )}
      {currentStep === 'preview' && listingData && (
        <ListingPreview 
            listingData={{...listingData, images: listingData.imageFile ? [URL.createObjectURL(listingData.imageFile)] : (listingData.images || []) }} 
            onEdit={handleGoBack} 
            onPublish={handleConfirmAndPublish} 
        />
      )}
       {currentStep === 'publish' && (
        <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-md text-center">
          {isPublishing ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Publishing...</h2>
              <p>Submitting your listing for "{listingData.species || 'your plant'}" to the marketplace.</p>
            </>
          ) : publishError ? (
            <>
              <h2 className="text-xl font-semibold mb-4 text-red-600">Publishing Failed</h2>
              <p className="text-red-500 mb-4">{publishError}</p>
              <Button onClick={handleGoBack} className="mr-2 force-outline-button">Back to Preview</Button>
              <Button onClick={handleConfirmAndPublish} className="force-primary-button">Try Again</Button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4 text-green-600">Listing Published Successfully!</h2>
              <p>Your listing for "{listingData.species}" is now live.</p>
              {listingData.images && listingData.images[0] && (
                <div className="my-2">
                  <p className="text-sm">Image URL: <a href={listingData.images[0]} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Image</a></p>
                  <img src={listingData.images[0]} alt={listingData.species || "Uploaded plant"} className="rounded-md max-h-40 w-auto mx-auto my-2" />
                </div>
              )}
              <Button onClick={() => { 
                setListingData({}); 
                setCurrentStep('upload'); 
                setPublishError(null); 
                setIsPublishing(false); 
              }} className="mt-6 force-primary-button">Create Another Listing</Button>
            </>
          )}
        </div>
      )}
    </div>
  );
} 