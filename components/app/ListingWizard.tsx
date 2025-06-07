'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ListingData } from '@/app/app/seller/upload/page'; // Import shared types

interface ListingWizardProps {
  initialData: Partial<ListingData>;
  onSave: (updatedData: Partial<ListingData>) => void;
  onBack: () => void;
}

export default function ListingWizard({ initialData, onSave, onBack }: ListingWizardProps) {
  const [formData, setFormData] = useState<Partial<ListingData>>(initialData);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: name === 'suggestedPrice' || name === 'confidence' ? parseFloat(value) : value,
    }));
  };

  const handleSelectChange = (name: keyof ListingData) => (value: string) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    console.log("ListingWizard: Saving data", formData);
    onSave(formData);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Edit Listing Details</CardTitle>
        <CardDescription>Review and adjust the AI-suggested details for your plant listing.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="listing-wizard-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="species">Species</Label>
            <Input 
              id="species" 
              name="species" 
              value={formData.species || ''} 
              onChange={handleChange} 
            />
          </div>
          <div>
            <Label htmlFor="careNeeds">Care Needs</Label>
            {/* Using Input for now, can be changed to Textarea if needed */}
            <Input 
              id="careNeeds" 
              name="careNeeds" 
              value={formData.careNeeds || ''} 
              onChange={handleChange} 
            />
          </div>
          <div>
            <Label htmlFor="suggestedPrice">Price ($)</Label>
            <Input 
              id="suggestedPrice" 
              name="suggestedPrice" 
              type="number" 
              step="0.01" 
              value={formData.suggestedPrice || 0} 
              onChange={handleChange} 
            />
          </div>
          <div>
            <Label htmlFor="light_level">Light Level</Label>
            <Select name="light_level" value={formData.light_level || ""} onValueChange={handleSelectChange('light_level')}>
              <SelectTrigger id="light_level">
                <SelectValue placeholder="Select light level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="size">Size</Label>
            <Select name="size" value={formData.size || ""} onValueChange={handleSelectChange('size')}>
              <SelectTrigger id="size">
                <SelectValue placeholder="Select plant size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Small">Small</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="watering_frequency">Watering Frequency</Label>
            <Select name="watering_frequency" value={formData.watering_frequency || ""} onValueChange={handleSelectChange('watering_frequency')}>
              <SelectTrigger id="watering_frequency">
                <SelectValue placeholder="Select watering frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Bi-Weekly">Bi-Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Add more fields here as needed from ListingData, e.g., custom description, tags */}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button /*variant="outline"*/ onClick={onBack} className="force-outline-button">Back</Button>
        <Button type="submit" form="listing-wizard-form" className="force-primary-button">Save & Preview</Button>
      </CardFooter>
    </Card>
  );
} 