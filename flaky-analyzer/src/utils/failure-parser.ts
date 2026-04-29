import fs from "fs";
import { FailureContext } from "../types/failure-analysis";

export function readFailureLog(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  return fs.readFileSync(filePath, "utf-8");
}

export function extractFailuresFromJson(jsonPath: string): FailureContext[] {
  const raw = readFailureLog(jsonPath);
  const parsed = JSON.parse(raw);

  const failures: FailureContext[] = [];

  function walk(node: any, context: Partial<FailureContext> = {}) {
    if (!node || typeof node !== "object") return;

    const nextContext = {
      ...context,
      testTitle: node.title || context.testTitle,
      specFile: node.file || context.specFile,
      projectName: node.projectName || context.projectName,
      status: node.status || context.status,
    };

    if (node.status === "failed") {
      const errorMessage =
        node.error?.message ||
        node.error?.stack ||
        node.errors?.map((e: any) => e.message || e.stack).join("\n") ||
        JSON.stringify(node, null, 2);

      failures.push({
        testTitle: nextContext.testTitle || "Unknown test",
        specFile: nextContext.specFile,
        projectName: nextContext.projectName,
        status: "failed",
        errorMessage,
      });
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        value.forEach((child) => walk(child, nextContext));
      } else if (value && typeof value === "object") {
        walk(value, nextContext);
      }
    }
  }

  walk(parsed);

  return failures;
}