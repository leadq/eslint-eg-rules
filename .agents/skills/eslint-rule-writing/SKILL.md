---
name: eslint-rule-writing
description: "A comprehensive skill for writing, testing, and integrating ESLint rules. Covers AST coverage analysis, TDD workflow, integration, and documentation. Never assume the AST structure. Always check module boundaries and the analysis layer."
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

### Step 1: AST Coverage Analysis

Before writing any code, perform a thorough AST coverage review.

#### 1a. Identify All Representations

Determine every relevant JavaScript and TypeScript representation of the target concept. Check at minimum:

* declarations
* expressions
* variable definitions
* assignments
* object members
* class members
* nested scopes
* callbacks
* computed, private and static members
* destructuring
* JSX/TSX forms
* TypeScript-only syntax

Do not assume semantically equivalent code has the same AST structure.

#### 1b. Check Module Boundaries

Review all relevant module forms:

* default imports
* named imports
* aliased imports
* namespace imports
* type-only imports
* local exports
* default exports
* aliased exports
* re-exports
* wildcard exports
* CommonJS forms when supported

Explicitly distinguish:

* locally defined constructs
* imported constructs
* aliases
* wrappers
* re-exported constructs
* declaration-only constructs

#### 1c. Choose the Correct Analysis Layer

Use ESLint and ESTree utilities for:

* syntax structure
* AST traversal
* parent relationships
* lexical scope
* variables and references

Use TypeScript parser services and the TypeChecker for:

* resolved types
* symbol identity
* aliases
* inferred types
* overloads
* generics
* imported declarations
* built-in versus user-defined types
* semantic ownership

Do not use string matching when symbol or type resolution is required.

Do not use the TypeChecker when syntax-level analysis is sufficient.

#### 1d. Create an Explicit Coverage Decision

Before implementation, list the relevant patterns using:

| Pattern | AST representation | Analysis layer | Check / Ignore / Ask |
| ------- | ------------------ | -------------- | -------------------- |

Every relevant pattern must receive an explicit decision.

If expected behavior is unclear, ask the user instead of selecting behavior silently.

#### 1e. Draft AST Targets

Based on the coverage analysis above, identify which AST nodes need to be visited (e.g., `FunctionDeclaration`, `ArrowFunctionExpression`, `VariableDeclarator`, `JSXElement`, `CallExpression`, `Identifier`, etc.). Think about all definition types and expression types of the same target. Always account for multiple ways to write the same logic (e.g., standard functions vs. arrow functions).

### Step 2: Test-Driven Development (TDD)

1. **Write Tests First**: Create `valid` and `invalid` cases using ESLint's `RuleTester` in the rule's test file.
   - The `invalid` cases MUST clearly define the expected `errors` (using `messageId` or exact `message`).
   - Include edge case tests explicitly.
   - Every checked pattern must have valid and invalid tests.
   - Ignored patterns must have regression tests.

### Step 3: Implement the Rule

1. **Normalize AST Differences**: Do not spread business rules across multiple visitor implementations. Normalize different AST representations into a shared semantic model before applying rule logic. The normalized model should contain only the information relevant to the rule, such as:
   * resolved name
   * construct kind
   * scope
   * ownership
   * declaration or implementation status
   * resolved symbol or type when required
   * reporting node

2. **Rule Skeleton**: Use standard ESLint boilerplate. Export an object containing `meta` and `create`.

3. **Meta Object**: Define the `type` (problem, suggestion, layout), `docs` (description, category), `schema` (for rule options), and `messages` (for standardized, type-safe error reporting).

4. **AST Traversal**: In the `create` function, return an object mapping AST node types to handler functions.

5. **Context Reporting**: Use `context.report()` to flag violations. Always use `node` to supply the exact location of the error.

6. **Fixers (Optional but encouraged)**: If the rule is fixable, add `fixable: 'code'` to `meta` and provide a `fix` function in `context.report()` to automatically correct the code.

