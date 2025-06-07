import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from 'next/server';

// Ensure the GEMINI_API_KEY is available
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

const MODEL_NAME = "models/gemini-2.5-flash-preview-05-20"; // Using the specified Gemini 2.5 Flash preview model
const API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

// Basic safety settings - adjust as needed
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export async function POST(request: Request) {
  console.log("API Route: /api/chat/gemini - POST request received");
  try {
    const { message, history } = await request.json();

    if (!message) {
      console.error("API Route: Bad request - message is missing");
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    console.log("API Route: User message:", message);
    console.log("API Route: Received history length:", history?.length || 0);

    // Prepare chat history for Gemini API
    // The SDK expects roles 'user' and 'model'.
    // Our frontend Chat.tsx uses 'user' and 'ai'. We need to map 'ai' to 'model'.
    const geminiHistory = history?.map((entry: { sender: string; text: string }) => ({
      role: entry.sender === 'ai' ? 'model' : 'user',
      parts: [{ text: entry.text }],
    })) || [];

    const chat = model.startChat({
      history: geminiHistory,
      generationConfig: {
        maxOutputTokens: 2048, // Increased from 1000
        temperature: 0.7, 
      },
      safetySettings,
      systemInstruction: {
        role: "user",
        parts: [{ text: "You are Planty, a friendly, enthusiastic, and knowledgeable AI assistant for an online plant shop. Your main goal is to help users discover the perfect plants for their needs, provide accurate plant care advice, and make their plant shopping experience delightful.\nYou should:\n- Be encouraging and positive.\n- Ask clarifying questions if the user's query is vague.\n- Provide clear and concise information.\n- If suggesting plants, try to briefly mention why it's a good fit for the user's described needs (e.g., \"A Snake Plant would be great for your low-light office because...\").\n- Avoid making up plant names or care information if you don't know. It's better to say you're unsure about a very specific or obscure query and perhaps suggest how the user might find that information or ask for more general needs.\n- Do not engage in conversations outside of plants, gardening, and plant care. If asked off-topic questions, politely steer the conversation back to plants.\n\nWhen you are providing specific plant recommendations in response to a user query, please format these recommendations as a JSON object within your response. The JSON object should be on its own line(s) and look like this:\n```json\n{\n  \"main_response_text\": \"Here are a few ideas based on what you're looking for...\",\n  \"recommendations\": [\n    {\n      \"plantName\": \"Example Plant Name\",\n      \"reasoning\": \"This plant is excellent because...\",\n      \"careDifficulty\": \"Easy\",\n      \"imageUrl\": \"https://example.com/image.jpg\"\n    }\n  ]\n}\n```\nEnsure the `main_response_text` contains your conversational lead-in to the recommendations. If you are not providing specific plant recommendations, respond normally as text." }],
      },
    });

    console.log("API Route: Sending message to Gemini model...");
    const result = await chat.sendMessage(message);
    const response = result.response;
    
    if (!response) {
        console.error("API Route: No response from Gemini model.");
        return NextResponse.json({ error: "Failed to get response from AI" }, { status: 500 });
    }

    const rawText = response.text();
    console.log("API Route: Gemini raw response text:", rawText);

    // Attempt to parse structured JSON if present
    let replyText = rawText;
    let recommendations = null;

    try {
      // Primary attempt: Regex to find a JSON block explicitly marked with ```json
      const jsonBlockRegex = /```json\n(\{[\s\S]*?\})\n```/;
      const jsonMatch = rawText.match(jsonBlockRegex);
      
      if (jsonMatch && jsonMatch[1]) {
        const jsonString = jsonMatch[1];
        const parsedJson = JSON.parse(jsonString);
        if (parsedJson.main_response_text && parsedJson.recommendations) {
          replyText = parsedJson.main_response_text;
          recommendations = parsedJson.recommendations;
          console.log("API Route: Parsed structured recommendations from ```json block:", recommendations);
        } else {
          console.warn("API Route: Found ```json block, but main_response_text or recommendations missing.");
        }
      } else {
        // Fallback: if no ```json block, try to see if the *entire* response is a valid JSON object
        // This is less likely given the current prompting but can be a safeguard.
        // Only attempt this if the rawText starts with { and ends with } to minimize parsing errors.
        const trimmedRawText = rawText.trim();
        if (trimmedRawText.startsWith('{') && trimmedRawText.endsWith('}')) {
          console.log("API Route: No ```json block found, attempting to parse entire response as JSON.");
          const parsedJson = JSON.parse(trimmedRawText);
          if (parsedJson.main_response_text && parsedJson.recommendations) {
            replyText = parsedJson.main_response_text;
            recommendations = parsedJson.recommendations;
            console.log("API Route: Parsed structured recommendations (entire response method):", recommendations);
          } else if (parsedJson.recommendations) { 
            replyText = "Here are some suggestions:"; // Default if no main_response_text
            recommendations = parsedJson.recommendations;
            console.log("API Route: Parsed direct recommendations array (entire response method):", recommendations);
          } else {
            console.warn("API Route: Entire response parsed as JSON, but expected fields missing.");
          }
        } else {
          console.log("API Route: No valid JSON block found using primary or fallback methods. Using raw text.");
        }
      }
    } catch (e) {
      console.warn(`API Route: Could not parse JSON from response. Error: ${e instanceof Error ? e.message : String(e)}. Using raw text.`);
      // replyText remains rawText, recommendations remains null
    }

    return NextResponse.json({ reply: replyText, suggestions: recommendations });
  } catch (error) {
    console.error("API Route: Error processing chat request:", error);
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: "Failed to process chat request", details: errorMessage }, { status: 500 });
  }
}

// Optional: GET handler for testing or other purposes
export async function GET() {
  console.log("API Route: /api/chat/gemini - GET request received");
  return NextResponse.json({ message: "Planty Gemini Chat API is active. Use POST to send messages." });
} 