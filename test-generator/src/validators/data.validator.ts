import { AiResponse } from "../types/ai-response";

export function validateDataImports(response: AiResponse) {
  const generatedPaths = new Set(response.files.map((file) => file.path));
  const violations: string[] = [];

  for (const file of response.files) {
    const importRegex = /from\s+["'](\.\.\/data\/[^"']+)["']/g;
    let match: RegExpExecArray | null;

    while ((match = importRegex.exec(file.content)) !== null) {
      const importPath = match[1];

      const expectedPath = `generated/data/${importPath
        .replace("../data/", "")
        .replace(/^\.\//, "")}.ts`;

      if (!generatedPaths.has(expectedPath)) {
        violations.push(
          `${file.path}: imports ${importPath}, but ${expectedPath} was not generated`
        );
      }
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `Generated code failed data import validation:\n\n${violations.join("\n")}`
    );
  }
}

export function validateDataOwnership(response: AiResponse) {
  const violations: string[] = [];

  for (const file of response.files) {
    const content = file.content;

    const invalidUserImport =
      /import\s+\{[^}]*validUser[^}]*\}\s+from\s+["']\.\.\/data\/projects\.data["']/;

    const invalidProjectImport =
      /import\s+\{[^}]*project[^}]*\}\s+from\s+["']\.\.\/data\/users\.data["']/;

    if (invalidUserImport.test(content)) {
      violations.push(
        `${file.path}: validUser imported from projects.data`
      );
    }

    if (invalidProjectImport.test(content)) {
      violations.push(
        `${file.path}: project data imported from users.data`
      );
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `Generated code failed data ownership validation:\n\n${violations.join("\n")}`
    );
  }
}

export function validateStructuredDataCalls(response: AiResponse) {
  const violations: string[] = [];

  for (const file of response.files) {
    const content = file.content;

    if (/loginPage\.login\s*\(\s*[^,)]+\.email\s*,\s*[^,)]+\.password\s*\)/.test(content)) {
      violations.push(
        `${file.path}: loginPage.login must receive the full user object, not email/password fields`
      );
    }

    if (/projectsPage\.createProject\s*\(\s*[^,)]+\.name\s*\)/.test(content)) {
      violations.push(
        `${file.path}: projectsPage.createProject must receive the full project object, not project.name`
      );
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `Generated code failed structured data call validation:\n\n${violations.join("\n")}`
    );
  }
}