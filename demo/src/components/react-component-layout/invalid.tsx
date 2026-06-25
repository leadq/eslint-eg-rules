import { useState } from 'react';

// Simulated react-router and react-query hooks
const useLocation = () => ({});
const useQuery = () => ({ data: null });

export const InvalidOrderComponent1 = () => {
  const [count, setCount] = useState(0); // 3

  // Rule Violation: "useLocation" (Group 1) defined after "useState" (Group 3)
  const location = useLocation();

  console.log(setCount, location);
  return <div>{count}</div>;
};

export const InvalidContiguousComponent = () => {
  const [count, setCount] = useState(0); // 3

  // Rule Violation: contiguous block of State hooks (Group 3) is broken by useQuery (Group 4)
  const { data } = useQuery(); // 4

  const [state, setState] = useState(1); // 3

  console.log(state);
  return (
    <div
      onClick={() => {
        setCount(2);
        setState(3);
      }}
    >
      {count} {data}
    </div>
  );
};

export const InvalidUtilityOrderComponent = () => {
  const handleClick = () => {}; // 8 (Handler)

  // Rule Violation: getFormatText (Utility, Group 7) is declared after a Handler (Group 8)
  const getFormatText = () => {
    return 'text';
  };

  return <div onClick={handleClick}>{getFormatText()}</div>;
};

export const InvalidHookAfterHandlerComponent = () => {
  const [count, setCount] = useState(0); // 3

  const handleClick = () => {
    setCount(count + 1);
  }; // 8 (Handler)

  // Rule Violation: Query hook cannot be after handler
  const { data } = useQuery(); // 4

  return <div onClick={handleClick}>{data}</div>;
};

export const InvalidMixedContiguousOrderComponent = () => {
  const getFormatStr = () => {
    return 'str';
  }; // 7 (Utility)
  const handleClick = () => {}; // 8 (Handler)

  // Rule Violation: Utility after Handler is an order error!
  // It also breaks the contiguous grouping if another utility existed.
  const getCalculate = () => {
    return 'calc';
  };

  return (
    <div onClick={handleClick}>
      {getFormatStr()} {getCalculate()}
    </div>
  );
};
