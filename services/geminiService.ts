
import { GoogleGenAI } from "@google/genai";
import { ComparisonResult, GroundingSource } from "../types";

export async function compareVehicles(
  model1: string,
  model2: string,
  csvData?: string
): Promise<ComparisonResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    As an expert EV automotive industry analyst, compare:
    1. ${model1}
    2. ${model2}

    ${csvData ? `Reference this supplemental data: \n${csvData}\n` : ''}

    CRITICAL VALIDATION:
    Verify if both are valid electric two-wheelers. If invalid, start with: "VALIDATION_ERROR: [Reason]".

    IF VALID, YOU MUST USE THE EXACT LABELS BELOW WITHOUT ANY NUMBERS, BOLDING, OR MARKDOWN PREFIXES ON THE LABEL LINES:

    SIMILARITY_SCORE: [0-100]
    SCORE_RATIONALE: [One sentence explaining why this specific score was given]
    KEY_SIMILARITIES:
    * [Similarity 1]
    * [Similarity 2]
    KEY_DIFFERENCES:
    * [Difference 1]
    * [Difference 2]
    TECH_SPECS:
    | Feature | ${model1} | ${model2} |
    |---|---|---|
    | Battery | ... | ... |
    QUALITATIVE_EDGE:
    * [UI/UX Comment]
    * [Build/Ride Comment]

    STRICT RULES:
    - Do not use "1.", "2." etc. before the labels.
    - Labels must be on their own line or followed immediately by a colon.
    - Keep the output crisp and professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1, 
      },
    });

    const text = response.text || "No analysis generated.";
    
    if (text.includes("VALIDATION_ERROR:")) {
      const errorMsg = text.split("VALIDATION_ERROR:")[1].trim().split('\n')[0];
      throw new Error(`Model Validation Failed: ${errorMsg}`);
    }

    const scoreMatch = text.match(/SIMILARITY_SCORE:\s*(\d+)/i);
    const similarityScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
    
    let analysis = text
      .replace(/SIMILARITY_SCORE:\s*\d+/i, '')
      .trim();

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || 'Source',
        uri: chunk.web?.uri || ''
      }));

    return {
      similarityScore,
      analysis,
      sources
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to fetch comparison data.");
  }
}
