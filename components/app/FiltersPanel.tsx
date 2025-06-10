'use client';

import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Filters } from '@/types';

interface FiltersPanelProps {
  onChange: (filters: Filters) => void;
  initialFilters?: Filters;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({ onChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  // console.log('FiltersPanel initialized with filters:', filters); // Can be noisy, commented out for now

  // Effect to synchronize internal state if initialFilters prop changes from parent
  useEffect(() => {
    // Only update if there's an actual change to avoid potential loops if objects are new but equal
    if (JSON.stringify(filters) !== JSON.stringify(initialFilters)) {
        console.log('[FiltersPanel] initialFilters prop changed, syncing internal state:', initialFilters);
        setFilters(initialFilters);
    }
  }, [initialFilters, filters]);

  const sizeMap: { [key: number]: string } = {
    1: 'Small',
    2: 'Medium',
    3: 'Large'
  };

  const reverseSizeMap: { [key: string]: number } = {
    'Small': 1,
    'Medium': 2,
    'Large': 3
  };

  const handleFilterChange = (key: keyof Filters, value: string | string[]) => {
    // Special handling for checkbox which might return an array if multiple are checked under the same key (not current setup)
    // or a boolean for single checkbox, which we interpret as string presence/absence
    // For now, assuming single string value for simplicity as per current shadcn Checkbox setup.
    // If it's an array (e.g. from a multi-select), we'd join it or handle it differently.
    const newValue = Array.isArray(value) ? value.join(',') : value;
    setFilters((prev) => {
      const updatedFilters = { ...prev, [key]: newValue };
      console.log('Filter changed:', updatedFilters);
      onChange(updatedFilters);
      return updatedFilters;
    });
  };

 const handleSliderChange = (key: keyof Filters, value: number[]) => {
    const numericValue = value[0]; // Slider returns an array, take the first value
    const stringValue = sizeMap[numericValue] || ''; // Map to string like "Small", "Medium", "Large"
    setFilters((prev) => {
      const updatedFilters = { ...prev, [key]: stringValue };
      console.log('Filter changed (slider - size):', updatedFilters);
      onChange(updatedFilters);
      return updatedFilters;
    });
  };

  const clearFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    console.log('Filters cleared');
    onChange(clearedFilters);
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-lg border h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Filter Plants</h2>
      <div className="space-y-6 flex-grow overflow-y-auto pr-2">
        <div>
          <Label htmlFor="lightLevel-low" className="text-sm font-medium">Light Level</Label>
          <div className="mt-2 space-y-2">
            {[ 'Low', 'Medium', 'High'].map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={`lightLevel-${level.toLowerCase()}`}
                  checked={filters.lightLevel === level}
                  onCheckedChange={(checked) => {
                    // If checked is true, set it; if false (unchecked), remove the filter or set to undefined
                    handleFilterChange('lightLevel', checked ? level : '');
                  }}
                />
                <Label htmlFor={`lightLevel-${level.toLowerCase()}`} className="text-sm font-medium cursor-pointer">
                  {level}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="size-slider" className="text-sm font-medium">Size</Label>
           <Slider
            id="size-slider"
            // Convert string "Small", "Medium", "Large" back to numeric for slider
            value={filters.size ? [reverseSizeMap[filters.size] || 1] : [1]}
            min={1}
            max={3}
            step={1}
            onValueChange={(value) => handleSliderChange('size', value)}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Small</span>
            <span>Medium</span>
            <span>Large</span>
          </div>
        </div>

        <div>
          <Label htmlFor="wateringFrequency-select" className="text-sm font-medium">Watering Frequency</Label>
          <Select
            value={filters.wateringFrequency || ''}
            onValueChange={(value) => handleFilterChange('wateringFrequency', value)}
          >
            <SelectTrigger id="wateringFrequency-select" className="w-full mt-2">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button variant="ghost" className="mt-6 w-full flex-shrink-0" onClick={clearFilters}>
        Clear All Filters
      </Button>
    </div>
  );
};

export default FiltersPanel; 