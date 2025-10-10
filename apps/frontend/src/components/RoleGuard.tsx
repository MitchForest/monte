import type { JSX } from 'solid-js';
import { Show, type ParentComponent } from 'solid-js';
import { useNavigate } from '@tanstack/solid-router';

import type { UserRole } from '@monte/types';

import { Button, Card } from '../design-system';
import { useAuth } from '../providers/AuthProvider';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  fallback?: JSX.Element;
}

const DefaultFallback = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  return (
    <Card variant="soft" class="mx-auto mt-12 max-w-md space-y-4 p-6 text-center">
      <p class="text-sm text-muted">
        {auth.isAuthenticated()
          ? 'You do not have permission to access this area.'
          : 'Please sign in to access this area.'}
      </p>
      <Show when={!auth.isAuthenticated()}>
        <Button onClick={() => void navigate({ to: '/auth/sign-in' })}>Sign in</Button>
      </Show>
    </Card>
  );
};

export const RoleGuard: ParentComponent<RoleGuardProps> = (props) => {
  const auth = useAuth();

  return (
    <Show
      when={!auth.loading()}
      fallback={<div class="flex justify-center p-6 text-sm text-muted">Checking permissions…</div>}
    >
      <Show
        when={auth.isAuthenticated() && auth.role() !== null && props.allowedRoles.includes(auth.role()!)}
        fallback={props.fallback ?? <DefaultFallback />}
      >
        {props.children}
      </Show>
    </Show>
  );
};
