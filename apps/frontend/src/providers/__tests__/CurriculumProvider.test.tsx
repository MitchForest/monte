import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';

import { CurriculumProvider } from '../CurriculumProvider';

describe('CurriculumProvider', () => {
  it('renders children without side effects', () => {
    const result = render(() => (
      <CurriculumProvider>
        <div data-testid="child" />
      </CurriculumProvider>
    ));

    expect(result.getByTestId('child')).toBeInTheDocument();
  });
});