### Step 4: Run Unit Tests & Validate Completeness

1. Run the local unit tests (e.g., via `npm test` or running the test file via IDE/test runner).
2. If tests fail, analyze the AST and refine the selectors or logic until all tests pass. Do not move forward until the RuleTester tests are fully successful.
3. **Validate completeness** — before completing the rule, verify:
   * all relevant syntax forms were considered
   * import and export variants were considered
   * local, imported, aliased and re-exported constructs were distinguished
   * TypeScript-only forms were considered
   * syntax analysis and semantic analysis were not confused
   * no node can be reported more than once
   * ignored patterns have regression tests
   * every checked pattern has valid and invalid tests
   * unresolved product decisions were asked instead of assumed

### Step 5: Integration & Registration

1. **Register the Rule**: Add the new rule to the exported `rules` object in `src/index.ts`. If it should be active by default, add it to the recommended configuration array/object exported there as well.
2. **Build the Plugin**: Run `npm run build` in the root directory to distribute your updated `src/index.ts` and compiled rules so the demo project can consume them.

### Step 6: Demo Project E2E Testing

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

### Step 7: Update Project-Level Documentation (MANDATORY)

After every new rule is created **or** an existing rule is modified, you **MUST** update the following two files:

1. **`README.md`** (root of the project):
   - Add or update the rule's entry in the rules table (rule name, description, fixable status, recommended status).
   - If the rule has new or changed options, reflect them in the relevant documentation section.
   - If the rule is being removed or renamed, remove or update its entry accordingly.

2. **`.agents/skills/eslint-eg-rules/SKILL.md`** (project rules catalog skill file):
   - Add or update the rule's summary so that the skill file always reflects the current set of rules and their behaviors.
   - Include the rule name, a one-line description, and any notable options or exceptions.
   - Keep the skill file in sync so that future LLM sessions have accurate context about the plugin's capabilities.

> ⚠️ **This step is not optional.** Skipping or deferring this step is a violation of the workflow. Do not mark a task as complete until both files are updated.

## 3. General Rules & Constraints

- **Test/Doc Synchronization**: If the user provides documentation first, generate tests + code. If the user provides tests first, generate documentation + code. ALWAYS keep documentation, tests, and the demo project examples in sync.
- **Refactoring**: When modifying a rule, you MUST update unit tests, `src/index.ts` (if renaming), the documentation, and the demo examples.
- **Project Documentation Sync**: Every time a rule is created or updated, you MUST update both the root `README.md` (rules table and options) and the `.agents/skills/eslint-eg-rules/SKILL.md` skill file (rule summaries). See **Step 7** for details. This is mandatory and must be completed before the task is considered done.
- **Robustness**: Don't rely exclusively on node names if type resolution is necessary. Check all variants of a construct (e.g., function expressions vs declarations).
- **TypeScript AST**: If writing TypeScript rules, be sure to use `@typescript-eslint/utils` and account for nodes like `TSTypeAnnotation`, `TSInterfaceDeclaration`, etc.
- **ESLint v8/v9 Compatibility**: When writing or updating custom rules, always ensure the rules and their tests are fully compatible with both ESLint v8 and ESLint v9. Specifically:
  - Do not call deprecated/removed `context` methods (e.g., `context.getSourceCode()`, `context.getScope()`, `context.getFilename()`).
  - Use hybrid fallbacks: `const sourceCode = context.sourceCode || context.getSourceCode();`, `const scope = sourceCode.getScope ? sourceCode.getScope(node) : context.getScope();`, and `const filename = context.filename ?? context.getFilename();`.
  - Always export the `meta` object (required in v9) and define `meta.schema` for rules that accept options.
  - In unit tests using `RuleTester`, ensure that `output` is explicitly provided for all fixable rules' invalid test cases (strict check in v9).
- **Language**: Use only English for all documentation and error messages. But you can speak in Turkish in Chat mode.
