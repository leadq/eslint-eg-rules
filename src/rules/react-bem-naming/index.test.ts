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
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run('react-bem-naming', rule, {
  valid: [
    // kebab-case mode
    {
      code: 'const MyComp = () => <div className="card__title--active" />;',
      options: [{ mode: 'kebab-case' }],
    },
    {
      code: 'const MyComp = () => <div className="mt-4 flex" />;',
      options: [{ mode: 'kebab-case' }],
    },
    {
      code: 'const MyComp = () => <div className={classNames("card__title", {"card__title--active": isActive})} />;',
      options: [{ mode: 'kebab-case' }],
    },
    // camelCase mode
    {
      code: 'const MyComp = () => <div className={styles.cardTitle} />;',
      options: [{ mode: 'camelCase' }],
    },
    {
      code: 'const MyComp = () => <div className={styles["cardTitle__content--active"]} />;',
      options: [{ mode: 'camelCase' }],
    },
    // strict mode
    {
      code: 'const SortableHeaderCell = () => <th className={styles["sortableHeaderCell__content--active"]} />;',
      options: [{ mode: 'strict' }],
    },
    {
      code: 'const SortableHeaderCell = () => <th className="sortableHeaderCell__content--active" />;',
      options: [{ mode: 'strict' }],
    },
    {
      code: 'const Header = () => <div className={styles.header__contentLeft} />;',
      options: [{ mode: 'strict' }],
    },
  ],
  invalid: [
    {
      code: 'const MyComp = () => <div className="card___title" />;',
      options: [{ mode: 'kebab-case' }],
      errors: [{ messageId: 'invalidTripleUnderscore' }],
    },
    {
      code: 'const MyComp = () => <div className="card---active" />;',
      options: [{ mode: 'kebab-case' }],
      errors: [{ messageId: 'invalidTripleDash' }],
    },
    {
      code: 'const MyComp = () => <div className="card__title__icon" />;',
      options: [{ mode: 'kebab-case' }],
      errors: [{ messageId: 'invalidMultipleUnderscoreChains' }],
    },
    {
      code: 'const MyComp = () => <div className="card--active--large" />;',
      options: [{ mode: 'kebab-case' }],
      errors: [{ messageId: 'invalidMultipleDashChains' }],
    },
    {
      code: 'const MyComp = () => <div className="card--active__icon" />;',
      options: [{ mode: 'kebab-case' }],
      errors: [{ messageId: 'invalidModifierBeforeElement' }],
    },
    {
      code: `
        const SortableHeaderCell = () => {
           return <th className={classNames('reactable-table__th')} />
        }
      `,
      options: [{ mode: 'strict' }],
      errors: [
        {
          messageId: 'strictRootExpected',
          data: { val: 'reactable-table', componentName: 'sortableHeaderCell' },
        },
      ],
    },
    {
      code: `
        const SortableHeaderCell = () => {
           return <th className={styles.table__th} />
        }
      `,
      options: [{ mode: 'strict' }],
      errors: [
        {
          messageId: 'strictRootExpected',
          data: { val: 'table', componentName: 'sortableHeaderCell' },
        },
      ],
    },
    {
      code: `
        const SortableHeaderCell = () => {
           return <th className={styles['table__th--dragging']} />
        }
      `,
      options: [{ mode: 'strict' }],
      errors: [
        {
          messageId: 'strictRootExpected',
          data: { val: 'table', componentName: 'sortableHeaderCell' },
        },
      ],
    },
    {
      code: 'const SortableHeaderCell = () => <th className="sortableHeaderCell__content-right" />;',
      options: [{ mode: 'strict' }],
      errors: [{ messageId: 'camelCaseExpected', data: { part: 'element', val: 'content-right' } }],
    },
    {
      code: 'const SortableHeaderCell = () => <th className="sortableHeaderCell__contentRight--is-active" />;',
      options: [{ mode: 'strict' }],
      errors: [{ messageId: 'camelCaseExpected', data: { part: 'modifier', val: 'is-active' } }],
    },
    {
      code: 'const SortableHeaderCell = () => <th className="SortableHeaderCell__contentRight" />;',
      options: [{ mode: 'strict' }],
      errors: [
        {
          messageId: 'strictRootExpected',
          data: { val: 'SortableHeaderCell', componentName: 'sortableHeaderCell' },
        },
      ],
    },
    {
      code: 'const SortableHeaderCell = () => <th className="sortableHeaderCell--IsActive" />;',
      options: [{ mode: 'strict' }],
      errors: [{ messageId: 'camelCaseExpected', data: { part: 'modifier', val: 'IsActive' } }],
    },
  ],
});
