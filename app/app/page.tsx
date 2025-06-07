"use client"; // Added use client as per frontend rules for potential hooks

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from 'react'; // For logging component mount

/**
 * This is the main app home page, serving as a hero section.
 * The Header component is already included in the app/layout.tsx file.
 */
export default function AppPage() {
  useEffect(() => {
    console.log('AppPage layout rendered and component mounted');
  }, []);

  return (
    <main 
      className="flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-80px)]"
    >
      <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-6xl">
        {/* Content */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground drop-shadow-lg">
            Welcome to Planty
          </h1>
          <p className="text-lg md:text-xl text-foreground/95 max-w-2xl drop-shadow-md">
            Your personal plant assistant. Snap a photo to identify a plant, chat with our AI to find the perfect match, and get care reminders to help your green friends thrive.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/app/listings">Browse Plants</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/app/chat">PlantyAI</Link>
            </Button>
          </div>
        </div>
        
        {/* Image */}
        <div className="flex-1 flex justify-center items-center">
          <img 
            src="/images/plantybackground.png" 
            alt="Planty Infographic" 
            className="rounded-lg shadow-2xl w-full max-w-md"
          />
        </div>
      </div>
    </main>
  );
}

