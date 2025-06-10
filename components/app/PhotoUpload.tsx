'use client';

import { useState, ChangeEvent, FormEvent, DragEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud, Leaf } from 'lucide-react'; // For spinner and icons
import type { AiResults } from '@/app/app/seller/upload/page'; // Import shared types
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  onAnalysisComplete: (results: AiResults, imageFile: File) => void;
  formId: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onAnalysisComplete, formId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileSelect = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // Simulate progress for UI feedback
      let progressInterval = setInterval(() => {
        setProgress(prev => (prev >= 90 ? 90 : prev + 10));
      }, 500);

      const response = await fetch('/api/vision/gemini', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || `Request failed with status ${response.status}`);
      }

      const results: AiResults = await response.json();
      console.log("Received AI analysis results:", results);
      onAnalysisComplete(results, selectedFile);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Error analyzing image:", errorMessage);
      setError(`Analysis failed: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Upload Your Plant's Photo</CardTitle>
        <CardDescription>Our AI will analyze the image to suggest details for your listing.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id={formId} onSubmit={handleAnalyze} className="space-y-6">
          <div 
            className={cn(
              "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors",
              isDragging ? "border-primary bg-primary/10" : "border-gray-300 dark:border-gray-600",
              error ? "border-destructive" : ""
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="space-y-1 text-center">
              {preview ? (
                <>
                  <img src={preview} alt="Plant preview" className="mx-auto h-40 w-auto rounded-md object-cover" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-focus focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                    >
                      <span>Change image</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)} />
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-focus focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                    >
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>
          </div>
          
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          
          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">Analyzing, please wait...</p>
            </div>
          )}

          <div className="text-center">
            <Button 
              type="submit" 
              disabled={isAnalyzing || !selectedFile} 
              size="lg"
              variant="default"
              className="w-full force-primary-button"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : "Analyze Plant"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default PhotoUpload; 