import { GoogleGenerativeAI } from "@google/generative-ai";
import { ALUMNI_DATA } from "../data/alumni";
import '../config/env'; // Ensure dotenv is loaded

const MAX_RETRIES = 3;

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function matchResumeToAlumni(resumeText: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API Key is not configured. Set GEMINI_API_KEY in your .env file.");
    }

    console.log('[AI Matcher] Using API key:', apiKey.substring(0, 8) + '...');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are an expert career and mentorship matching AI. 
    I will provide you with the text extracted from a student's resume, and a JSON list of available alumni mentors.
    
    Your task is to analyze the student's skills, experience, and interests from their resume, and match them with the top 3 most suitable alumni from the list.
    
    Alumni List:
    ${JSON.stringify(ALUMNI_DATA, null, 2)}
    
    Student Resume:
    ${resumeText}
    
    Return your response as a JSON array of objects, where each object has:
    - "alumnusId": The integer ID of the matched alumnus.
    - "matchPercentage": An integer between 0 and 100 representing how closely the student's background matches this alumnus.
    - "reason": A brief, compelling 1-2 sentence explanation of why this alumnus is a great match for the student based specifically on their resume and the alumnus's expertise.
    
    DO NOT wrap the response in markdown blocks like \`\`\`json. Just return the raw JSON array string.
  `;

    let lastError: any;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`[AI Matcher] Attempt ${attempt}/${MAX_RETRIES} - Calling Gemini API...`);
            const result = await model.generateContent(prompt);
            const responseText = result.response.text().trim();
            console.log('[AI Matcher] Gemini responded, length:', responseText.length);

            // Strip markdown formatting if the model still returns it
            const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
            return JSON.parse(cleanJson);
        } catch (error: any) {
            lastError = error;
            const isRateLimited = error?.status === 429
                || error?.message?.includes('429')
                || error?.message?.includes('Too Many Requests')
                || error?.message?.includes('quota');

            console.error(`[AI Matcher] Attempt ${attempt} failed:`, error?.message || error);

            if (isRateLimited && attempt < MAX_RETRIES) {
                // Parse retry delay from error, or fallback to 30s
                let delayMs = 30000;
                const retryMatch = error?.message?.match(/retry in ([\d.]+)s/i);
                if (retryMatch) {
                    delayMs = Math.ceil(parseFloat(retryMatch[1]) * 1000) + 2000;
                }
                console.warn(`[AI Matcher] Rate limited. Retrying in ${Math.round(delayMs / 1000)}s...`);
                await sleep(delayMs);
                continue;
            }

            if (attempt < MAX_RETRIES) {
                // For non-rate-limit errors, retry with a short delay
                console.warn(`[AI Matcher] Retrying in 3s...`);
                await sleep(3000);
                continue;
            }
        }
    }

    console.error("[AI Matcher] All retries exhausted. Full error:", JSON.stringify(lastError, null, 2));
    throw new Error(`AI matching failed: ${lastError?.message || 'Unknown error after all retries'}`);
}
