'use client';

import { useState, ChangeEvent, FormEvent, DragEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud, Leaf } from 'lucide-react'; // For spinner and icons
import type { AiResults } from '@/app/app/seller/upload/page'; // Import shared types

interface PhotoUploadProps {
  onAnalysisComplete: (results: AiResults, imageFile: File | null, imageUrl: string | null) => void;
}

export default function PhotoUpload({ onAnalysisComplete }: PhotoUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<AiResults | null>(null); // To store initial AI results
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [editableResults, setEditableResults] = useState<AiResults | null>(null); // For user edits
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploadedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
      setAiResults(null); // Reset previous results
      setEditableResults(null);
      console.log("Image selected:", file.name);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      setUploadedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
      setAiResults(null);
      setEditableResults(null);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const simulateAiProcessing = async () => {
    if (!uploadedImage) return;

    setIsLoading(true);
    setProgress(0);
    console.log("Starting AI processing for image:", uploadedImage.name);

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress <= 100) {
        setProgress(currentProgress);
      } else {
        clearInterval(progressInterval);
      }
    }, 200);

    await new Promise(resolve => setTimeout(resolve, 2000));
    clearInterval(progressInterval);
    setProgress(100);

    const mockResults: AiResults = {
      species: 'Monstera Deliciosa',
      careNeeds: 'Loves bright, indirect light. Water when top 2 inches of soil are dry.',
      suggestedPrice: 45.99,
      confidence: 0.85,
    };
    setAiResults(mockResults); // Store the original AI results
    setEditableResults(mockResults); // Set editable results initially to AI results
    setIsLoading(false);
    console.log("AI processing complete. Results:", mockResults);
  };

  const handleResultChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editableResults) {
      const { name, value } = event.target;
      const updatedResults = {
        ...editableResults,
        [name]: name === 'suggestedPrice' || name === 'confidence' ? parseFloat(value) : value,
      };
      setEditableResults(updatedResults);
      console.log("AI results edited:", updatedResults);
    }
  };
  
  // This submit is for the PhotoUpload part, leading to the next step in the parent
  const handleSubmitToNextStep = (event: FormEvent) => {
    event.preventDefault();
    if (editableResults && uploadedImage && imagePreviewUrl) {
      console.log("Proceeding to next step with details:", editableResults);
      onAnalysisComplete(editableResults, uploadedImage, imagePreviewUrl);
    }
  };

  // Give the form an id to be referenced by the submit button in CardFooter
  const formId = "photo-upload-form";

  return (
    <Card className="w-full max-w-lg mx-auto border-0 shadow-none bg-transparent">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-foreground">Upload Your Plant</CardTitle>
        <CardDescription className="text-foreground/80">
          {!editableResults ? "Drag and drop or select an image of your plant. Our AI will work its magic!" : "Review the AI suggestions for your plant."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id={formId} onSubmit={handleSubmitToNextStep}>
          <div className="space-y-8">

            {/* Step 1: Upload Box or Image Preview */}
            {!editableResults && !isLoading && (
              <div 
                className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors duration-200 ${isDragging ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {imagePreviewUrl && uploadedImage ? (
                  <div className="text-center">
                    <img src={imagePreviewUrl} alt="Plant preview" className="rounded-md max-h-60 w-auto" />
                    <Button variant="link" className="mt-4" onClick={() => document.getElementById('plant-image-input')?.click()}>Choose a different image</Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <UploadCloud className="w-16 h-16 text-muted-foreground mb-4 mx-auto" />
                    <Label htmlFor="plant-image-input" className="font-semibold text-lg text-primary cursor-pointer">
                      Click to upload or drag & drop
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">PNG, JPG, or GIF (max. 10MB)</p>
                  </div>
                )}
                <Input id="plant-image-input" type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            )}
            
            {/* Step 2: Analyze Button */}
            {uploadedImage && !aiResults && !isLoading && (
              <div className="text-center">
                <Button 
                  onClick={simulateAiProcessing} 
                  disabled={isLoading} 
                  size="lg"
                  className="w-full bg-primary text-primary-foreground font-bold text-lg py-6 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105"
                >
                  <Leaf className="mr-3 h-6 w-6" />
                  Analyze Plant
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center p-8 rounded-lg bg-card border">
                <Progress value={progress} className="w-full mb-4" />
                <p className="text-lg font-semibold animate-pulse">AI is analyzing your plant...</p>
                <p className="text-sm text-muted-foreground">{progress}% complete</p>
              </div>
            )}
            
            {/* Step 3: Editable Results */}
            {editableResults && (
              <div className="p-8 rounded-lg bg-card border space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2 text-foreground">AI Suggestions</h3>
                 <div>
                   <Label htmlFor="species">Species</Label>
                   <Input id="species" name="species" value={editableResults.species} onChange={handleResultChange} className="bg-background" />
                 </div>
                 <div>
                   <Label htmlFor="careNeeds">Care Needs</Label>
                   <Input id="careNeeds" name="careNeeds" value={editableResults.careNeeds} onChange={handleResultChange} className="bg-background"/> 
                 </div>
                 <div>
                   <Label htmlFor="suggestedPrice">Suggested Price ($)</Label>
                   <Input id="suggestedPrice" name="suggestedPrice" type="number" step="0.01" value={editableResults.suggestedPrice} onChange={handleResultChange} className="bg-background"/>
                 </div>
                 <div>
                   <Label htmlFor="confidence">AI Confidence</Label>
                   <Input id="confidence" name="confidence" type="number" step="0.01" value={editableResults.confidence} onChange={handleResultChange} readOnly className="bg-background"/>
                   <p className="text-xs text-muted-foreground">Confidence score from AI (0.0 - 1.0).</p>
                 </div>
                 <Button type="submit" form={formId} size="lg" className="w-full mt-6">Next: Confirm Details</Button>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 