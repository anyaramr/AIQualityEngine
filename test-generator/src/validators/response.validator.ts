import { AiResponse } from "../types/ai-response";

export function validateResponseShape(response: AiResponse) {
  const errors: string[] = [];

  if (!response.featureName) {
    errors.push("Missing featureName");
  }

  if (!Array.isArray(response.scenarios)) {
    errors.push("Missing scenarios array");
  }

  if (!Array.isArray(response.files)) {
    errors.push("Missing files array");
  }

  if (response.files?.length === 0) {
    errors.push("No files were generated");
  }

  if (errors.length > 0) {
    throw new Error(
      `Response shape validation failed:\n\n${errors.join("\n")}`,
    );
  }
}
