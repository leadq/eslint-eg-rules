---
name: eslint-rule-writing
description: "A comprehensive skill and instruction set for an LLM to write, test, and integrate fully working ESLint rules."
---

# ESLint Rule Writing Skill

When you are asked to create, refactor, or test an ESLint rule in this project, you **MUST** strictly follow this step-by-step workflow to ensure the rule is fully functional, properly tested, and correctly integrated into the plugin structure.

## 1. Project Context & Structure
- **Rules Directory**: `src/rules/`
- **Rule Structure**: Every rule MUST have its own folder (e.g., `src/rules/my-custom-rule/`).
- **Required Files**: Each rule folder typically needs:
  - `index.ts` / `index.js`: The rule implementation itself.
  - `index.test.ts` / `index.test.js`: ESLint `RuleTester` unit tests.
  - `README.md`: Documentation for the rule.
- **Plugin Entry Point**: `src/index.ts` is where all rules are exported and added to the plugin's `configs.recommended` or `rules` object.
- **Demo Project**: Located in the `demo/` (or `src/demo/`) directory. It is a React 18+ and TypeScript project used to verify rules in a real-world environment. It relies on the built version of the plugin.

## 2. Step-by-Step Execution Plan

### Step 1: Analysis & Test-Driven Development (TDD)
Before writing any implementation code:
1. **Understand the Goal**: Identify what code patterns are valid and invalid. Consider false positives/negatives and edge cases.
2. **Draft AST Targets**: Figure out which AST nodes need to be visited (e.g., `FunctionDeclaration`, `ArrowFunctionExpression`, `VariableDeclarator`, `JSXElement`, `CallExpression`, `Identifier`, etc.). Always account for multiple ways to write the same logic (e.g., standard functions vs. arrow functions).
3. **Write Tests First**: Create `valid` and `invalid` cases using ESLint's `RuleTester` in the rule's test file.
   - The `invalid` cases MUST clearly define the expected `errors` (using `messageId` or exact `message`).
   - Include edge case tests explicitly.

### Step 2: Implement the Rule
1. **Rule Skeleton**: Use standard ESLint boilerplate. Export an object containing `meta` and `create`.
2. **Meta Object**: Define the `type` (problem, suggestion, layout), `docs` (description, category), `schema` (for rule options), and `messages` (for standardized, type-safe error reporting).
3. **AST Traversal**: In the `create` function, return an object mapping AST node types to handler functions.
4. **Context Reporting**: Use `context.report()` to flag violations. Always use `node` to supply the exact location of the error.
5. **Fixers (Optional but encouraged)**: If the rule is fixable, add `fixable: 'code'` to `meta` and provide a `fix` function in `context.report()` to automatically correct the code.

### Step 3: Run Unit Tests & Refine
1. Run the local unit tests (e.g., via `npm test` or running the test file via IDE/test runner).
2. If tests fail, analyze the AST and refine the selectors or logic until all tests pass. Do not move forward until the RuleTester tests are fully successful.

### Step 4: Integration & Registration
1. **Register the Rule**: Add the new rule to the exported `rules` object in `src/index.ts`. If it should be active by default, add it to the recommended configuration array/object exported there as well.
2. **Build the Plugin**: Run `npm run build` in the root directory to distribute your updated `src/index.ts` and compiled rules so the demo project can consume them.

### Step 5: Demo Project E2E Testing
1. Navigate to the demo project (`cd demo/`).
2. **Demo Folder Structure**: To prevent rule examples from mixing up, you MUST follow this strict folder structure for testing every rule:
   - Identify the main target directory the rule applies to (e.g., `src/apis`, `src/components`).
   - Inside that target directory, create a folder named exactly after the rule (e.g., `src/apis/api-type-suffix/`).
   - Inside the rule's folder, create dedicated files like `valid.ts` and `invalid.ts` to test the logic.
   - If the rule is sensitive to deep paths, optionally create a nested folder inside the rule's folder to prove deep scanning (e.g., `src/apis/api-type-suffix/nested/invalid.ts`).
3. **Non-Target Path Testing**: You MUST also create exactly 1 example file in a non-target path to prove the rule ignores files it shouldn't process (e.g., if targeting `apis/`, put an example in `src/components/api-type-suffix/valid.ts`).
4. **Example Constraints**: 
   - Keep examples minimal. One example per target case is enough.
   - If an example demonstrates an edge case, a false positive, or an exception, write a comment directly above it explaining what is being proven.
5. Verify that the rule triggers correctly by manually running the lint script in the demo project (e.g., `npx eslint "src/**"`) or by checking the IDE integration.
6. **Note**: Ensure the demo's ESLint config isolates the custom plugin setup without interference from conflicting rules.

### Step 6: Update Project-Level Documentation (MANDATORY)
After every new rule is created **or** an existing rule is modified, you **MUST** update the following two files:

1. **`README.md`** (root of the project):
   - Add or update the rule's entry in the rules table (rule name, description, fixable status, recommended status).
   - If the rule has new or changed options, reflect them in the relevant documentation section.
   - If the rule is being removed or renamed, remove or update its entry accordingly.

2. **`eslint-eg-rules.skill.md`** (project skill file, if it exists at the root or in `.agent/`):
   - Add or update the rule's summary so that the skill file always reflects the current set of rules and their behaviors.
   - Include the rule name, a one-line description, and any notable options or exceptions.
   - Keep the skill file in sync so that future LLM sessions have accurate context about the plugin's capabilities.

> ⚠️ **This step is not optional.** Skipping or deferring this step is a violation of the workflow. Do not mark a task as complete until both files are updated.

## 3. General Rules & Constraints
- **Test/Doc Synchronization**: If the user provides documentation first, generate tests + code. If the user provides tests first, generate documentation + code. ALWAYS keep documentation, tests, and the demo project examples in sync.
- **Refactoring**: When modifying a rule, you MUST update unit tests, `src/index.ts` (if renaming), the documentation, and the demo examples.
- **Project Documentation Sync**: Every time a rule is created or updated, you MUST update both the root `README.md` (rules table and options) and the `eslint-eg-rules.skill.md` skill file (rule summaries). See **Step 6** for details. This is mandatory and must be completed before the task is considered done.
- **Robustness**: Don't rely exclusively on node names if type resolution is necessary. Check all variants of a construct (e.g., function expressions vs declarations).
- **TypeScript AST**: If writing TypeScript rules, be sure to use `@typescript-eslint/utils` and account for nodes like `TSTypeAnnotation`, `TSInterfaceDeclaration`, etc.
- **Language**: Use only English for all documentation and error messages. But you can speak in Turkish in Chat mode.
