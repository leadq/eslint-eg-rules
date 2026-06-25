# test-statement-match

Enforce conventions for test descriptions in `it` and `test` statements to make your test suites more readable and standardized.

This rule enforces two independent conventions:
- For `it` statements: the description must start with `"should "`. (e.g., `it('should render the component', () => { ... })`)
- For `test` statements: the description must contain a conjunction to make sentences grammatically structured. (e.g., `test('renders correctly when open is true', () => { ... })`)

## Rule Details

### Valid Examples

\`\`\`js
// \`it\` starting with "should "
it('should return true for valid inputs', () => { ... });

// \`test\` with a conjunction
test('logs an error when the network fails', () => { ... });
test('loads data if user is logged in', () => { ... });
\`\`\`

### Invalid Examples

\`\`\`js
// \`it\` block missing "should " prefix
it('returns true', () => { ... });

// \`it\` block missing space
it('shouldReturn true', () => { ... });

// \`test\` block missing conjunction
test('loads data', () => { ... });
test('fails', () => { ... });
\`\`\`

## Options

The rule has a single object option with a `conjunctions` property:

\`\`\`js
"eg-rules/test-statement-match": ["error", {
  "conjunctions": [
    "if", "when", "while", "after", "before", "with", "without", "unless", "since", "until", "for", "during"
  ],
  "ignoreTestPatterns": ["\\.utils\\.test\\.ts$"]
}]
\`\`\`

### \`conjunctions\`

An array of strings that are checked against the `test` statements' description using word boundaries. If you provide your own array, it will override the default list completely.

### \`ignoreTestPatterns\`

An array of regex string patterns. Useful if you want to exclude certain customized file paths or utilities inside your test folders that would otherwise trigger this rule. By default:
- `*.test.*` and `*.spec.*` files are handled as tests.
- Files inside `__tests__` or `__specs__` are handled as tests **except** `.mock.` files.
