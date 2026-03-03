import { GoogleGenerativeAI } from "@google/generative-ai";
import '../config/env'; // Ensure dotenv is loaded

export async function generateProfileFromResume(resumeText: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API Key is not configured.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are an expert career profiler and mentorship coordinator.
    I will provide you with the text extracted from a student/alumni's resume.
    
    Your task is to analyze the resume and return a concise, structured profile JSON object.
    
    Student Resume:
    ${resumeText}
    
    Return your response as a single JSON object with the following EXACT keys:
    - "name": A string of their full name.
    - "status": A string of their current or most recent job title and company (e.g. "Software Engineer at Google").
    - "expertise": An array of strings containing their top 3-4 technical or professional skills.
    - "offering": A single, appealing sentence describing what mentorship or advice they can offer to junior students based on their background (e.g., "I can help with system design interviews and transitioning to Web3").
    
    DO NOT wrap the response in markdown blocks like \`\`\`json. Just return the raw JSON string. Ensure it is perfectly valid JSON.
  `;

    try {
        console.log('[AI Profile] Calling Gemini API...');
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        console.log('[AI Profile] Gemini responded, length:', responseText.length);

        const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        return JSON.parse(cleanJson);
    } catch (error: any) {
        console.error("[AI Profile] Gemini API Error:", error?.message || error);
        throw new Error(`AI profile generation failed: ${error?.message || 'Unknown error'}`);
    }
}
