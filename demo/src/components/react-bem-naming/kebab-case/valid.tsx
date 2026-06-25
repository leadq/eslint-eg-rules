import React from 'react';

export const KebabCaseValid = () => {
  return (
    <div className="user-profile">
      <h1 className="user-profile__title">Valid Kebab Case</h1>
      <ul className="user-profile__list--active">
        <li className="user-profile__list-item">Item 1</li>
      </ul>
      {/* Utility classes are allowed without BEM structure */}
      <h2 className="mt-4 flex text-center">Global Utilities</h2>
    </div>
  );
};
