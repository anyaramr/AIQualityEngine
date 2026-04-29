import { AiResponse } from "../types/ai-response";

export function validateNoDirectPageUsage(response: AiResponse) {
  const violations: string[] = [];

  for (const file of response.files) {
    if (!file.path.includes("/tests/")) continue;

    const content = file.content;

    const forbidden = [
      /page\.locator\s*\(/,
      /page\.getByRole\s*\(/,
      /page\.getByLabel\s*\(/,
      /page\.getByText\s*\(/,
      /page\.click\s*\(/,
    ];

    for (const pattern of forbidden) {
      if (pattern.test(content)) {
        violations.push(
          `${file.path}: direct page usage detected in spec`
        );
      }
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `Generated code failed spec abstraction validation:\n\n${violations.join("\n")}`
    );
  }
}