'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ListingData } from '@/app/app/seller/upload/page'; // Import shared types
import { Textarea } from '@/components/ui/textarea'; // Import Textarea

// Duplicating this interface as a workaround for module resolution issues.
interface ActionableTask {
  title: string;
  description: string;
  frequency_days: number;
  is_optional: boolean;
}

interface ListingWizardProps {
  initialData: Partial<ListingData>;
  onSave: (updatedData: Partial<ListingData>) => void;
  onBack: () => void;
}

export default function ListingWizard({ initialData, onSave, onBack }: ListingWizardProps) {
  const [formData, setFormData] = useState<Partial<ListingData>>(initialData);

  useEffect(() => {
    // When initialData changes (i.e., new AI results arrive), update the form.
    let combinedCareDetails = '';
    if (initialData.actionable_tasks || initialData.care_tips) {
      const tasksHeader = 'Actionable Tasks:';
      const tipsHeader = '\nGeneral Care Tips:';
      
      const tasks = (initialData.actionable_tasks as ActionableTask[] | undefined)?.map(task => `- ${task.title}: ${task.description}`).join('\n') || '';
      const tips = initialData.care_tips?.map(tip => `- ${tip}`).join('\n') || '';

      combinedCareDetails = `${tasksHeader}\n${tasks}\n${tipsHeader}\n${tips}`;
    }

    setFormData({
      ...initialData,
      care_details: initialData.care_details || combinedCareDetails,
    });
  }, [initialData]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
  };

  const handleTagsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      tags: value.split(',').map(tag => tag.trim()),
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
            <Label htmlFor="care_details">Care Details</Label>
            <Textarea
              id="care_details" 
              name="care_details" 
              value={formData.care_details || ''} 
              onChange={handleChange}
              rows={4}
              placeholder="e.g., Loves bright, indirect light. Water when top 2 inches of soil are dry."
            />
          </div>
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags?.join(', ') || ''}
              onChange={handleTagsChange}
              placeholder="e.g., low-light, pet-friendly, air-purifying"
            />
          </div>
          <div>
            <Label htmlFor="price">Price ($)</Label>
            <Input 
              id="price" 
              name="price" 
              type="number" 
              step="0.01" 
              value={formData.price || ''} 
              onChange={handleChange}
              placeholder="e.g., 25.99"
              required
            />
          </div>
          <div>
            <Label htmlFor="light_level">Light Level</Label>
            <Select name="light_level" value={formData.light_level} onValueChange={handleSelectChange('light_level')}>
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
            <Select name="size" value={formData.size} onValueChange={handleSelectChange('size')}>
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
            <Select name="watering_frequency" value={formData.watering_frequency} onValueChange={handleSelectChange('watering_frequency')}>
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