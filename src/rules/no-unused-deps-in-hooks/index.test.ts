import { RuleTester } from '@typescript-eslint/rule-tester';
import { describe, it, afterAll } from 'vitest';
import rule from './index';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run('no-unused-deps-in-hooks', rule, {
  valid: [
    // ✅ All dependencies used inside useEffect
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ a, b }) => {
          useEffect(() => {
            console.log(a, b);
          }, [a, b]);
          return null;
        };
      `,
    },
    // ✅ Member expression dependency (user.id) used as user.id in callback
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ user }) => {
          useEffect(() => {
            fetchUser(user.id);
          }, [user.id]);
          return null;
        };
      `,
    },
    // ✅ Dependency used inside object shorthand property
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ data }) => {
          useEffect(() => {
            sendPayload({ data });
          }, [data]);
          return null;
        };
      `,
    },
    // ✅ Dependency used inside JSX expression
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ title }) => {
          useEffect(() => {
            const el = <Header title={title} />;
          }, [title]);
          return null;
        };
      `,
    },
    // ✅ useCallback with all dependencies referenced
    {
      code: `
        import { useCallback } from 'react';
        const MyComp = ({ count }) => {
          const increment = useCallback(() => {
            return count + 1;
          }, [count]);
          return null;
        };
      `,
    },
    // ✅ React.useMemo with all dependencies referenced
    {
      code: `
        import React from 'react';
        const MyComp = ({ x, y }) => {
          const result = React.useMemo(() => {
            return x * y;
          }, [x, y]);
          return null;
        };
      `,
    },

    // ───── Edge Case: Optional Chaining ─────

    // ✅ Optional chaining dep — exact same property used in callback
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ user }) => {
          useEffect(() => {
            console.log(user.id);
          }, [user?.id]);
          return null;
        };
      `,
    },
    // ✅ Optional chaining dep — parent object accessed standalone in callback
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ user }) => {
          useEffect(() => {
            const u = user;
          }, [user?.id]);
          return null;
        };
      `,
    },
    // ✅ Member expression dep — computed property access (conservative: obj[key] covers all props)
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ user }) => {
          useEffect(() => {
            const val = user[dynamicKey];
          }, [user.id]);
          return null;
        };
      `,
    },
    // ✅ Optional chaining used inside callback body
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ user }) => {
          useEffect(() => {
            console.log(user?.name);
          }, [user]);
          return null;
        };
      `,
    },

    // ───── Edge Case: TSNonNullExpression ─────

    // ✅ Non-null assertion dep — root identifier used in callback
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ value }) => {
          useEffect(() => {
            process(value);
          }, [value!]);
          return null;
        };
      `,
    },

    // ───── Edge Case: Computed Property Key ─────

    // ✅ Dep used as computed property key
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ key }) => {
          useEffect(() => {
            const val = obj[key];
          }, [key]);
          return null;
        };
      `,
    },

    // ───── Edge Case: Destructuring ─────

    // ✅ Dep used via destructuring inside callback
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ user }) => {
          useEffect(() => {
            const { id, name } = user;
            console.log(id, name);
          }, [user]);
          return null;
        };
      `,
    },

    // ───── Edge Case: Template Literal ─────

    // ✅ Dep used inside template literal
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ name }) => {
          useEffect(() => {
            const greeting = \`Hello \${name}\`;
          }, [name]);
          return null;
        };
      `,
    },

    // ───── Edge Case: Spread Arguments ─────

    // ✅ Dep used as spread argument
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ args }) => {
          useEffect(() => {
            fn(...args);
          }, [args]);
          return null;
        };
      `,
    },

    // ───── Edge Case: Function Reference as Dep ─────

    // ✅ Dep passed as callback argument
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ fn }) => {
          useEffect(() => {
            arr.map(fn);
          }, [fn]);
          return null;
        };
      `,
    },

    // ───── Edge Case: Custom Hook Option ─────

    // ✅ Custom hook with hooks option — all deps used
    {
      code: `
        const MyComp = ({ a }) => {
          useCustomEffect(() => {
            doStuff(a);
          }, [a]);
          return null;
        };
      `,
      options: [{ hooks: ['useCustomEffect'] }],
    },

    // ───── Edge Case: useLayoutEffect / useInsertionEffect ─────

    // ✅ useLayoutEffect with all deps used
    {
      code: `
        import { useLayoutEffect } from 'react';
        const MyComp = ({ width }) => {
          useLayoutEffect(() => {
            el.style.width = width + 'px';
          }, [width]);
          return null;
        };
      `,
    },
    // ✅ useInsertionEffect with all deps used
    {
      code: `
        import { useInsertionEffect } from 'react';
        const MyComp = ({ theme }) => {
          useInsertionEffect(() => {
            applyTheme(theme);
          }, [theme]);
          return null;
        };
      `,
    },

    // ───── Edge Case: Multiple Member Expression Deps ─────

    // ✅ Multiple member expression deps all used
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ a, c }) => {
          useEffect(() => {
            console.log(a.b, c.d);
          }, [a.b, c.d]);
          return null;
        };
      `,
    },

    // ───── Edge Case: Nested Function Call ─────

    // ✅ Dep used deep inside nested function calls
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ x }) => {
          useEffect(() => {
            foo(bar(baz(x)));
          }, [x]);
          return null;
        };
      `,
    },

    // ───── Edge Case: Empty Deps Array ─────

    // ✅ Empty dependency array — nothing to check
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = () => {
          useEffect(() => {
            console.log('mount');
          }, []);
          return null;
        };
      `,
    },

    // ───── Edge Case: Spread in Deps Array ─────

    // ✅ Spread element in deps array — should be skipped
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ extra }) => {
          const deps = [extra];
          useEffect(() => {
            console.log('effect');
          }, [...deps]);
          return null;
        };
      `,
    },

    // ───── Edge Case: Non-function callback (identifier ref) ─────

    // ✅ Callback is an identifier reference — rule silently skips
    {
      code: `
        import { useCallback } from 'react';
        const MyComp = ({ a, b }) => {
          const fn = () => doSomething(a);
          const memoized = useCallback(fn, [a, b]);
          return null;
        };
      `,
    },

    // ───── Edge Case: Deps is not array literal ─────

    // ✅ Deps argument is a variable reference — rule silently skips
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ a }) => {
          const deps = [a];
          useEffect(() => {
            console.log(a);
          }, deps);
          return null;
        };
      `,
    },
  ],
  invalid: [
    // ❌ Unused variable 'unusedVar' in useEffect deps array
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ a, unusedVar }) => {
          useEffect(() => {
            console.log(a);
          }, [a, unusedVar]);
          return null;
        };
      `,
      errors: [
        {
          messageId: 'unusedDependency',
          data: { name: 'unusedVar', hookName: 'useEffect' },
        },
      ],
    },
    // ❌ Unused variable in useCallback deps array
    {
      code: `
        import { useCallback } from 'react';
        const MyComp = ({ count, extra }) => {
          const fn = useCallback(() => {
            console.log(count);
          }, [count, extra]);
          return null;
        };
      `,
      errors: [
        {
          messageId: 'unusedDependency',
          data: { name: 'extra', hookName: 'useCallback' },
        },
      ],
    },
    // ❌ Unused variable in useMemo deps array
    {
      code: `
        import { useMemo } from 'react';
        const MyComp = ({ width, height, dummy }) => {
          const area = useMemo(() => {
            return width * height;
          }, [width, height, dummy]);
          return null;
        };
      `,
      errors: [
        {
          messageId: 'unusedDependency',
          data: { name: 'dummy', hookName: 'useMemo' },
        },
      ],
    },
    // ❌ Literal value in deps array
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ val }) => {
          useEffect(() => {
            console.log(val);
          }, [val, 123]);
          return null;
        };
      `,
      errors: [
        {
          messageId: 'unusedDependency',
          data: { name: '123', hookName: 'useEffect' },
        },
      ],
    },

    // ───── Edge Case: Optional Chaining Dep — Unused ─────

    // ❌ Optional chaining dep where root identifier is NOT used in callback
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ user, other }) => {
          useEffect(() => {
            console.log(other);
          }, [user?.id, other]);
          return null;
        };
      `,
      errors: [
        {
          messageId: 'unusedDependency',
          data: { name: 'user.id', hookName: 'useEffect' },
        },
      ],
    },

    // ───── Edge Case: TSNonNullExpression Dep — Unused ─────

    // ❌ Non-null assertion dep where root identifier is NOT used in callback
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ value, other }) => {
          useEffect(() => {
            console.log(other);
          }, [value!, other]);
          return null;
        };
      `,
      errors: [
        {
          messageId: 'unusedDependency',
          data: { name: 'value', hookName: 'useEffect' },
        },
      ],
    },

    // ───── Edge Case: Multiple Unused Deps ─────

    // ❌ All deps unused
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ a, b, c }) => {
          useEffect(() => {
            console.log('nothing used');
          }, [a, b, c]);
          return null;
        };
      `,
      errors: [
        {
          messageId: 'unusedDependency',
          data: { name: 'a', hookName: 'useEffect' },
        },
        {
          messageId: 'unusedDependency',
          data: { name: 'b', hookName: 'useEffect' },
        },
        {
          messageId: 'unusedDependency',
          data: { name: 'c', hookName: 'useEffect' },
        },
      ],
    },

    // ───── Edge Case: Member Expression Dep — Unused ─────

    // ❌ Member expression dep where root is NOT used in callback
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ obj, other }) => {
          useEffect(() => {
            console.log(other);
          }, [obj.prop, other]);
          return null;
        };
      `,
      errors: [
        {
          messageId: 'unusedDependency',
          data: { name: 'obj.prop', hookName: 'useEffect' },
        },
      ],
    },

    // ───── Edge Case: Custom Hook with Unused Dep ─────

    // ❌ Custom hook option — unused dep
    {
      code: `
        const MyComp = ({ a, unused }) => {
          useCustomEffect(() => {
            doStuff(a);
          }, [a, unused]);
          return null;
        };
      `,
      options: [{ hooks: ['useCustomEffect'] }],
      errors: [
        {
          messageId: 'unusedDependency',
          data: { name: 'unused', hookName: 'useCustomEffect' },
        },
      ],
    },

    // ───── Edge Case: useLayoutEffect Unused Dep ─────

    // ❌ useLayoutEffect with unused dep
    {
      code: `
        import { useLayoutEffect } from 'react';
        const MyComp = ({ width, stale }) => {
          useLayoutEffect(() => {
            el.style.width = width + 'px';
          }, [width, stale]);
          return null;
        };
      `,
      errors: [
        {
          messageId: 'unusedDependency',
          data: { name: 'stale', hookName: 'useLayoutEffect' },
        },
      ],
    },

    // ───── Edge Case: Property Key Same Name (Non-Shorthand) — Not a Reference ─────

    // ❌ Dep name appears only as a non-shorthand property key — NOT a reference
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ foo }) => {
          useEffect(() => {
            const obj = { foo: 123 };
          }, [foo]);
          return null;
        };
      `,
      errors: [
        {
          messageId: 'unusedDependency',
          data: { name: 'foo', hookName: 'useEffect' },
        },
      ],
    },

    // ───── Edge Case: Member Expression Property Same Name — Not a Reference ─────

    // ❌ Dep name appears only as non-computed member expression property — NOT a reference
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ name }) => {
          useEffect(() => {
            console.log(obj.name);
          }, [name]);
          return null;
        };
      `,
      errors: [
        {
          messageId: 'unusedDependency',
          data: { name: 'name', hookName: 'useEffect' },
        },
      ],
    },

    // ───── Edge Case: Different Property — Path Mismatch ─────

    // ❌ Member expression dep with different property used in callback
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ user }) => {
          useEffect(() => {
            console.log(user.name);
          }, [user.id]);
          return null;
        };
      `,
      errors: [
        {
          messageId: 'unusedDependency',
          data: { name: 'user.id', hookName: 'useEffect' },
        },
      ],
    },

    // ❌ Optional chaining dep with different property used in callback
    {
      code: `
        import { useEffect } from 'react';
        const MyComp = ({ user }) => {
          useEffect(() => {
            console.log(user.name);
          }, [user?.id]);
          return null;
        };
      `,
      errors: [
        {
          messageId: 'unusedDependency',
          data: { name: 'user.id', hookName: 'useEffect' },
        },
      ],
    },
  ],
});
