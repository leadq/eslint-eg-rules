import React from 'react';

export const CamelCaseValid = () => {
  return (
    <div className="userProfile">
      <h1 className="userProfile__titleText">Valid Camel Case</h1>
      <ul className="userProfile__listContainer--isActive">
        <li className="userProfile__listItem">Item 1</li>
      </ul>
      <h2 className="someGlobalClass">Global Class</h2>
    </div>
  );
};
