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
- **Rule Taxonomy & Categories**: Every rule MUST belong to one of these 6 official categories:
  1. 📁 **`structure`**: File/folder anatomy, allowed folder files, and skeleton patterns (e.g., `apis/` folder anatomy).
  2. 🏗️ **`architecture`**: Dependency graph, layer boundaries, colocation boundaries, component layout.
  3. 🏷️ **`naming`**: Semantic naming for props, variables, functions, types, event handlers, and BEM.
  4. 💎 **`quality`**: Maintainability, Single Responsibility (SRP), complexity control, guard clauses, parameter limits.
  5. ⚛️ **`react`**: React lifecycle, hooks correctness, render safety, single component exports.
  6. 🧪 **`testing`**: Test statement matching, test description formatting, disallowing test attributes in UI.
- **Plugin Entry Point**: `src/index.ts` is where all rules are exported and added to the plugin's `configs.recommended` or `rules` object.
- **Demo Project**: Located in the `demo/` (or `src/demo/`) directory. It is a React 18+ and TypeScript project used to verify rules in a real-world environment. It relies on the built version of the plugin.

## 2. Step-by-Step Execution Plan

### Step 1: AST Coverage Analysis & Representation Matrix

Before writing any code, perform a thorough AST coverage review across all possible JavaScript and TypeScript syntax representations.

#### 1a. Functions & Callables Representation Matrix
Check at minimum:
* **Function Declarations**: `function foo() {}`, `async function foo() {}`, `function* foo() {}`, `async function* foo() {}`
* **Function Expressions**: `const foo = function() {}`, named function expressions `const foo = function bar() {}`
* **Arrow Functions**: `const foo = () => {}`, `const foo = async () => {}`, concise body `() => expression` vs block body `() => { return ... }`
* **Method Definitions**: Object methods `{ foo() {} }`, class methods `class { foo() {} }`, getters `get foo() {}`, setters `set foo(v) {}`, generator methods `*foo() {}`, async methods `async foo() {}`, computed method names `[computedName]() {}`
* **TypeScript Function Overloads**: Multiple overload signatures + single implementation body (`function foo(x: string): void; function foo(x: number): void; function foo(x: any) {}`)
* **IIFE (Immediately Invoked Functions)**: `(function() {})()`, `(() => {})()`
* **Constructors & Signatures**: `constructor() {}`, call/construct signatures in interfaces `interface Foo { (): void; new(): Foo; }`

#### 1b. Variables, Bindings & Assignment Matrix
Check at minimum:
* **Declarators**: `const`, `let`, `var`, multiple declarators in a single statement (`const a = 1, b = 2, c = 3;`)
* **Destructuring Patterns**:
  - Object destructuring: `const { a, b: alias, c = defaultVal, ...rest } = obj`
  - Nested destructuring: `const { user: { profile: { name } } } = obj`
  - Array destructuring: `const [first, , third, ...rest] = arr`
  - Parameter list destructuring: `function foo({ a, b = 1 }: Props)`
* **Assignment Expressions**: `a = b = c`, `[a, b] = [1, 2]`, `({ a, b } = obj)`, logical assignments (`a ||= b`, `a &&= b`, `a ??= b`), compound assignments (`a += 1`)
* **Ambient Declarations**: `declare const foo: string;`, `declare function foo(): void;`

#### 1c. Classes & Object Literals Matrix
Check at minimum:
* **Class Forms**: Class declarations (`class Foo {}`, `export default class Foo {}`), Class expressions (`const Foo = class Bar {}`, anonymous `export default class {}`)
* **Class Members**:
  - Public fields: `prop = 1;`
  - Private identifiers: `#privateField = 1;`, `#privateMethod() {}`
  - Static members: `static prop = 1;`, `static #secret = 2;`, static initialization blocks `static { ... }`
  - Getters & Setters: `get prop()`, `set prop(v)`
  - TypeScript parameter properties: `constructor(public name: string, private readonly id: number) {}`
  - TypeScript abstract members: `abstract class Foo { abstract bar(): void; }`
  - Auto-accessors: `accessor prop = 1;`
