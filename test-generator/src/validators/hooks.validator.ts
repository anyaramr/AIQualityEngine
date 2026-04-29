import { AiResponse } from "../types/ai-response";

export function validateHooks(response: AiResponse) {
  const specFiles = response.files.filter((file) =>
    file.path.includes("/tests/")
  );

  const errors: string[] = [];

  for (const file of specFiles) {
    const content = file.content;

    const hasAuthenticatedDescribe = /test\.describe\(\s*["'`]Authenticated/i.test(
      content
    );

    const hasBeforeEach = /test\.beforeEach\s*\(/.test(content);

    if (hasAuthenticatedDescribe && !hasBeforeEach) {
      errors.push(`${file.path}: Authenticated describe missing beforeEach`);
    }

    const contentWithoutHooks = content.replace(
      /test\.beforeEach\s*\([\s\S]*?\n\s*\}\s*\)\s*;/g,
      ""
    );

    const testBlocks = contentWithoutHooks.match(
      /test\s*\(\s*["'`][\s\S]*?\}\s*\)\s*;/g
    );

    if (!testBlocks) continue;

    for (const testBlock of testBlocks) {
      const hasLoginInsideTest =
        /loginPage\.goto\s*\(/.test(testBlock) ||
        /loginPage\.login\s*\(/.test(testBlock);

      const isAuthValidationTest =
        /invalid|credentials|login validation|authentication|auth/i.test(
          testBlock
        );

      if (hasBeforeEach && hasLoginInsideTest && !isAuthValidationTest) {
        errors.push(`${file.path}: login steps duplicated inside tests`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Hook validation failed:\n\n${errors.join("\n")}`);
  }
}