import React from 'react';

interface CardProps {
  refetch: () => void; // error: missing 'on' prefix
  onClicked: () => void; // error: past tense 'Clicked'
  onThatChanged: () => void; // error: past tense 'Changed'
}

// Card is detected as a React component because it starts with Capital letter
// Thus CardProps interface gets checked
export const Card = ({ refetch }: CardProps) => {
  return <div onClick={refetch}>Hello</div>;
};

// Also another invalid usage with regular typescript type alias
type ModalProps = {
  fetchData(): void;
};

export function Modal(props: ModalProps) {
  return <div>Modal</div>;
}
