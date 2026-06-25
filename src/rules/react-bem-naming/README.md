# react-bem-naming

Enforces BEM naming methodology for React component class names, with three customizable mode options.

## Options

This rule accepts an option object with the following configuration:

```json
{
  "strict-eg-rulez/react-bem-naming": ["error", { "mode": "kebab-case" }]
}
```

The `mode` property supports:

- **`kebab-case`** (default):
  BEM block, element, and modifier names must be `kebab-case`. Valid class names look like `block-name__element-name--modifier-name`.
- **`camelCase`**:
  BEM block, element, and modifier names must be `camelCase`. Useful for standard CSS module usage. Valid class names look like `blockName__elementName--modifierName`.
- **`strict`**:
  Nested elements in custom BEM syntax. The BEM block must strictly match the React component's camelCased name. Any sub-elements or modifiers must be camelCased (nested elements can use PascalCase appending inside the element name). Global classes without `__` or `--` are allowed, but BEM classes are strictly tied to their parent component.

In all modes, BEM structural bad practices are forbidden:
- Combining 3 or more underscores (`___`) or dashes (`---`)
- Chaining multiple element parts (`__el1__el2`)
- Chaining multiple modifier parts (`--mod1--mod2`)
- Having a modifier before an element (`--mod__el`)
