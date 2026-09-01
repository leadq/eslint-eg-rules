# Project Instructions

This is an ESLint plugin project (`eslint-eg-rules`). All custom ESLint rule development **must** follow the comprehensive skills and taxonomy defined in this repository.

## Rule Categories & Taxonomy

Every rule developed or evaluated in this project **MUST** be classified into exactly one of these 6 official categories:

1. 📁 **`structure`**: Physical file and folder anatomy, folder-level allowed files, naming patterns for files/directories (e.g. `apis/` folder anatomy, `PascalCase/index.tsx` component folder skeletons).
2. 🏗️ **`architecture`**: Dependency directions, layer boundaries, colocation boundaries, and component layout declarations (e.g. `util-hook-colocation`, `no-upstream-imports`, `react-component-layout`).
3. 🏷️ **`naming`**: Semantic naming conventions for functions, variables, props, types, and event handlers (e.g. `boolean-prop-naming`, `component-callback-naming`, `jsx-event-handler-naming`, `functions-naming`, `api-type-suffix`, `react-component-props-naming-check`, `react-bem-naming`).
4. 💎 **`quality`**: Code maintainability, Single Responsibility Principle (SRP), complexity control, guard clauses, parameter limits, and clean code practices (e.g. `util-hook-single-export`, `no-complex-jsx-logic`, `prefer-early-return`).
5. ⚛️ **`react`**: React-specific lifecycle, hooks correctness, render safety, and component export constraints (e.g. `react-export-single-component-check`, `no-unused-deps-in-hooks`).
6. 🧪 **`testing`**: Test file conventions, test description phrasing, and test attribute checks (e.g. `test-statement-match`, `no-test-attrs`).

## Available Project Skills

1. 📄 **[Rule Writing Workflow (`.agents/skills/eslint-rule-writing/SKILL.md`)](.agents/skills/eslint-rule-writing/SKILL.md)**
   - AST coverage analysis (all JS/TS representations, module boundaries, analysis layer selection)
   - Rule category evaluation and classification
   - Test-Driven Development workflow
   - Rule implementation with AST normalization
   - **Universal Hardening Gate (4-Dimension Edge Case Checklist: AST Invariance, Path Parity, False Positive Invariants, Engine Compatibility)**
   - Integration, registration, and build steps
   - Demo project E2E testing
   - Project documentation sync
   - ESLint v8/v9 compatibility requirements

2. 📄 **[Existing Rules Catalog (`.agents/skills/eslint-eg-rules/SKILL.md`)](.agents/skills/eslint-eg-rules/SKILL.md)**
   - Complete catalog and code examples (✅ / ❌) for all existing plugin rules organized by category.

> **Important:** The skill files and taxonomy above are the single source of truth for developing, evaluating, and categorizing rules in this project.

## Additional Context

- **Language**: Use English for all code, documentation, and error messages. Turkish is acceptable in chat/conversation mode only.

