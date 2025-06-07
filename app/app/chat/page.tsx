"use client";

import Chat from "@/components/app/Chat";
import { Toaster } from "@/components/ui/toaster";

export default function ChatPage() {
  console.log("ChatPage: Rendering ChatPage");
  return (
    <div className="h-full flex flex-col">
      <Chat />
      <Toaster />
    </div>
  );
} 