* **Object Literals**: Shorthand properties `{ a, b }`, key-value `{ a: 1 }`, computed property names `{ [computeKey()]: 1 }`, method definitions `{ method() {} }`, spread properties `{ ...defaults, custom: 1 }`, object getters/setters `{ get foo() {}, set foo(v) {} }`

#### 1d. Modules, Imports & Exports Matrix
Check at minimum:
* **Imports**:
  - Static forms: Named `import { a, b as c }`, Default `import a`, Namespace `import * as a`, Side-effect `import './style'`, Mixed `import a, { b } from '...'`
  - Type-only forms: Declaration level `import type { A }`, Inline specifiers `import { type A, B }`, Import attributes `import data from './data.json' with { type: 'json' }`
  - Dynamic forms: `import('...')`, `await import('...')` (String literals and static `TemplateLiteral`)
  - CommonJS / AMD: `const a = require('...')`, `require.resolve('...')`
  - TypeScript specific: `import a = require('...')` (`TSImportEqualsDeclaration`)
* **Exports**:
  - Inline exports: `export const a = 1;`, `export function b() {}`, `export class C {}`
  - Export clauses: `export { a, b as c }`, `export { a } from './mod'`, `export { default as a } from './mod'`
  - Default exports: `export default a;`, `export default function() {}`, `export default class {}`
  - Wildcard re-exports: `export * from './mod'`, `export * as ns from './mod'`
  - Type-only exports: `export type { A }`, `export type * from './mod'`, `export { type A, B }`
  - TypeScript specific: `export = a`, `export as namespace a`

#### 1e. JSX, TSX & React Composition Matrix
Check at minimum:
* **JSX Elements**: `<Component />`, `<Component>...</Component>`
* **JSX Fragments**: `<>...</>`, `<React.Fragment key={k}>...</React.Fragment>`
* **JSX Member Expressions**: `<UI.Button />`, `<styled.div />`, `<Namespace.Sub.Component />`
* **JSX Attributes**: Named `prop="val"`, boolean shorthand `<Button disabled />`, spread attributes `<Button {...props} />`
* **Wrappers & HOCs**: `React.memo(Comp)`, `React.forwardRef(Comp)`, `React.lazy(() => import(...))`, `withAuth(Comp)`, curried HOCs `connect(mapState)(Comp)`
* **Render Logic**: Conditional ternary `{isLoading ? <Spinner /> : <Data />}`, short-circuit `{hasError && <ErrorView />}`

#### 1f. TypeScript Type Space & Control Flow Matrix
Check at minimum:
* **Type Assertions**: `as const`, `as Type`, `<Type>val`, `satisfies Type`, non-null assertions `foo!.bar`
* **Generics**: Type parameters on functions, classes, type aliases, interfaces (`function foo<T extends Base>(arg: T): T`)
* **Scopes & Shadowing**: Variable shadowing in nested blocks/closures, `try-catch` scope variables (`catch (err)`), `for-of`/`for-in` loop heads (`for (const [k, v] of entries)`), switch-case lexical block scopes (`case 1: { const x = 1; }`), optional chaining (`a?.b?.()`)

#### 1g. Create an Explicit Coverage Decision
Before implementation, list the relevant patterns using:

| Pattern | AST representation | Analysis layer | Check / Ignore / Ask |
| ------- | ------------------ | -------------- | -------------------- |

Every relevant pattern must receive an explicit decision.
If expected behavior is unclear, ask the user instead of selecting behavior silently.

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

3. **Meta Object**: Define the `type` (problem, suggestion, layout), `docs` (description, `category`: one of `'Structure' | 'Architecture' | 'Naming' | 'Quality' | 'React' | 'Testing'`, `recommended`), `schema` (for rule options), and `messages` (for standardized, type-safe error reporting).

