import { Show, type JSX } from 'solid-js';

import { Button, Card } from '../../../shared/ui';

export type CurriculumAvailabilityStatus = 'loading' | 'offline' | 'unauthorized';

interface CurriculumAccessNoticeProps {
  status: CurriculumAvailabilityStatus;
  onSignIn?: () => void;
}

const statusCopy: Record<CurriculumAvailabilityStatus, { title: string; message: string; action?: string }> = {
  loading: {
    title: 'Checking curriculum access…',
    message: 'Hang tight while we connect to the lesson service.',
  },
  offline: {
    title: 'Curriculum service offline',
    message: 'We’re unable to reach the lesson catalog right now. Check your connection or retry in a bit.',
  },
  unauthorized: {
    title: 'Sign in required',
    message: 'You need to sign in to load your lessons and progress.',
    action: 'Sign in',
  },
};

export const CurriculumAccessNotice = (props: CurriculumAccessNoticeProps): JSX.Element => {
  const copy = () => statusCopy[props.status];
  return (
    <Card variant="soft" class="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-10 text-center">
      <div class="space-y-2">
        <h2 class="text-xl font-semibold text-[color:var(--color-heading)]">{copy().title}</h2>
        <p class="text-sm text-[color:var(--color-text-muted)]">{copy().message}</p>
      </div>
      <Show when={props.status === 'unauthorized' && copy().action}>
        <Button onClick={() => props.onSignIn?.()}>{copy().action}</Button>
      </Show>
    </Card>
  );
};
