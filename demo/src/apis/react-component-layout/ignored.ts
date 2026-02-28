// This file does not contain a React Component, so it is universally ignored.
export const fetchUserAction = () => {
  const data = 'test'; // normal variable

  const handleResponse = () => {
    console.log(data);
  };

  // should NOT complain about useQuery below handler
  // because it's not a react component!
  const request = { query: 'users' };
  return { request, handler: handleResponse };
};
