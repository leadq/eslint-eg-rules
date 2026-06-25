import React from 'react';

export const CamelCaseInvalid = () => {
  return (
    <div className="user-profile">
      {/* Element 'titleText' doesn't match camelCase rule if base is kebab */}
      <h1 className="userProfile__title-text">Invalid Case</h1>

      <h2 className="userProfile__header__title">Header</h2>

      {/* Bad modifier practice: Chaining modifiers */}
      <ul className="userProfile--isActive--large">
        <li className="userProfile__listItem--is-active">Item</li>
      </ul>

      <div className="userProfile___extraUnderscores" />
    </div>
  );
};
