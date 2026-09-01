// Non-target path check: .ts files in apis/ are ignored by react-export-single-component-check

export function FetchUser() {
  return { id: '1', name: 'User' };
}

export function FetchPosts() {
  return [{ id: '1', title: 'Post' }];
}
