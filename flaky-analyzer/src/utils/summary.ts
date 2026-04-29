import { FailureAnalysis } from "../types/failure-analysis";

export function summarize(analyses: FailureAnalysis[]) {
  const summary = {
    total: analyses.length,
    byType: {} as Record<string, number>,
    flaky: 0,
    nonFlaky: 0,
  };

  for (const a of analyses) {
    summary.byType[a.failureType] =
      (summary.byType[a.failureType] || 0) + 1;

    if (a.isLikelyFlaky) summary.flaky++;
    else summary.nonFlaky++;
  }

  return summary;
}