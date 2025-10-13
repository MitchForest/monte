import { Show, createMemo } from 'solid-js';
import { useNavigate } from '@tanstack/solid-router';

import { isCurriculumApiAvailable, isCurriculumAuthReady } from '@monte/api';
import { CurriculumAccessNotice, type CurriculumAvailabilityStatus } from '../../lesson-player';
import { useAuth } from '../../auth';
import EditorPage from './EditorPage';

type Availability = 'ready' | CurriculumAvailabilityStatus;

const EditorRoute = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const availability = createMemo<Availability>(() => {
    if (!isCurriculumApiAvailable) return 'offline';
    if (auth.loading()) return 'loading';
    if (!isCurriculumAuthReady()) return 'offline';
    if (!auth.isAuthenticated()) return 'unauthorized';
    return 'ready';
  });

  const ready = createMemo(() => availability() === 'ready');
  const fallbackStatus = createMemo<CurriculumAvailabilityStatus>(() =>
    availability() === 'ready' ? 'loading' : (availability() as CurriculumAvailabilityStatus),
  );

  const handleSignIn = () => {
    void navigate({ to: '/auth/sign-in' });
  };

  return (
    <Show
      when={ready()}
      fallback={<CurriculumAccessNotice status={fallbackStatus()} onSignIn={handleSignIn} />}
    >
      <EditorPage />
    </Show>
  );
};

export default EditorRoute;
