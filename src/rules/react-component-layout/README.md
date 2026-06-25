# react-component-layout

Enforces a strict, highly readable grouping layout for statement definition within React components. It divides component layout into structured 'Zones' to maximize MVC/MVVM standards in your View patterns.

### The Zones & Ordering Rules
Statements inside a React Component body are enforced to follow this order:
1. `Props Destructuring` (if `props` directly injected)
2. `Priority Hooks` (useLocation, useRouter, useTranslation, useNavigate)
3. `Context Hooks` (use*Context)
4. `State Hooks` (useState, useReducer, watch)
   * \`watch()\` can uniquely be called **only once**.
   * Local states must be grouped together continuously (no spreading chunks).
5. `Query Hooks` (use*Query, useMutation)
6. `Custom Hooks` (use*)
7. `Effect Hooks` (useEffect, useMemo, useCallback)
8. `Utility/Helper Functions` (Normal functions or arrow functions without handler prefixes)
9. `Event Handlers` (Functions with \`on*\` or \`handle*\` prefix)
10. `View Values` (Variables that are exclusively tied inside the returned JSX component)
11. `Early Returns` (If statements returning components)
12. `JSX Return` (Main return)

#### Edge Cases Exemption (Dependency Values)
Any value or literal parameter declaration that is NOT used in JSX or Return is considered a "Dependency Value". You can declare dependency values freely (to satisfy immediate prop needs of lower hooks), as long as they are placed **Before** the Event Handlers zone.

### Examples

**❌ Incorrect:**
```typescript
const UserCard = () => {
    const [count, setCount] = useState(0);
    const { user } = useUserContext(); // ❌ should be before useState
    
    const handleClose = () => setCount(0);
    const { data } = useQuery('details'); // ❌ Hook defined below handler

    const status = watch('status'); // ❌ watch called separate from useState, breaking contiguous state definitions rule.

    return <div>User</div>;
}
```

**✅ Correct:**
```typescript
const UserCard = () => {
    const { user } = useUserContext();
    const [count, setCount] = useState(0);
    const status = watch('status'); 

    // Dependency value (Allowed above hooks freely)
    const options = { skip: !user };
    const { data } = useQuery('details', options);

    const handleClose = () => setCount(0);

    // View Value (Derived state used specifically in JSX)
    const isReady = data && count > 0;

    return <div data-ready={isReady}>User</div>;
}
```
