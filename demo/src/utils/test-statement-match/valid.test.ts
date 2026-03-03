import { it, test } from 'vitest';

// Proving that valid "should" prefix avoids rule warning:
it('should render the valid component exactly', () => {});

// Proving that conjunctions pass the rule:
test('renders correctly when open is true', () => {});
