import { RuleTester } from 'eslint';
import { reactComponentLayoutRule } from './index';

import parser from '@typescript-eslint/parser';
import { describe, it } from 'vitest';

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: parser as any,
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run('react-component-layout', reactComponentLayoutRule as any, {
  valid: [
    {
      code: `
        const MyComponent = (props) => {
          const { a, b } = props; // 0
          
          const location = useLocation(); // 1
          const { user } = useUserContext(); // 2
          
          const [open, setOpen] = useState(false); // 3
          const status = watch('status'); // 3
          
          // Dependency variable used in a hook 
          const queryOpt = { skip: !open }; // -1
          const { data } = useQuery('users', queryOpt); // 4

          const customData = useMyCustomHook(data); // 5

          useEffect(() => {
             console.log(customData);
          }, [customData]); // 6

          const formatUser = () => {}; // 7 (Utility)
          
          const handleClose = () => { setOpen(false); }; // 8 (Handler)
          
          const viewData = formatUser(data); // 9 (View Value because it will be used in JSX)

          if (!data) return null; // 10

          return <div value={viewData} onClick={handleClose}>OK</div>; // 11
        };
      `,
    },
    {
      code: `
        // Valid because dependency value array item comes between hook and utility but strictly before handlers!
        function Dashboard() {
          const auth = useAuthContext();
          const depVar = 'something_only_console_logged_or_passed';
          
          const submitForm = () => { console.log(depVar) }; // Utility
          
          return <div>Dashboard</div>;
        }
      `,
    },
    {
      code: `
        const Comp = () => {
          const handleAction = () => {}; // 8
          // Totally allowed now: It's a dependency var, it escapes strict flow checks.
          const dependencyVar = 10;
          return <div></div>;
        };
      `,
    },
  ],
  invalid: [
    {
      code: `
        const Comp = () => {
          const [count, setCount] = useState(0); // 3
          const location = useLocation(); // 1
          return <div></div>;
        };
      `,
      errors: [{ messageId: 'order' }],
    },
    {
      code: `
        const Comp = () => {
          const [count, setCount] = useState(0); // 3
          const { data } = useQuery(); // 4
          const [state, setState] = useState(1); // 3
          return <div></div>;
        };
      `,
      errors: [{ messageId: 'contiguous' }, { messageId: 'order' }],
    },
    {
      code: `
        const Comp = () => {
          const onSave = () => {}; // 8
          const formatText = () => {}; // 7
          return <div></div>;
        };
      `,
      errors: [{ messageId: 'order' }],
    },

    {
      code: `
        const Comp = () => {
          const [count, setCount] = useState(0); // 3
          
          const handleCheck = () => { console.log("check"); }; // 8
          
          const { data } = useQuery(); // 4 (Query hook cannot be after handler)
          
          return <div onClick={handleCheck}></div>;
        };
      `,
      errors: [{ messageId: 'order' }],
    },
    {
      code: `
        const Comp = () => {
           const formatStr = () => {}; // 7
           const onClick = () => {}; // 8
           const calculate = () => {}; // 7 (Utility after Handler is an order error! Wait no, 7 after 8 is order error but also contiguous error might be triggered if previously 7 was seen!)
           return <div></div>;
        }
      `,
      errors: [{ messageId: 'contiguous' }, { messageId: 'order' }],
    },
  ],
});
