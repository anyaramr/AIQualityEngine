import OpenAI from "openai";
import * as dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function oldGeneratePlaywrightPom(requirement: string,
  htmlSnippet?: string) {
    
  const prompt = `
You are a senior QA automation engineer using Playwright, TypeScript, and Page Object Model.

Requirement:
"${requirement}"

HTML snippet:
${htmlSnippet ?? "No HTML snippet provided."}

Generate production-quality Playwright code with reusable test data files.

Return ONLY valid JSON:
{
  "featureName": "string",
  "methodInventory": [
    {
      "pageObject": "LoginPage",
      "actionMethods": ["goto", "login"],
      "locatorMethods": ["getErrorMessage"]
    },
    {
      "pageObject": "ProjectsPage",
      "actionMethods": ["createProject"],
      "locatorMethods": ["getProjectByName", "getValidationError"]
    }
  ],
  "scenarios": [
    {
      "title": "string",
      "type": "happy-path | negative | validation | edge-case",
      "description": "string"
    }
  ],
  "files": [
    {
      "path": "generated/tests/example.spec.ts",
      "content": "..."
    }
  ]
}

REQUIRED FILE TYPES:
1. One Playwright spec file inside generated/tests
2. One or more Page Object files inside generated/pages
3. One or more data files inside generated/data

TEST QUALITY RULES:
- Use @playwright/test
- Use TypeScript
- Use Page Object Model
- Use constructor(private page: Page)
- Define locators as readonly class properties
- Use getByRole, getByLabel, getByTestId, getByText
- Do NOT use XPath unless absolutely necessary
- Do NOT use hardcoded waits
- Use expect assertions
- Test should be readable and short
- Test should call page object methods
- Do not put test data directly in the spec
- Import test data from generated/data files
- Use clear names like validUser, invalidUser, newProject
- Use process.env.BASE_URL if navigation is needed
- Avoid duplicated code
- Use fixtures for page objects
- Do not instantiate page objects inside test files
- Test files should use injected fixtures
- Use reusable action methods like login(), createProject(), openCreateProjectForm()
- Use locator methods like getProjectByName(), getErrorMessage(), getValidationMessage()

DATA FILE RULES:
- Put users in generated/data/users.data.ts
- Put project data in generated/data/projects.data.ts
- Export constants
- Use fake but realistic values
- Never include real credentials
- Passwords must be placeholders like "Password123!"

STYLE:
- Clean code
- Senior-level naming
- No explanations
- No markdown
- Return ONLY JSON

DATA FILE CONSISTENCY RULES:
- If a fixture imports from ../data/users.data, then generated/data/users.data.ts must be included in files[]
- If a fixture imports from ../data/projects.data, then generated/data/projects.data.ts must be included in files[]
- Do not import data files that are not generated
- Do not create data imports in specs
- Specs must receive data only through fixtures
- Every data object used in specs must be exposed from generated/fixtures/test-fixtures.ts

FIXTURE RULES:
- Create a fixture file inside generated/fixtures/test-fixtures.ts
- Extend Playwright base test
- Export test and expect from the fixture file
- Fixtures should instantiate page objects
- Specs must import test and expect from "../fixtures/test-fixtures"
- Specs must NOT manually instantiate page objects
- Use typed fixtures

REQUIRED FIXTURE STYLE:
- Import { test as base, expect, Page } from "@playwright/test"
- Import page objects from "../pages/..."
- Define a type called TestFixtures
- Extend base with page object fixtures

Example style:
import { test as base, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ProjectsPage } from "../pages/ProjectsPage";

type TestFixtures = {
  loginPage: LoginPage;
  projectsPage: ProjectsPage;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPage(page));
  },
});

export { expect };

FIXTURE DATA RULES:
- Data from generated/data must be imported into the fixture file
- Fixtures must expose commonly used data objects (e.g. validUser, invalidUser, newProject)
- Tests must NOT import data files directly
- Tests must receive data via fixtures

IMPLEMENTATION RULES:
- Import data inside fixtures:
  import { validUser, invalidUser } from "../data/users.data"
  import { newProject } from "../data/projects.data"

- Extend the TestFixtures type to include data:
  type TestFixtures = {
    loginPage: LoginPage;
    projectsPage: ProjectsPage;
    validUser: typeof validUser;
    invalidUser: typeof invalidUser;
    newProject: typeof newProject;
  };

- Inject data as fixtures:
  validUser: async ({}, use) => {
    await use(validUser);
  }

- Tests must access data ONLY via fixture parameters
- Do not import data inside test files
- Do not create unnecessary data fixtures if not used in the test

MULTIPLE SCENARIO RULES:
- Generate multiple realistic test scenarios from the requirement
- Include at least:
  1. One happy path scenario
  2. One negative scenario
  3. One validation or edge-case scenario when applicable
- Each scenario must become a separate Playwright test
- Each test title must clearly describe the scenario
- Do not duplicate steps unnecessarily
- Use the same page objects, fixtures, and data files across scenarios
- Create additional test data only when required by a scenario
- Do not generate scenarios that are unrelated to the requirement

SPEC FILE RULES:
- The spec file must include one test per scenario
- Use test.describe for the feature
- Use injected fixtures from "../fixtures/test-fixtures"
- Do not import page objects directly into the spec
- Do not import data files directly into the spec
- Test data must come from fixtures
- Spec files must only call public methods explicitly implemented in the generated page object files
- Do not call methods that are implied, assumed, or missing
- Do not create helper method names inside tests unless they are implemented in page objects

DATA RULES FOR SCENARIOS:
- Create only the data required by the generated scenarios
- Data names must clearly match scenario intent
- Examples:
  - validUser
  - invalidUser
  - newProject
  - projectWithoutName
  - projectWithLongName
- Data files must export all data used by fixtures
- Fixtures must expose all data used by tests

TEST STEP RULES:
- Every Playwright test must use test.step()
- Use clear business-readable step names
- Each step should group related actions/assertions
- Do not create one step per single click unless necessary
- Step names should explain user intent, not implementation details
- Use async callbacks for every step
- Keep steps consistent across scenarios
- Assertions inside test.step() must use expect directly on locators returned by page objects

EXAMPLE STYLE:
test("creates a project with valid data", async ({
  loginPage,
  projectsPage,
  validUser,
  newProject,
}) => {
  await test.step("Log in with valid credentials", async () => {
    await loginPage.goto();
    await loginPage.login(validUser.email, validUser.password);
  });

  await test.step("Create a new project", async () => {
    await projectsPage.createProject(newProject);
  });

  await test.step("Verify the project is displayed", async () => {
    await expect(projectsPage.getProjectByName(newProject.name)).toBeVisible();
  });
});

- Do not put test.step() inside page object methods
- test.step() must only be used inside spec files
- Page objects must not import expect from Playwright

PAGE OBJECT CONSISTENCY RULES:
- Every page object method used in a spec file MUST be implemented in its corresponding page object class
- Do NOT call any method in a test unless that method exists in a generated page object file
- Before finalizing the files, validate that every method call in tests has a matching method implementation
- Page object method names must be consistent across tests and page files
- If multiple tests need the same action, reuse the same implemented method

METHOD INVENTORY RULE:
- At the top of each page object file, include a comment listing public ACTION methods and public LOCATOR methods separately
- ACTION methods must perform user actions only
- LOCATOR methods must return Locator objects for assertions
- Page objects must NEVER contain methods that start with expect
- Page objects must NEVER import expect from Playwright
- Page objects must import only Page and Locator from Playwright when needed

ASSERTION RULES:
- All expect assertions must be written ONLY inside spec files
- Page objects must not import expect
- Page objects must not call expect
- Page object method names must not include "expect", "assert", "verify", or "should"
- For assertions, expose locators using methods like:
  - getProjectByName(name: string): Locator
  - getErrorMessage(): Locator
  - getValidationMessage(): Locator
- Specs must assert directly:
  await expect(projectsPage.getProjectByName(newProject.name)).toBeVisible()

GOOD EXAMPLES:
- Page object:
  get errorMessage() { return this.page.getByText("Invalid credentials") }

- Test:
  await expect(loginPage.errorMessage).toBeVisible()

BAD EXAMPLES:
- Page object:
  async expectErrorMessage() { await expect(this.error).toBeVisible() }

STRICT VALIDATION:
- Do not generate any method containing "expect" inside page objects
- If an assertion is needed, expose the locator instead
- Tests must perform all validations using expect

CRITICAL ENFORCEMENT RULES:
- If a page object contains any usage of "expect", the output is INVALID
- If a page object contains any method with name starting with "expect", the output is INVALID
- If a test calls a method that does not exist in a page object, the output is INVALID
- Before returning the JSON, validate all files for these conditions

SMART SCENARIO RULES:
- Generate scenarios that reflect realistic QA coverage, not random variations
- Include only scenarios that are directly related to the requirement
- Prefer meaningful scenarios over many scenarios
- Each scenario must have unique test data when needed
- Do not reuse the same data object if the scenario requires different behavior
- Scenario names must describe the business outcome

SCENARIO TYPES:
- Happy path: valid user completes the main flow
- Negative: invalid input, invalid credentials, missing required data
- Validation: required fields, format errors, max length, duplicate data
- Edge case: boundary values only when relevant

SMART DATA RULES:
- Data must be scenario-specific when needed
- Use descriptive data object names
- Examples:
  - validProject
  - projectWithoutName
  - projectWithLongName
  - duplicateProject
  - validUser
  - invalidUser
- Use dynamic values when uniqueness is needed:
  const uniqueProjectName = \`Automation Project \${Date.now()}\`;
- Avoid hardcoded duplicated strings across tests
- Do not include real credentials in data files

ENV VARIABLE RULES:
- Credentials must come from environment variables
- Do not hardcode real emails, usernames, or passwords
- Use process.env for credential values
- Provide safe fallback placeholders only for local demo purposes
- User data file must read credentials from env variables

HOOK RULES:
- Use test.beforeEach when setup is shared by multiple tests
- Use test.afterEach only when cleanup is needed
- Do not overuse hooks
- Login should be placed in beforeEach only if all tests require an authenticated user
- If some scenarios are unauthenticated, use separate test.describe blocks
- Keep hooks simple and readable
- Hooks must use injected fixtures

DOTENV RULES:
- Generated code must assume dotenv is loaded through Playwright config
- Do not call dotenv.config() inside page objects or spec files
- If config file is generated, import dotenv/config at the top

ENV AND CONFIG RULES:
- Generate a playwright.config.ts file if needed
- The config file must import "dotenv/config"
- Specs, fixtures, and page objects must NOT call dotenv.config()
- Specs, fixtures, and page objects may use process.env only for reading values
- Navigation should use baseURL from Playwright config when possible
- Page objects should navigate with relative URLs like await this.page.goto("/")
- Credentials must come from environment variables inside users.data.ts

DATA GENERATOR RULES:
- Create a utility file at generated/utils/data-generator.ts
- Use helper functions for dynamic values instead of inline Date.now()
- Example: generateProjectName()
- Data files should use these helpers when unique values are needed

TAGGING RULES:
- Each test must include tags in the test title
- Use:
  @smoke for happy path
  @negative for negative tests
  @validation for validation tests
- Tags must be part of the test name

CONSISTENCY RULE:
- All generated files must follow consistent naming conventions
- File names must match class names
- Test titles must match scenario intent
- Data names must match scenario purpose

METHOD CONTRACT RULES:
- Before generating files, create a method inventory for every page object.
- Specs may ONLY call methods listed in the method inventory.
- Every method listed in the inventory MUST be implemented in the matching page object.
- Every method called in specs MUST exist in the matching page object.
- If a method is not implemented, do not call it.
- Do not create new method names inside specs.

SPEC METHOD USAGE RULES:
- When writing specs, first check the methodInventory.
- Specs can only call:
  - action methods from methodInventory.actionMethods
  - locator methods from methodInventory.locatorMethods inside expect()
- Specs must not call helper methods that are not listed in methodInventory.
- Specs must not call methods that are only implied by scenario text.

PAGE OBJECT IMPLEMENTATION RULES:
- Every method in methodInventory must be implemented in its page object class.
- Do not implement methods that are not listed in methodInventory unless they are private helpers.
- Private helpers must not be called by specs.
- Public methods must match methodInventory exactly.

PAGE RESPONSIBILITY RULES:
- LoginPage owns all authentication-related actions:
  - goto()
  - login(email, password)
  - getErrorMessage()
- ProjectsPage owns only project-related actions:
  - createProject()
  - getProjectByName()
  - getValidationError()
- Specs must call loginPage.goto() and loginPage.login()
- Specs must NOT call projectsPage.goto()
- Specs must NOT call projectsPage.login()
- Do not duplicate login methods across non-login page objects

CROSS-PAGE METHOD RULES:
- Authentication methods must only be implemented in LoginPage
- Project methods must only be implemented in ProjectsPage
- If a test needs login before project actions, use loginPage inside beforeEach

HOOK DEDUPLICATION RULES:
- If 2 or more tests require the same setup steps, move those steps into test.beforeEach
- Do not duplicate login steps across multiple tests
- If multiple authenticated tests require login, create a separate test.describe block for authenticated scenarios
- Put login setup inside test.beforeEach for authenticated scenarios
- Keep unauthenticated scenarios, such as invalid login tests, in a separate test.describe block
- test.beforeEach must use injected fixtures only

AUTHENTICATED SCENARIO RULES:
- Scenarios that require a logged-in user must be grouped under:
  test.describe("Authenticated project management", () => {})
- Inside that describe block, use:
  test.beforeEach(async ({ loginPage, validUser }) => {
    await loginPage.goto();
    await loginPage.login(validUser.email, validUser.password);
  });
- Authenticated tests must NOT repeat login steps inside each test
- Unauthenticated login validation tests must NOT use this beforeEach

NEGATIVE SCENARIO CLASSIFICATION RULES:
- Negative scenarios must be classified into:
  1. Authentication-related negatives
  2. Authenticated feature-level negatives

AUTHENTICATION NEGATIVE RULES:
- Must NOT use test.beforeEach
- Must NOT reuse authenticated hooks
- Must explicitly perform login steps inside the test
- Must validate login-related errors

AUTHENTICATED NEGATIVE RULES:
- Must be grouped under an authenticated test.describe block
- Must use test.beforeEach for login setup
- Must NOT repeat login steps inside tests
- Must validate feature-level errors (validation, duplicates, etc.)

HOOK DECISION RULES:
- Before generating spec files, classify every scenario as:
  1. "auth-setup-required"
  2. "auth-flow-under-test"
  3. "no-auth-required"

CLASSIFICATION LOGIC:
- Use "auth-flow-under-test" when the scenario validates login, logout, invalid credentials, locked user, expired session, or authentication error handling.
- Use "auth-setup-required" when the scenario tests a feature that requires the user to already be logged in.
- Use "no-auth-required" when the scenario can be tested without logging in.

HOOK USAGE RULES:
- Scenarios classified as "auth-setup-required" must be grouped in a test.describe block with test.beforeEach login setup.
- Scenarios classified as "auth-flow-under-test" must NOT use authenticated beforeEach.
- Scenarios classified as "auth-flow-under-test" must perform auth steps inside the test.
- Scenarios classified as "no-auth-required" must NOT use login setup unless the scenario explicitly requires it.
- Do not duplicate login steps inside tests that are already covered by beforeEach.

HOOK VALIDATION RULES:
- If two or more scenarios have authClassification = "auth-setup-required", they must share one test.beforeEach.
- If a scenario has authClassification = "auth-flow-under-test", it must not be inside a describe block with authenticated beforeEach.
- If a scenario is inside authenticated beforeEach, the test body must not call loginPage.goto() or loginPage.login().

HOOK RULES:
- You MUST use test.beforeEach for authenticated feature scenarios.
- Authenticated feature scenarios are tests where the user must log in before performing the main action.
- Do NOT repeat login steps inside authenticated feature tests.
- Put shared login setup inside test.beforeEach.
- Group authenticated feature tests inside:
  test.describe("Authenticated scenarios", () => {})
- Inside that describe block, create:
  test.beforeEach(async ({ loginPage, validUser }) => {
    await loginPage.goto();
    await loginPage.login(validUser.email, validUser.password);
  });
- Authenticated tests must only contain the feature action and assertions.
- Login failure or invalid credentials scenarios must be placed in a separate describe block without beforeEach.

CORRECT HOOK EXAMPLE:
test.describe("Authenticated scenarios", () => {
  test.beforeEach(async ({ loginPage, validUser }) => {
    await loginPage.goto();
    await loginPage.login(validUser.email, validUser.password);
  });

  test("creates a project successfully @smoke", async ({
    projectsPage,
    validProject,
  }) => {
    await test.step("Create the project", async () => {
      await projectsPage.createProject(validProject);
    });

    await test.step("Verify the project is displayed", async () => {
      await expect(projectsPage.getProjectByName(validProject.name)).toBeVisible();
    });
  });
});

test.describe("Authentication validation", () => {
  test("shows an error for invalid credentials @negative", async ({
    loginPage,
    invalidUser,
  }) => {
    await test.step("Attempt login with invalid credentials", async () => {
      await loginPage.goto();
      await loginPage.login(invalidUser.email, invalidUser.password);
    });

    await test.step("Verify login error", async () => {
      await expect(loginPage.getErrorMessage()).toBeVisible();
    });
  });
});

AUTH HOOK DECISION:
- If a scenario is testing login failure, invalid credentials, locked account, or authentication errors, do NOT use authenticated beforeEach
- If a scenario is testing a feature after successful login, use authenticated beforeEach when 2 or more such scenarios exist

HOOK NAMING RULE:
- Use descriptive describe titles:
  "Authenticated <feature>"
  "Authentication validation"

HTML-AWARE LOCATOR RULES:
- If an HTML snippet is provided, use it to generate locators
- Do not invent attributes that are not present in the HTML
- Prefer:
  1. getByRole with accessible name
  2. getByLabel
  3. getByText for visible text
- Use getByTestId only if data-testid exists in HTML
- Avoid XPath unless absolutely necessary
- If unsure, add:
  // TODO: Verify selector against real DOM

PAGE OBJECT LOCATOR RULES:
- Page objects MUST define locators as readonly class properties inside the constructor
- Every interactive element used in actions MUST have a corresponding locator property
- Do NOT use inline locators inside action methods
- Action methods must ONLY use previously defined locator properties
- Locator properties must be initialized in the constructor using this.page
- If a page object contains inline locators inside methods, the output is invalid

- Static locators:
  readonly projectNameInput: Locator;

  constructor(private page: Page) {
    this.projectNameInput = this.page.getByLabel("Project Name");
  }

- Dynamic locators:
  Use methods that return Locator:
  getProjectByName(name: string): Locator

FORBIDDEN:
- this.page.getByRole(...) inside methods
- this.page.getByLabel(...) inside methods
- this.page.locator(...) inside methods

REQUIRED:
- All locators declared at top as properties
- All action methods reuse those properties

ASSERTION QUALITY RULES:
- Do not rely only on toBeVisible()
- Use the most meaningful assertion based on context:

Examples:
- For text content:
  await expect(locator).toHaveText("Expected text")

- For validation messages:
  await expect(locator).toHaveText(/required/i)

- For input values:
  await expect(input).toHaveValue("value")

- For collections:
  await expect(locator).toHaveCount(n)

- Use regex when exact text may vary

- Assertions must reflect business intent, not just visibility
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  return response.choices[0].message.content;
}

export async function generatePlaywrightPom(requirement: string,
  htmlSnippet?: string) {
    
  const ROLE = `
You are a senior QA automation engineer using Playwright, TypeScript, fixtures, hooks, and Page Object Model.
`;

const TASK = `
Generate production-quality Playwright automation code from the requirement.
`;

const INPUT = `
Requirement:
"${requirement}"

HTML snippet:
${htmlSnippet ?? "No HTML snippet provided."}
`;

const OUTPUT_FORMAT = `
Return ONLY valid JSON:
{
  "featureName": "string",
"methodInventory": [
  {
    "pageObject": "LoginPage",
    "actionMethods": ["goto", "login"],
    "locatorMethods": ["getErrorMessage"]
  },
  {
    "pageObject": "ProjectsPage",
    "actionMethods": ["createProject"],
    "locatorMethods": ["getProjectByName", "getValidationError"]
  }
]
  "scenarios": [
    {
      "title": "string",
      "type": "happy-path | negative | validation | edge-case",
      "description": "string"
    }
  ],
  "files": [
    {
      "path": "generated/tests/example.spec.ts",
      "content": "..."
    }
  ]
}
`;

const FILE_RULES = `
REQUIRED FILES:
- One spec file inside generated/tests
- One or more page objects inside generated/pages
- One fixture file inside generated/fixtures/test-fixtures.ts
- Data files inside generated/data

REQUIRED FILE TYPES:
1. One Playwright spec file inside generated/tests
2. One or more Page Object files inside generated/pages
3. One or more data files inside generated/data
`;

const SPEC_RULES = `
SPEC RULES:
- Specs must be thin orchestration only
- Specs must NOT perform UI actions directly with page.locator(), page.getByRole(), page.getByLabel(), page.getByText(), or page.click()
- Specs must NOT receive the raw page fixture unless absolutely necessary
- Specs must call page object action methods for actions
- Specs must use page object locator methods/properties for assertions
- Specs must import test and expect from "../fixtures/test-fixtures"
- Specs must NOT import from "@playwright/test"
- Specs must NOT import page objects directly
- Specs must NOT import data files directly
- Specs must use injected fixtures only
- Specs must use test.describe
- Every test must use test.step()
- Assertions must be inside spec files only
`;

const PAGE_OBJECT_RULES = `
PAGE OBJECT RULES:
- You MUST generate page object files for every page used by the scenarios
- You MUST generate LoginPage when scenarios require login or authentication
- You MUST generate feature page objects such as ProjectsPage for feature actions
- Page objects must contain all UI actions
- Specs must not perform UI actions directly

LOGIN PAGE REQUIREMENTS:
- LoginPage must include:
  - goto()
  - login(user: { email: string; password: string })
  - getErrorMessage(): Locator when login validation exists

PAGE OBJECT STRUCTURE:
- Page objects must use constructor(private page: Page)
- Page objects must import Page and Locator from "@playwright/test"
- Page objects must NOT import expect
- Page objects must NOT contain expect statements
- Page objects must define locators as readonly class properties
- Locator properties must be initialized in the constructor
- Action methods must use locator properties, not inline locators
- Dynamic locators must be methods returning Locator
- Do not create methods starting with expect, assert, verify, or should
- Public methods must match methodInventory exactly

FORBIDDEN INSIDE SPECS:
- page.goto()
- page.locator()
- page.getByRole()
- page.getByLabel()
- page.getByText()
- direct click/fill/selectOption on page

FORBIDDEN INSIDE PAGE OBJECT ACTION METHODS:
- inline this.page.getByRole(...)
- inline this.page.getByLabel(...)
- inline this.page.getByText(...)
- inline this.page.locator(...)

Action methods must use locator properties only.
`;

const FIXTURE_RULES = `
FIXTURE RULES:
- Create a fixture file inside generated/fixtures/test-fixtures.ts
- Extend Playwright base test
- Export test and expect from the fixture file
- Fixtures should instantiate page objects
- Specs must import test and expect from "../fixtures/test-fixtures"
- Specs must NOT manually instantiate page objects
- Use typed fixtures

REQUIRED FIXTURE STYLE:
- Import { test as base, expect, Page } from "@playwright/test"
- Import page objects from "../pages/..."
- Define a type called TestFixtures
- Extend base with page object fixtures

Example style:
import { test as base, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { ProjectsPage } from "../pages/ProjectsPage";

type TestFixtures = {
  loginPage: LoginPage;
  projectsPage: ProjectsPage;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPage(page));
  },
});

