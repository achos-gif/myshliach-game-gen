
import { GoogleGenAI, Type } from "@google/genai";
import { GameData, GameType, GameGenerationInput } from "../types";
import { GEMINI_MODEL } from "../constants";

/**
 * Generates game data using the Google Gemini API.
 */
export async function generateGameFromContent(input: GameGenerationInput, type: GameType): Promise<GameData> {
  // Always create a fresh instance to ensure we pick up the latest API key injected by the platform bridge
  // Check multiple sources for the API key to ensure compatibility with various environments
  let apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  // Runtime fallback for browser environments where env vars might be injected into window
  if (!apiKey && typeof window !== 'undefined') {
    const win = window as any;
    apiKey = win.GEMINI_API_KEY || win.API_KEY || (win.process && win.process.env && win.process.env.API_KEY);
  }
  
  if (!apiKey) {
    console.error("API Key Check Failed. Checked: import.meta.env.VITE_GEMINI_API_KEY, process.env.API_KEY, window.GEMINI_API_KEY");
    throw new Error("No API key detected. Please click the setup button to connect your key.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const typeSpecificInstructions = getInstructionsForType(type);
  const prompt = `You are a creative Jewish educator and game designer for MyShliach. 
  Create a ${type} game for students (ages 8-12) based on the provided Koivetz content.
  The Koivetz usually contains stories of Tzaddikim, Sichos, or Halachos.
  
  Activity Requirements for ${type}:
  ${typeSpecificInstructions}
  
  Mentor Corner Requirement:
  Provide a 'mentorKey' with 5-10 bullet points that help a mentor summarize the main lesson or discuss the core values of the story with their student.
  
  Ensure all content is engaging, accurate to the source, and uses appropriate terminology.
  Return only JSON matching the schema.`;

    const parts: any[] = [{ text: prompt }];

    if (input.type === 'text') {
      parts.push({ text: `Source content:\n${input.value}` });
    } else {
      parts.push({
        inlineData: {
          mimeType: input.mimeType,
          data: input.data,
        },
      });
    }

    try {
      let lastError: any;
      // Retry up to 3 times for robustness
      for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: { parts },
          config: {
            responseMimeType: "application/json",
            responseSchema: gameSchema as any,
          },
        });

        const text = response.text;
        if (!text) {
          throw new Error("The AI returned an empty response.");
        }

        return JSON.parse(text) as GameData;
      } catch (error: any) {
        console.warn(`Attempt ${attempt + 1} failed:`, error);
        lastError = error;
        
        // Don't retry if it's an API key or permission issue
        if (error.message?.includes("not found") || error.message?.includes("key") || error.message?.includes("API_KEY") || error.message?.includes("403")) {
          throw error;
        }
        
        // If it's the last attempt, don't wait
        if (attempt === 2) break;
        
        // Wait a short bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw lastError || new Error("Failed to generate game after multiple attempts.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error.message?.includes("not found") || error.message?.includes("key") || error.message?.includes("API_KEY")) {
      throw new Error("Invalid API Key. Please select a billing-enabled API key to continue.");
    }
    
    throw new Error(error.message || "Something went wrong while creating your game.");
  }
}

// Helper function to get specific instructions for each game type
const getInstructionsForType = (type: GameType): string => {
  switch (type) {
    case GameType.QUIZ:
      return "Generate 10 multiple-choice questions with 4 options each, one correct answer, and a short explanation.";
    case GameType.TRUE_FALSE:
      return "Generate 10 true or false statements using the quizContent format with 2 options: 'True' and 'False'.";
    case GameType.MATCHING:
    case GameType.MEMORY:
      return "Generate 8-10 pairs of distinct terms and their corresponding definitions.";
    case GameType.SEQUENCE:
      return "Generate 5-7 segments of a story or process that must be arranged in chronological order (order 1-7).";
    case GameType.WORD_SEARCH:
      return "Extract a list of 12-15 thematic words related to the content for a word search.";
    case GameType.SORTING:
      return "Define 2-3 logical categories and 12 items that each belong to one category.";
    case GameType.UNSCRAMBLE:
      return "Select 10 key vocabulary words to unscramble with a short hint for each.";
    case GameType.FILL_IN_BLANK:
      return "Generate a story summary with 6-8 missing words. Return full text split into segments and the missing words.";
    case GameType.RIDDLE:
      return "Create 5 riddles. Each must have 3 clues and an answer.";
    case GameType.CROSSWORD:
      return "Provide a list of 8-10 words and their clues.";
    case GameType.EMOJI_CHALLENGE:
      return "Generate 8 challenges where emojis represent a concept. Provide 4 options.";
    case GameType.TRIVIA_TRAIL:
      return "Generate 10 trivia questions that serve as steps on a journey.";
    case GameType.FIND_MATCH:
      return "Extract 20-30 distinct terms for a fast matching game.";
    default:
      return "Create an engaging educational activity.";
  }
};

const gameSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    instructions: { type: Type.STRING },
    type: { type: Type.STRING, enum: Object.values(GameType) },
    mentorKey: { type: Type.ARRAY, items: { type: Type.STRING } },
    quizContent: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["question", "options", "correctAnswer"]
      }
    },
    matchingContent: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          term: { type: Type.STRING },
          definition: { type: Type.STRING }
        },
        required: ["id", "term", "definition"]
      }
    },
    sequenceContent: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING },
          order: { type: Type.INTEGER }
        },
        required: ["id", "text", "order"]
      }
    },
    sortingContent: {
      type: Type.OBJECT,
      properties: {
        categories: { type: Type.ARRAY, items: { type: Type.STRING } },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["id", "text", "category"]
          }
        }
      },
      required: ["categories", "items"]
    },
    unscrambleContent: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          original: { type: Type.STRING },
          hint: { type: Type.STRING }
        },
        required: ["id", "original", "hint"]
      }
    },
    wordSearchContent: { type: Type.ARRAY, items: { type: Type.STRING } },
    fillBlankContent: {
      type: Type.OBJECT,
      properties: {
        storySegments: { type: Type.ARRAY, items: { type: Type.STRING } },
        missingWords: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["storySegments", "missingWords"]
    },
    riddleContent: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          clues: { type: Type.ARRAY, items: { type: Type.STRING } },
          answer: { type: Type.STRING }
        },
        required: ["id", "clues", "answer"]
      }
    },
    crosswordContent: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          clue: { type: Type.STRING }
        },
        required: ["word", "clue"]
      }
    },
    emojiContent: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          emojis: { type: Type.STRING },
          answer: { type: Type.STRING },
          hint: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["id", "emojis", "answer", "hint", "options"]
      }
    },
    triviaTrailContent: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING }
        },
        required: ["id", "question", "options", "correctAnswer"]
      }
    },
    findMatchContent: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["title", "instructions", "type", "mentorKey"]
};
