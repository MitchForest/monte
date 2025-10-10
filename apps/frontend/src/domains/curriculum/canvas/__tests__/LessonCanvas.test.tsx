import type { Component, JSX } from 'solid-js';
import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';

const designSystemStub = vi.hoisted(() => {
  type ButtonStubProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & { children: JSX.Element };
  const StubButton: Component<ButtonStubProps> = (props) => {
    const { children, ...rest } = props;
    return (
      <button type="button" {...rest}>
        {children}
      </button>
    );
  };

  return { Button: StubButton };
});

vi.mock('../../../../design-system', () => designSystemStub);
vi.mock('../../../../design-system/index.ts', () => designSystemStub);
vi.mock('../../../../design-system/index.tsx', () => designSystemStub);

import { LessonCanvas } from '../LessonCanvas';

describe('LessonCanvas', () => {
  it('renders children and default controls', () => {
    render(() => (
      <LessonCanvas data-variant="test">
        <div>Canvas content</div>
      </LessonCanvas>
    ));

    expect(screen.getByText('Canvas content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
  });
});
