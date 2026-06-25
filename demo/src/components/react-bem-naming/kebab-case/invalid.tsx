import React from 'react';

export const KebabCaseInvalid = () => {
  return (
    <div className="userProfile">
      {/* Element 'titleText' doesn't match kebab-case rule */}
      <h1 className="user-profile__titleText">Invalid Case</h1>

      {/* Multiple element chaining is a BEM bad practice */}
      <h2 className="user-profile__header__title">Header</h2>

      {/* Bad modifier practice: Chaining modifiers */}
      <ul className="user-profile--active--large">
        <li className="user-profile__list-item--isActive">Item</li>
      </ul>

      <div className="user-profile___extra-underscores" />
    </div>
  );
};
