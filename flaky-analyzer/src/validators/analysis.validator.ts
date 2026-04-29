import { FailureAnalysis } from "../types/failure-analysis";

export function validateFailureAnalysis(result: FailureAnalysis) {
  const errors: string[] = [];

  if (!result.failureType) errors.push("Missing failureType");
  if (!result.likelyRootCause) errors.push("Missing likelyRootCause");
  if (!result.confidence) errors.push("Missing confidence");
  if (typeof result.isLikelyFlaky !== "boolean") {
    errors.push("isLikelyFlaky must be boolean");
  }
  if (!result.whyFlakyOrNot) errors.push("Missing whyFlakyOrNot");
  if (!result.suggestedFix) errors.push("Missing suggestedFix");
  if (!result.recommendedCodeChange) {
    errors.push("Missing recommendedCodeChange");
  }

  if (errors.length > 0) {
    throw new Error(`Failure analysis validation failed:\n\n${errors.join("\n")}`);
  }
}