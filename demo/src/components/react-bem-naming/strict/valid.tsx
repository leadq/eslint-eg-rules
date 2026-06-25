import React from 'react';

export const StrictModeComponent = () => {
  return (
    <div className="strictModeComponent">
      <h1 className="strictModeComponent__title">Valid Strict Match</h1>
      <ul className="strictModeComponent__listContainer--isActive">
        <li className="strictModeComponent__listItem">Item 1</li>
        <li className="strictModeComponent__listItemInnerItem">Item 2</li>
      </ul>
      {/* Utility classes and globals without BEM characters are allowed */}
      <h2 className="mt-4 flex text-center">Global Utilities</h2>
    </div>
  );
};

export const NormalArrowComp = () => <div className="normalArrowComp__content" />;

export function RegularFunctionComp() {
  return <div className="regularFunctionComp__content" />;
}
