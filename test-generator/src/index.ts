import fs from "fs";
import path from "path";
import { generatePlaywrightPom } from "./services/ai.service";
import { AiResponse, GeneratedFile } from "./types/ai-response";
import { validateResponseShape } from "./validators/response.validator";
import { validateRequiredFiles } from "./validators/files.validator";
import { validateHooks } from "./validators/hooks.validator";
import {
  validateDataImports,
  validateDataOwnership,
  validateStructuredDataCalls,
} from "./validators/data.validator";
import { validateNoDirectPageUsage } from "./validators/spec.validator";

function writeGeneratedFiles(files: GeneratedFile[]) {
    for (const file of files) {
        const filePath = path.resolve(file.path);
        const dir = path.dirname(filePath);

        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, file.content, "utf-8");

        console.log(`Created: ${file.path}`);
    }
}

async function run() {
    const requirement = process.argv.slice(2).join(" ");

    if (!requirement) {
        console.log("Please provide a requirement.");
        return;
    }

    const result = await generatePlaywrightPom(requirement);

    if (!result) {
        throw new Error("No response received from AI.");
    }

    const parsed = JSON.parse(result) as AiResponse;

    console.log(`Generated test: ${parsed.featureName}`);
    validateResponseShape(parsed);
    validateRequiredFiles(parsed);
    validateHooks(parsed);
    validateDataImports(parsed);
    validateDataOwnership(parsed);
    validateStructuredDataCalls(parsed);
    validateNoDirectPageUsage(parsed);

    writeGeneratedFiles(parsed.files);
}

run().catch((error) => {
    console.error("Error:", error.message);
});

