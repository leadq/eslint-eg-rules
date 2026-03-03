import { useState } from 'react';

// Example of a completely valid component layout!
const UserProfile = (props: any) => {
  const { id } = props; // 0. props destruct

  const [user, setUser] = useState(null); // 3. state
  const [loading, setLoading] = useState(true); // 3. state contiguous

  // Dependency constraint: not used in JSX, so it stays perfectly fine here.
  const queryStr = `id=${id}`;
  console.log('Loading', queryStr); // Another dependency side effect

  const refetchOptions = { enabled: !loading }; // -1 constraint
  console.log(refetchOptions, setUser, setLoading);

  const formatUsername = () => {
    // 7. Utility
    return user ? '@' + user : 'Unknown';
  };

  const handleClick = () => {
    // 8. Handler
    console.log('refresh');
  };

  // View value: Used in JSX, forced to stay here.
  if (loading) return <div>Loading...</div>; // 10. Early return
  const displayUser = formatUsername();

  return (
    // 11. JSX Return
    <div onClick={handleClick}>{displayUser}</div>
  );
};

export default UserProfile;

// Valid because dependency value array item comes between hook and utility but strictly before handlers!
export function DashboardContiguousEscape() {
  const [data, setData] = useState<any>(null); // State hook

  const queryStr = 'something_only_console_logged_or_passed'; // Dependency Value

  const getCalculate = () => {
    console.log(queryStr, data);
    return 'a';
  }; // Utility

  return <div onClick={() => setData(1)}>Dashboard {getCalculate()}</div>;
}

// Another valid case where Dependency variable comes after Handlers!
export const ComponentDependencyAfterHandler = () => {
  const [count, setCount] = useState(0); // State Hook

  const handleClick = () => {
    setCount(count + 1);
  }; // Handler

  // Totally allowed now: It's a dependency var, it escapes strict flow checks.
  const dependencyVar = 10;

  return <div onClick={handleClick}>{dependencyVar}</div>;
};