export { expect };

FIXTURE DATA RULES:
- Data from generated/data must be imported into the fixture file
- Fixtures must expose commonly used data objects (e.g. validUser, invalidUser, newProject)
- Tests must NOT import data files directly
- Tests must receive data via fixtures

IMPLEMENTATION RULES:
- Import data inside fixtures:
  import { validUser, invalidUser } from "../data/users.data"
  import { newProject } from "../data/projects.data"

- Extend the TestFixtures type to include data:
  type TestFixtures = {
    loginPage: LoginPage;
    projectsPage: ProjectsPage;
    validUser: typeof validUser;
    invalidUser: typeof invalidUser;
    newProject: typeof newProject;
  };

- Inject data as fixtures:
  validUser: async ({}, use) => {
    await use(validUser);
  }

- Tests must access data ONLY via fixture parameters
- Do not import data inside test files
- Do not create unnecessary data fixtures if not used in the test

TEST STEP FIXTURE RULES:
- Fixtures must ONLY be destructured in the main test callback
- test.step callbacks must NOT receive parameters
- test.step must always use: async () => {}
- Never use: async ({ projectsPage }) => {}

FIXTURE TYPING RULES:
- Always define a TestFixtures type before base.extend
- Always use:
  export const test = base.extend<TestFixtures>({
- Do not use untyped base.extend({...})
- Fixture callbacks must be inferred through base.extend<TestFixtures>
`;

const DATA_RULES = `
DATA FILE RULES:
- Put users in generated/data/users.data.ts
- Put project data in generated/data/projects.data.ts
- Export constants
- Use fake but realistic values
- Never include real credentials
- Passwords must be placeholders like "Password123!"

STYLE:
- Clean code
- Senior-level naming
- No explanations
- No markdown
- Return ONLY JSON

DATA FILE CONSISTENCY RULES:
- If a fixture imports from ../data/users.data, then generated/data/users.data.ts must be included in files[]
- If a fixture imports from ../data/projects.data, then generated/data/projects.data.ts must be included in files[]
- Do not import data files that are not generated
- Do not create data imports in specs
- Specs must receive data only through fixtures
- Every data object used in specs must be exposed from generated/fixtures/test-fixtures.ts

DATA RULES FOR SCENARIOS:
- Create only the data required by the generated scenarios
- Data names must clearly match scenario intent
- Examples:
  - validUser
  - invalidUser
  - newProject
  - projectWithoutName
  - projectWithLongName
- Data files must export all data used by fixtures
- Fixtures must expose all data used by tests

DATA GENERATOR RULES:
- Create a utility file at generated/utils/data-generator.ts
- Use helper functions for dynamic values instead of inline Date.now()
- Example: generateProjectName()
- Data files should use these helpers when unique values are needed

TAGGING RULES:
- Each test must include tags in the test title
- Use:
  @smoke for happy path
  @negative for negative tests
  @validation for validation tests
- Tags must be part of the test name

CONSISTENCY RULE:
- All generated files must follow consistent naming conventions
- File names must match class names
- Test titles must match scenario intent
- Data names must match scenario purpose

DATA DOMAIN RULES:
- User/auth data must only live in generated/data/users.data.ts
- Project data must only live in generated/data/projects.data.ts
- validUser and invalidUser must be imported from "../data/users.data"
- newProject, validProject, projectWithoutName, and projectWithLongName must be imported from "../data/projects.data"
- Never import validUser from projects.data

DATA IMPORT OWNERSHIP RULES:
- Authentication/user data MUST always come from "../data/users.data"
- Project/domain data MUST always come from "../data/projects.data"

users.data.ts must contain:
- validUser
- invalidUser

projects.data.ts must contain:
- newProject
- validProject
- projectWithoutName
- projectWithLongName
- duplicateProject

FORBIDDEN:
- Do NOT import validUser from "../data/projects.data"
- Do NOT import invalidUser from "../data/projects.data"
- Do NOT import project data from "../data/users.data"

ACTION METHOD DATA RULES:
- Page object action methods must accept structured data objects, not primitive values
- Do NOT define methods like:
  createProject(name: string)
- Instead define:
  createProject(project: { name: string })
- Action methods must use properties from the data object
- Specs must pass full data objects (e.g. newProject), not individual fields

FORBIDDEN ACTION SIGNATURES:
- createProject(name: string)
- login(username: string, password: string)

REQUIRED:
- createProject(project: { name: string })
- login(user: { email: string; password: string })

- login(user: { email: string; password: string })

DATA FLOW RULE:
- Data flows from:
  data file → fixture → spec → page object
- The same object must be passed through without breaking it into primitives
`;

const HOOK_RULES = `
HOOK RULES:
- You MUST use test.beforeEach for authenticated feature scenarios
- Authenticated feature scenarios are scenarios where the user must be logged in before testing the feature
- Do not repeat login steps inside authenticated tests
- Group authenticated feature tests inside:
  test.describe("Authenticated scenarios", () => {})
- Inside that describe block, create:
  test.beforeEach(async ({ loginPage, validUser }) => {
    await loginPage.goto();
    await loginPage.login(validUser);
  });
- Authenticated tests must not call loginPage.goto() or loginPage.login()
- Login failure or invalid credentials scenarios must be in a separate describe block without authenticated beforeEach
- Hooks must use injected fixtures only
- Hooks must not instantiate page objects

LOGIN METHOD USAGE RULE:
- LoginPage.login accepts exactly one argument: the full user object
- Always call:
  await loginPage.login(validUser)
- Never call:
  await loginPage.login(validUser.email, validUser.password)
`;

const LOCATOR_RULES = `
HTML-AWARE LOCATOR RULES:
- If HTML is provided, use it to generate accurate locators
- Do not invent attributes that are not present in the HTML
- Prefer:
  1. getByRole with accessible name
  2. getByLabel
  3. getByTestId only if data-testid exists
  4. getByText
  5. stable CSS attributes
- Avoid XPath unless absolutely necessary
- If unsure, add:
  // TODO: Verify selector against real DOM
`;

const MULTIPLE_SCENARIO_RULES = `
MULTIPLE SCENARIO RULES:
- Generate multiple realistic test scenarios from the requirement
- Include at least:
  1. One happy path scenario
  2. One negative scenario
  3. One validation or edge-case scenario when applicable
- Each scenario must become a separate Playwright test
- Each test title must clearly describe the scenario
- Do not duplicate steps unnecessarily
- Use the same page objects, fixtures, and data files across scenarios
- Create additional test data only when required by a scenario
- Do not generate scenarios that are unrelated to the requirement
`;

const ASSERTION_RULES = `
ASSERTION RULES:
- All expect assertions must be written ONLY inside spec files
- Page objects must not import expect
- Page objects must not call expect
- Page object method names must not include "expect", "assert", "verify", or "should"
- For assertions, expose locators using methods like:
  - getProjectByName(name: string): Locator
  - getErrorMessage(): Locator
  - getValidationMessage(): Locator
- Specs must assert directly:
  await expect(projectsPage.getProjectByName(newProject.name)).toBeVisible()

  GOOD EXAMPLES:
- Page object:
  get errorMessage() { return this.page.getByText("Invalid credentials") }

- Test:
  await expect(loginPage.errorMessage).toBeVisible()

BAD EXAMPLES:
- Page object:
  async expectErrorMessage() { await expect(this.error).toBeVisible() }

STRICT VALIDATION:
- Do not generate any method containing "expect" inside page objects
- If an assertion is needed, expose the locator instead
- Tests must perform all validations using expect

CRITICAL ENFORCEMENT RULES:
- If a page object contains any usage of "expect", the output is INVALID
- If a page object contains any method with name starting with "expect", the output is INVALID
- If a test calls a method that does not exist in a page object, the output is INVALID
- Before returning the JSON, validate all files for these conditions
`;

const HTML_AWARE_LOCATOR_RULES = `
HTML-AWARE LOCATOR RULES:
- If an HTML snippet is provided, use it to generate locators
- Do not invent attributes that are not present in the HTML
- Prefer:
  1. getByRole with accessible name
  2. getByLabel
  3. getByText for visible text
- Use getByTestId only if data-testid exists in HTML
- Avoid XPath unless absolutely necessary
- If unsure, add:
  // TODO: Verify selector against real DOM
  `;

const QUALITY_RULES = `
TEST QUALITY RULES:
- Use @playwright/test
- Use TypeScript
- Use Page Object Model
- Use constructor(private page: Page)
- Define locators as readonly class properties
- Use getByRole, getByLabel, getByTestId, getByText
- Do NOT use XPath unless absolutely necessary
- Do NOT use hardcoded waits
- Use expect assertions
- Test should be readable and short
- Test should call page object methods
- Do not put test data directly in the spec
- Import test data from generated/data files
- Use clear names like validUser, invalidUser, newProject
- Use process.env.BASE_URL if navigation is needed
- Avoid duplicated code
- Use fixtures for page objects
- Do not instantiate page objects inside test files
- Test files should use injected fixtures
- Use reusable action methods like login(), createProject(), openCreateProjectForm()
- Use locator methods like getProjectByName(), getErrorMessage(), getValidationMessage()
`;

const SCENARIO_RULES = `
SMART SCENARIO RULES:
- Generate scenarios that reflect realistic QA coverage, not random variations
- Include only scenarios that are directly related to the requirement
- Prefer meaningful scenarios over many scenarios
- Each scenario must have unique test data when needed
- Do not reuse the same data object if the scenario requires different behavior
- Scenario names must describe the business outcome

SCENARIO TYPES:
- Happy path: valid user completes the main flow
- Negative: invalid input, invalid credentials, missing required data
- Validation: required fields, format errors, max length, duplicate data
- Edge case: boundary values only when relevant

SMART DATA RULES:
- Data must be scenario-specific when needed
- Use descriptive data object names
- Examples:
  - validProject
  - projectWithoutName
  - projectWithLongName
  - duplicateProject
  - validUser
  - invalidUser
- Use dynamic values when uniqueness is needed:
  const uniqueProjectName = \`Automation Project \${Date.now()}\`;
- Avoid hardcoded duplicated strings across tests
- Do not include real credentials in data files
`;

const DOTENV_RULES = `
DOTENV RULES:
- Generated code must assume dotenv is loaded through Playwright config
- Do not call dotenv.config() inside page objects or spec files
- If config file is generated, import dotenv/config at the top

ENV AND CONFIG RULES:
- Generate a playwright.config.ts file if needed
- The config file must import "dotenv/config"
- Specs, fixtures, and page objects must NOT call dotenv.config()
- Specs, fixtures, and page objects may use process.env only for reading values
- Navigation should use baseURL from Playwright config when possible
- Page objects should navigate with relative URLs like await this.page.goto("/")
- Credentials must come from environment variables inside users.data.ts
`;

const AUTHENTICATION_RULES = `
AUTHENTICATED SCENARIO RULES:
- Scenarios that require a logged-in user must be grouped under:
  test.describe("Authenticated project management", () => {})
- Inside that describe block, use:
  test.beforeEach(async ({ loginPage, validUser }) => {
    await loginPage.goto();
    await loginPage.login(validUser.email, validUser.password);
  });
- Authenticated tests must NOT repeat login steps inside each test
- Unauthenticated login validation tests must NOT use this beforeEach

NEGATIVE SCENARIO CLASSIFICATION RULES:
- Negative scenarios must be classified into:
  1. Authentication-related negatives
  2. Authenticated feature-level negatives

AUTHENTICATION NEGATIVE RULES:
- Must NOT use test.beforeEach
- Must NOT reuse authenticated hooks
- Must explicitly perform login steps inside the test
- Must validate login-related errors

AUTHENTICATED NEGATIVE RULES:
- Must be grouped under an authenticated test.describe block
- Must use test.beforeEach for login setup
- Must NOT repeat login steps inside tests
- Must validate feature-level errors (validation, duplicates, etc.)
`;

const METHOD_INVENTORY_RULES = `
METHOD INVENTORY RULE:
- At the top of each page object file, include a comment listing public ACTION methods and public LOCATOR methods separately
- ACTION methods must perform user actions only
- LOCATOR methods must return Locator objects for assertions
- Page objects must NEVER contain methods that start with expect
- Page objects must NEVER import expect from Playwright
- Page objects must import only Page and Locator from Playwright when needed
`;

const ARCHITECTURE_ENFORCEMENT_RULES = `
ARCHITECTURE ENFORCEMENT:
- If the requirement includes login, generate LoginPage
- If the requirement includes creating, editing, deleting, or viewing a project, generate ProjectsPage
- Specs must never replace page objects with direct Playwright actions
- All reusable actions must live in page object methods
- All reusable locators must live in page objects
- Fixtures must expose all page objects used by specs
- If a spec uses loginPage or projectsPage, those fixtures must be created in test-fixtures.ts
`;

const prompt = `
${ROLE}
${TASK}
${INPUT}
${OUTPUT_FORMAT}
${FILE_RULES}
${SPEC_RULES}
${PAGE_OBJECT_RULES}
${FIXTURE_RULES}
${DATA_RULES}
${HOOK_RULES}
${LOCATOR_RULES}
${ASSERTION_RULES}
${QUALITY_RULES}
${METHOD_INVENTORY_RULES}
${SCENARIO_RULES}
${MULTIPLE_SCENARIO_RULES}
${HTML_AWARE_LOCATOR_RULES}
${AUTHENTICATION_RULES}
${DOTENV_RULES}
${ARCHITECTURE_ENFORCEMENT_RULES}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  return response.choices[0].message.content;
}