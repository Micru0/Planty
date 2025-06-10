'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CareTask } from '@/types/care-calendar.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export interface PlantCareSummary {
  listingId: string;
  species: string;
  imageUrl?: string;
  tasks: CareTask[];
}

interface PlantCareCardProps {
  plantSummary: PlantCareSummary;
}

export function PlantCareCard({ plantSummary }: PlantCareCardProps) {
  const { listingId, species, imageUrl, tasks } = plantSummary;

  const overdueCount = tasks.filter(t => new Date(t.due_date) < new Date(new Date().setHours(0, 0, 0, 0)) && !t.completed).length;
  const todayCount = tasks.length - overdueCount;

  return (
    <Card className="overflow-hidden">
      <Link href={`/app/care-calendar/${listingId}`} className="block hover:bg-muted/50 transition-colors">
        <div className="grid grid-cols-3">
          <div className="col-span-1 relative h-full min-h-[120px]">
            <Image
              src={imageUrl || 'https://picsum.photos/seed/plant/200/300'}
              alt={species}
              fill
              className="object-cover"
            />
          </div>
          <div className="col-span-2">
            <CardHeader>
              <CardTitle>{species}</CardTitle>
              <CardDescription>
                {tasks.length} action(s) due
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {overdueCount > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {overdueCount} Overdue
                  </Badge>
                )}
                {todayCount > 0 && (
                   <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {todayCount} Today
                  </Badge>
                )}
              </div>
            </CardContent>
          </div>
        </div>
      </Link>
    </Card>
  );
} 