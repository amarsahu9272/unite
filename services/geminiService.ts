
import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = ai.models;

export const uniteImages = async (image1: { base64: string; mimeType: string; }, image2: { base64: string; mimeType: string; }): Promise<string> => {
    const prompt = "Generate an image where the person from the first photo is hugging the person from the second photo. Make it look as if the two versions of the person are interacting naturally. Add a soft, natural lighting and replace the background with a smooth white one.";

    try {
        const response: GenerateContentResponse = await model.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: image1.base64,
                            mimeType: image1.mimeType,
                        },
                    },
                    {
                        inlineData: {
                            data: image2.base64,
                            mimeType: image2.mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        
        throw new Error("No image data found in the API response.");

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate image. Please try again.");
    }
};
