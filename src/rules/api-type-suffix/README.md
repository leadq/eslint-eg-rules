# Enforce specific suffixes for types/interfaces in the API folder (`api-type-suffix`)

This rule enforces that any `interface` or `type` defined in a file under `src/apis/` must end with a specific suffix. By default, it requires `Model`, `Request`, or `Response`. The rule also ensures that the allowed suffixes are not used consecutively at the end of the identifier name.

## Rule Details

This rule checks the `id.name` of `TSInterfaceDeclaration` and `TSTypeAliasDeclaration` nodes. It only operates if the file path contains `src/apis/`.

### Options

The rule accepts an options object with the following properties:

*   `suffixes`: An array of strings representing the allowed suffixes. If not provided, it defaults to `['Model', 'Response', 'Request']`.

#### Examples

**Default options:**

👎 Examples of **incorrect** code:

```typescript
// /src/apis/user.ts
interface UserRequestModel {} // Consecutive suffixes 'Request' + 'Model'
type UserResponseData = {};   // Does not end with 'Model', 'Request', or 'Response'
```

👍 Examples of **correct** code:

```typescript
// /src/apis/user.ts
interface UserModel {}
type UserResponse = {};
interface RequestHelperModel {}

// /src/components/User.ts (Ignored since it's outside src/apis/)
interface UserRequestModel {}
```

**Custom suffixes `['DTO', 'Entity']`:**

👎 Examples of **incorrect** code:

```typescript
// /src/apis/order.ts
interface OrderDTOEntity {} // Consecutive suffixes
type OrderModel = {};       // Does not end with 'DTO' or 'Entity'
```

👍 Examples of **correct** code:

```typescript
// /src/apis/order.ts
interface OrderDTO {}
type OrderEntity = {};
```
