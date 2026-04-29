export type MethodInventoryItem = {
  pageObject: string;
  actionMethods: string[];
  locatorMethods: string[];
};

export type Scenario = {
  title: string;
  type: "happy-path" | "negative" | "validation" | "edge-case";
  description: string;
};

export type GeneratedFile = {
  path: string;
  content: string;
};

export type AiResponse = {
  featureName: string;
  methodInventory?: MethodInventoryItem[];
  scenarios: Scenario[];
  files: GeneratedFile[];
};