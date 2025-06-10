"use client";

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SendHorizontal, Loader2 } from 'lucide-react'; // Added Loader2

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  // Optional: for AI suggestions as per prompt
  suggestions?: Array<{ plantName: string; score: number; explanation: string; imageUrl?: string }>; 
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoadingAiResponse, setIsLoadingAiResponse] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  // Initial greeting from AI
  useEffect(() => {
    setMessages([
      {
        id: 'initial-ai-greeting',
        sender: 'ai',
        text: "Hi there! I'm Planty, your personal plant assistant. How can I help you find the perfect plant today? You can ask me about plant types, care needs, or even describe what you're looking for!",
        timestamp: new Date(),
      },
    ]);
    console.log("ChatComponent: Initial AI greeting message set.");
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>, quickReplyText?: string) => {
    if (e) e.preventDefault();
    const currentInput = quickReplyText || input.trim();

    if (!currentInput) return;

    console.log(`ChatComponent: Handling submission. User input: '${currentInput}'`);

    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: currentInput,
      timestamp: new Date(),
    };
    // Add user message and set loading state immediately
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInput(''); // Clear input field
    setIsLoadingAiResponse(true);

    try {
      console.log("ChatComponent: Calling /api/chat/gemini with input:", currentInput);
      // Filter out the initial AI greeting message before sending history to the API
      const chatHistoryForAPI = messages
        .filter(msg => msg.id !== 'initial-ai-greeting') 
        .map(msg => ({ sender: msg.sender, text: msg.text }));
      
      const response = await fetch('/api/chat/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentInput, history: chatHistoryForAPI }), // Send current message and history
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("ChatComponent: API error:", errorData);
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("ChatComponent: API success, response data:", data);

      const aiResponseMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || "Sorry, I couldn't get a response.",
        timestamp: new Date(),
        // Map API suggestions to frontend Message suggestions format
        suggestions: data.suggestions?.map((s: any) => ({
          plantName: s.plantName || "Unknown Plant",
          explanation: s.reasoning || s.explanation || "No explanation provided.",
          score: s.score || 0, // Gemini might not provide a score directly, default to 0
          imageUrl: s.imageUrl || undefined, 
          // Add other fields if Gemini provides them and your UI can use them, e.g., careDifficulty
        })) || undefined,
      };
      setMessages((prevMessages) => [...prevMessages, aiResponseMessage]);

    } catch (error) {
      console.error("ChatComponent: Error calling chat API:", error);
      const errorMessageText = error instanceof Error ? error.message : "An unknown error occurred.";
      const aiErrorResponseMessage: Message = {
        id: `ai-error-${Date.now()}`,
        sender: 'ai',
        text: `Sorry, something went wrong: ${errorMessageText}`,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, aiErrorResponseMessage]);
    } finally {
      setIsLoadingAiResponse(false);
      console.log("ChatComponent: AI response processing finished.");
    }
  };

  const quickReplies = [
    "Tell me about sun-loving plants",
    "Plants for low light?",
    "Easy care plants for beginners",
    "Flowering plants for indoors",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,80px))] bg-background/90 text-foreground border-t">
      <ScrollArea className="flex-grow p-4 md:p-6" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/images/planty-icon.png" alt="Planty AI"/>
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-md lg:max-w-lg p-3 px-4 rounded-2xl shadow-sm \
                ${msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-card text-card-foreground rounded-bl-none border'}`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                {msg.sender === 'ai' && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground px-1">Here are a few ideas:</p>
                    {msg.suggestions.map((suggestion, index) => (
                      <div 
                        key={index} 
                        className="group p-3 rounded-lg border bg-background/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-200 ease-in-out flex items-start gap-3"
                      >
                        {suggestion.imageUrl && (
                           <Avatar className="h-16 w-16 rounded-md flex-shrink-0 border">
                            <AvatarImage src={suggestion.imageUrl} alt={suggestion.plantName} className="object-cover" />
                            <AvatarFallback className="rounded-md text-xs">{suggestion.plantName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-grow">
                          <p className="font-semibold text-foreground">{suggestion.plantName}</p>
                          <p className="text-xs text-muted-foreground mt-1 mb-2 line-clamp-2">{suggestion.explanation}</p>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-7 text-xs"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className={`text-xs mt-2 opacity-70 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoadingAiResponse && (
            <div className="flex items-end gap-2 justify-start">
               <Avatar className="h-8 w-8">
                  <AvatarImage src="/images/planty-icon.png" alt="Planty AI"/>
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              <div className="max-w-xs p-3 px-4 rounded-2xl shadow-sm bg-card text-card-foreground rounded-bl-none border flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2 text-primary" />
                <p className="text-sm">Planty is typing...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 md:p-4 border-t bg-background/80 sticky bottom-0">
        {/* Quick Replies Area */}
        {messages.length > 0 && messages[messages.length -1].sender === 'ai' && !isLoadingAiResponse && (
          <div className="pb-3 max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-background hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSubmit(undefined, reply)}
                >
                  {reply}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-3 max-w-4xl mx-auto">
          <Input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask Planty about a plant..."
            className="flex-grow rounded-full px-4 py-2 text-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Chat input"
          />
          <Button type="submit" size="icon" className="bg-primary text-primary-foreground rounded-full shrink-0" disabled={isLoadingAiResponse || !input.trim() }>
            <SendHorizontal className="h-5 w-5" />
            <span className="sr-only">Send Message</span>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat; 