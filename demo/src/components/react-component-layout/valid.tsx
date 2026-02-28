import React, { useState } from 'react';

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
