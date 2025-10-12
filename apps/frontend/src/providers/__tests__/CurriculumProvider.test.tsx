import { render } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';

const registerSpy = vi.fn();
const unregisterSpy = vi.fn();

const mockManager = { mock: true } as unknown;

vi.mock('@monte/api', () => ({
  createBrowserCurriculumClientManager: vi.fn(() => mockManager),
}));

vi.mock('../../domains/curriculum/api/curriculumClient', () => ({
  registerCurriculumClientManager: registerSpy,
  unregisterCurriculumClientManager: unregisterSpy,
}));

import { CurriculumProvider } from '../CurriculumProvider';

describe('CurriculumProvider', () => {
  it('registers and unregisters the curriculum client manager', () => {
    const { unmount } = render(() => (
      <CurriculumProvider>
        <div>child</div>
      </CurriculumProvider>
    ));

    expect(registerSpy).toHaveBeenCalledWith(mockManager);

    unmount();

    expect(unregisterSpy).toHaveBeenCalledWith(mockManager);
  });
});
