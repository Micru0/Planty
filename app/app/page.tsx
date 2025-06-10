"use client"; // Added use client as per frontend rules for potential hooks

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
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
      className="flex-1 flex flex-col items-center justify-center p-4"
    >
      <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-6xl">
        {/* Content */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
          <article className="prose lg:prose-xl dark:prose-invert">
            <h1>
              Welcome to Planty
            </h1>
            <p>
              Your personal plant assistant. Snap a photo to identify a plant, chat with our AI to find the perfect match, and get care reminders to help your green friends thrive.
            </p>
          </article>
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
          <Image 
            src="/images/plantybackground.png" 
            alt="Planty Infographic" 
            width={500}
            height={500}
            className="rounded-lg shadow-2xl w-full max-w-md"
          />
        </div>
      </div>
    </main>
  );
}

