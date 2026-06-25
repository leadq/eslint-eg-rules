// Passed from props, so should be ignored
export const ValidComponent1 = ({ onClick, onListChange }: any) => {
  return (
    <div>
      <button onClick={onClick}>Click</button>
      <input onChange={onListChange} />
    </div>
  );
};

// Handlers start with handle and have proper strict matches
export const ValidComponent2 = () => {
  const handleClick = () => {};
  const handleListChange = () => {};

  return (
    <div>
      <button onClick={handleClick}>Click</button>
      <input onChange={handleListChange} />
    </div>
  );
};

// Functions declared outside of component scope (e.g. at module level) are ignored
const externalClickHandler = () => {};

export const ValidComponent3 = () => {
  return <button onClick={externalClickHandler}>External</button>;
};
