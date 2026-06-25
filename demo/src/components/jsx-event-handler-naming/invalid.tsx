// Missing the 'handle' prefix for a locally defined function
export const InvalidComponent1 = () => {
  const submitData = () => {};

  return <button onClick={submitData}>Submit</button>;
};

const CustomInput = ({ onListChange }: any) => <input onChange={onListChange} />;

// Strict mode requires ending with the base event name from prop ("ListChange")
export const InvalidComponent2 = () => {
  const handleChange = () => {};

  return <CustomInput onListChange={handleChange} />;
};
