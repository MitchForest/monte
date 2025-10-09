import type { Component } from 'solid-js';

interface YellowRibbonProps {
  length?: 'short' | 'medium' | 'long' | 'full';
}

const lengthWidth: Record<NonNullable<YellowRibbonProps['length']>, string> = {
  short: '80px',
  medium: '140px',
  long: '200px',
  full: '100%',
};

export const YellowRibbon: Component<YellowRibbonProps> = (props) => {
  const width = lengthWidth[props.length ?? 'medium'];
  return (
    <div
      class="yellow-ribbon"
      style={{ width }}
      aria-hidden="true"
    />
  );
};
