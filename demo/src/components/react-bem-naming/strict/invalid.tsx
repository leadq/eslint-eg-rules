import React from 'react';

export const StrictModeComponent = () => {
  return (
    <div className="container">
      {/* Element 'title' matches strict but block doesn't match React component Name */}
      <h1 className="container__title">Invalid Root Match</h1>

      {/* Multiple element chaining is invalid */}
      <h2 className="strictModeComponent__header__title">Header</h2>

      {/* Bad modifier practice */}
      <ul className="strictModeComponent--isActive--isLarge">
        {/* Strict expects lower camelCase for modifiers */}
        <li className="strictModeComponent__listItem--IsActive">Item</li>
      </ul>

      {/* Dash chaining with kebab part */}
      <div className="strictModeComponent__list-item--is-active" />
    </div>
  );
};
