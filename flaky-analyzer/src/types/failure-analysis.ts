export type FailureContext = {
  testTitle: string;
  specFile?: string;
  projectName?: string;
  status: string;
  errorMessage: string;
};

export type FailureAnalysis = {
  testTitle: string;
  specFile?: string;
  projectName?: string;
  failureType: string;
  likelyRootCause: string;
  confidence: "low" | "medium" | "high";
  isLikelyFlaky: boolean;
  whyFlakyOrNot: string;
  suggestedFix: string;
  recommendedCodeChange: string;
};