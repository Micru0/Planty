import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from 'next/server';

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

const MODEL_NAME = "models/gemini-2.5-flash-preview-05-20";
const API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    generationConfig: {
        responseMimeType: "application/json",
    },
});

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

const systemPrompt = `You are an expert botanist AI for an online plant marketplace called Planty.
Your primary goal is to provide highly accurate, specific, and comprehensive information for a plant seller.
Analyze the image provided and return a single, well-formed JSON object.

- Identify the plant's full scientific and common name with precision.
- For \`actionable_tasks\`, provide a fun, simple, kid-friendly \`title\`, detailed \`description\`, the \`frequency_days\` as an integer, and an \`is_optional\` boolean flag for non-essential suggestions like fertilizing.
- Provide essential general \`care_tips\`. These are non-actionable pieces of advice for the plant's well-being.
- Infer the plant's needs based on its species (light, size, watering).
- Generate relevant tags for discoverability.

The \`light_level\` MUST be one of the following strings: "Low", "Medium", "High".
The \`size\` MUST be one of the following strings, representing the typical mature size category for this species: "Small", "Medium", "Large".
The \`watering_frequency\` MUST be one of the following strings: "Daily", "Weekly", "Bi-Weekly", "Monthly".

Your response must be a single JSON object with the following structure:
{
  "plantName": "Red Vein Prayer Plant (Maranta leuconeura 'Erythroneura')",
  "actionable_tasks": [
    {
      "title": "Time for a drink!",
      "description": "Water thoroughly when the top 1-2 inches of soil are dry. Prayer plants prefer consistently moist but not waterlogged soil.",
      "frequency_days": 10,
      "is_optional": false
    },
    {
      "title": "A little boost!",
      "description": "Fertilize every two weeks during the spring and summer growing season with a balanced, water-soluble fertilizer diluted to half-strength.",
      "frequency_days": 14,
      "is_optional": true
    },
    {
      "title": "Spa Day!",
      "description": "Wipe leaves with a damp cloth monthly to remove dust and help with photosynthesis. This also helps boost humidity.",
      "frequency_days": 30,
      "is_optional": false
    }
  ],
  "care_tips": [
    "Thrives in bright, indirect light. Avoid direct sunlight, which can scorch the leaves.",
    "Prefers high humidity. Group with other plants, use a pebble tray, or place a humidifier nearby.",
    "Use filtered, distilled, or rainwater to avoid brown leaf tips caused by minerals in tap water.",
    "This plant is non-toxic and pet-friendly, making it safe for homes with cats and dogs."
  ],
  "tags": ["Prayer Plant", "Maranta", "Pet-Friendly", "Humid-loving", "Low Light", "Houseplant"],
  "light_level": "Medium",
  "size": "Small",
  "watering_frequency": "Weekly"
}

Ensure the JSON is complete and valid. Do not include any text, notes, or explanations outside of the JSON object itself.`;


async function fileToGenerativePart(file: File) {
    const base64EncodedData = await file.arrayBuffer().then(buffer => Buffer.from(buffer).toString('base64'));
    return {
      inlineData: {
        data: base64EncodedData,
        mimeType: file.type,
      },
    };
}

export async function POST(request: Request) {
    console.log("API Route: /api/vision/gemini - POST request received");

    try {
        const formData = await request.formData();
        const file = formData.get('image') as File | null;

        if (!file) {
            console.error("API Route: Bad request - image is missing");
            return NextResponse.json({ error: "Image file is required" }, { status: 400 });
        }
        
        console.log("API Route: Image received:", file.name, file.type);

        const imagePart = await fileToGenerativePart(file);

        const chat = model.startChat({
            history: [],
            safetySettings,
        });

        const prompt = `${systemPrompt}\n\nPlease analyze the attached image.`;

        console.log("API Route: Sending image and prompt to Gemini model...");
        const result = await chat.sendMessage([prompt, imagePart]);

        const response = result.response;
        const text = response.text();

        console.log("API Route: Gemini raw response text:", text);

        const jsonResponse = JSON.parse(text);

        console.log("API Route: Parsed JSON response:", jsonResponse);

        return NextResponse.json(jsonResponse);

    } catch (error) {
        console.error("API Route: Error processing vision request:", error);
        let errorMessage = "Internal Server Error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ error: "Failed to analyze image", details: errorMessage }, { status: 500 });
    }
} 