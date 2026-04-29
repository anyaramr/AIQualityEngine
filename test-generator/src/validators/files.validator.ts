import { AiResponse } from "../types/ai-response";

export function validateRequiredFiles(response: AiResponse) {
  const paths = response.files.map((file) => file.path);
  const errors: string[] = [];

  const hasSpec = paths.some((path) => path.includes("generated/tests/"));
  const hasPage = paths.some((path) => path.includes("generated/pages/"));
  const hasFixture = paths.includes("generated/fixtures/test-fixtures.ts");
  const hasData = paths.some((path) => path.includes("generated/data/"));

  if (!hasSpec) errors.push("Missing spec file in generated/tests");
  if (!hasPage) errors.push("Missing page object file in generated/pages");
  if (!hasFixture) errors.push("Missing generated/fixtures/test-fixtures.ts");
  if (!hasData) errors.push("Missing data file in generated/data");

  if (errors.length > 0) {
    throw new Error(`Required files validation failed:\n\n${errors.join("\n")}`);
  }
}