4. **AST Traversal**: In the `create` function, return an object mapping AST node types to handler functions.

5. **Context Reporting**: Use `context.report()` to flag violations. Always use `node` to supply the exact location of the error.

6. **Fixers (Optional but encouraged)**: If the rule is fixable, add `fixable: 'code'` to `meta` and provide a `fix` function in `context.report()` to automatically correct the code.

### Step 4: Unit Testing & Universal Hardening Gate (MANDATORY)

1. **Run Unit Tests**: Run local unit tests (`npm test`). All tests must pass cleanly.
2. **Universal Hardening Gate (Checklist Audit)**:
   Before marking any rule as complete, you **MUST** systematically audit the rule against all 4 dimensions from Step 1:

   #### Dimension 1: AST & Syntax Representation Invariance
   - [ ] **Functions**: Function declarations, function expressions, arrow functions, object methods, class methods, getters/setters, generators, TypeScript overloads, IIFEs.
   - [ ] **Variables & Destructuring**: `const`/`let`/`var`, multiple declarators, object destructuring, array destructuring, nested destructuring, parameter destructuring, assignment expressions (`=`, `+=`, `||=`, `??=`).
   - [ ] **Classes & Objects**: Class declarations/expressions, public fields, private `#fields`, static fields/methods/blocks, getters/setters, TS constructor parameter properties, object shorthands, computed property names, object spread.
   - [ ] **Modules, Imports & Exports**: Named/default/namespace imports, side-effect imports, `import type` vs inline `type` specifiers, import attributes (`with { type: 'json' }`), dynamic `import()` (literals & static template literals), CommonJS `require('...')`, TS `import x = require('...')`, inline exports, export clauses, default exports, wildcard re-exports, `export type *`.
   - [ ] **JSX / TSX & React Composition**: Elements, fragments (`<>`, `<React.Fragment>`), member expressions (`<UI.Button />`), boolean shorthand attributes, spread attributes (`{...props}`), wrappers (`React.memo`, `React.forwardRef`, `React.lazy`, HOCs, curried HOCs).
   - [ ] **TypeScript Type Space & Scopes**: `as const`, `as Type`, `satisfies`, non-null assertion (`!`), generics, closures, variable shadowing, `catch (err)`, `for-of`/`for-in` loop heads, switch block scopes, optional chaining (`?.`).

   #### Dimension 2: Path & Environment Normalization
   - [ ] **Cross-Platform Parity**: Are paths normalized (`\` to `/`, Windows drive letters `C:/`) before any matching?
   - [ ] **Coordinate System Normalization**: Are relative paths (`./`, `../`), root aliases (`@/`, `~/`), and scoped aliases (`@components/`, `@utils/`, `@hooks/`) normalized to a single root-relative format (e.g. `toRootRelativePath`) before comparisons?
   - [ ] **Traversal Cleansing**: Are relative paths normalized (e.g. via `path.posix.normalize`) before calculating directory traversal depth?

   #### Dimension 3: False Positive & Scope Invariants
   - [ ] **Self / Descendant Safety**: Does a component/module importing its own private helpers or descendants cleanly pass without false positives?
   - [ ] **Non-Target Isolation**: Are non-target files (test files, mock files, barrel `index.ts`, non-applicable layers) cleanly ignored?
   - [ ] **Value vs Type Space**: When `allowTypeImports` or type-only operations are relevant, are types cleanly distinguished from values?

   #### Dimension 4: Engine Compatibility & Taxonomy
   - [ ] **ESLint v8/v9 Compatibility**: Zero deprecated context methods; hybrid fallbacks used (`context.sourceCode || context.getSourceCode()`).
   - [ ] **Taxonomy Classification**: Is the rule assigned to exactly one of the 6 official categories (`structure`, `architecture`, `naming`, `quality`, `react`, `testing`) in its metadata, docs, and `src/index.ts` presets?

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
