import fs from "fs";
import path from "path";
import { analyzeFailure } from "./services/ai.service";
import {
  extractFailuresFromJson,
  readFailureLog,
} from "./utils/failure-parser";
import { FailureAnalysis, FailureContext } from "./types/failure-analysis";
import { validateFailureAnalysis } from "./validators/analysis.validator";
import { summarize } from "./utils/summary";

async function run() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    console.log("Usage: npm run analyze -- path/to/results.json");
    return;
  }

  let failures: FailureContext[] = [];

  if (inputPath.endsWith(".json")) {
    failures = extractFailuresFromJson(inputPath);
  } else {
    failures = [
      {
        testTitle: "Manual log analysis",
        status: "failed",
        errorMessage: readFailureLog(inputPath),
      },
    ];
  }

  if (failures.length === 0) {
    console.log("No failures found.");
    return;
  }

  const analyses: FailureAnalysis[] = [];

  for (const failure of failures) {
    const result = await analyzeFailure(failure);
    if (!result) continue;

    const parsed = JSON.parse(result) as FailureAnalysis;

    parsed.testTitle = parsed.testTitle || failure.testTitle;
    parsed.specFile = parsed.specFile || failure.specFile;
    parsed.projectName = parsed.projectName || failure.projectName;

    validateFailureAnalysis(parsed);
    analyses.push(parsed);
  }

  const summary = summarize(analyses);

  const report = {
    generatedAt: new Date().toISOString(),
    summary,
    analyses,
  };

  const reportPath = path.resolve("analysis-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  fs.writeFileSync(
    path.resolve("ui/analysis-report.json"),
    JSON.stringify(report, null, 2),
  );

  console.log("\n=== Summary ===\n");
  console.log(JSON.stringify(summary, null, 2));
  console.log(`\nReport saved to: ${reportPath}`);
}

run().catch((error) => {
  console.error("Error:", error.message);
});
