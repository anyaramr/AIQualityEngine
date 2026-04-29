import OpenAI from "openai";
import "dotenv/config";
import { FailureContext } from "../types/failure-analysis";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export async function analyzeFailure(failure: FailureContext): Promise<string | null> {

  const prompt = `
You are a senior QA automation engineer specialized in Playwright.

Analyze this Playwright failure log.

Return ONLY valid JSON:
{
  "failureType": "timeout | locator | assertion | navigation | authentication | test-data | environment | unknown",
  "likelyRootCause": "string",
  "confidence": "low | medium | high",
  "isLikelyFlaky": true,
  "whyFlakyOrNot": "string",
  "suggestedFix": "string",
  "recommendedCodeChange": "string"
}

Rules:
- Do not invent details not present in the log
- Be specific to Playwright
- If unsure, use confidence "low"
- Keep the response concise
- Return only JSON

Failure context:
Test title: ${failure.testTitle}
Spec file: ${failure.specFile ?? "Unknown"}
Project: ${failure.projectName ?? "Unknown"}

Failure log:
${failure.errorMessage}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  return response.choices[0].message.content;
}