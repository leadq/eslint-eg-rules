import React from 'react';

// Proves non-target folder (apis/) is ignored by react-component-props-naming-check
interface ApiPayloadModel {
  data: string;
}

export function ApiView(props: ApiPayloadModel) {
  return <div>{props.data}</div>;
}
