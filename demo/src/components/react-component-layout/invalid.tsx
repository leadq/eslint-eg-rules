import React, { useState, useEffect } from 'react';

const DashboardInvalid = () => {
  const [isOpen, setIsOpen] = useState(false); // 3. State

  // Rule Violation: "Dependency Values" cannot come after Handlers.
  useEffect(() => {
    console.log(data);
  }, []);
  const [data, setData] = useState([]);
  const handleClick = () => setIsOpen(!isOpen); // 8. Handler

  // Rule Violation: State hook defined after Handler
  // 3. State

  // Rule violation: Effect Hook defined after handler

  return <div onClick={handleClick}>Hello</div>;
};

export default DashboardInvalid;
