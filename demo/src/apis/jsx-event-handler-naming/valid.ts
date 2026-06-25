// Pure TypeScript files without JSX are entirely safe and ignored by this rule
export const onClick = () => {};

export function handleEvent() {
  const onChange = () => {};
  return {
    onClick,
    onChange, // regular object property, not JSX
  };
}
