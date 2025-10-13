import { lazy } from 'solid-js';
import { Route, Router, RootRoute } from '@tanstack/solid-router';

import App from './App';
import { RoleGuard } from '../features/auth';

const HomeRoute = lazy(async () => {
  const mod = await import('../features/lesson-player');
  return { default: mod.HomePage };
});
const UnitRoute = lazy(async () => {
  const mod = await import('../features/lesson-player');
  return { default: mod.UnitPage };
});
const LessonRoute = lazy(async () => {
  const mod = await import('../features/lesson-player');
  return { default: mod.LessonPage };
});
const EditorRoute = lazy(() => import('../features/editor/pages/EditorRoute'));
const SignInRoute = lazy(() => import('../features/auth/pages/SignInPage'));
const SignUpRoute = lazy(() => import('../features/auth/pages/SignUpPage'));
const AcceptInvitationRoute = lazy(() => import('../features/auth/pages/AcceptInvitationPage'));
const AppPortalRoute = lazy(() => import('../features/auth/pages/AppPortalPage'));

const rootRoute = new RootRoute({
  component: App,
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <HomeRoute />,
});

const unitRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/units/$unitSlug',
  component: () => <UnitRoute />,
});

const lessonRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/units/$unitSlug/lessons/$lessonSlug',
  component: () => <LessonRoute />,
});

const editorRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/editor',
  component: () => (
    <RoleGuard allowedRoles={['admin', 'owner']}>
      <EditorRoute />
    </RoleGuard>
  ),
});

const appRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: () => <AppPortalRoute />,
});

const signInRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/auth/sign-in',
  component: () => <SignInRoute />,
});

const signUpRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/auth/sign-up',
  component: () => <SignUpRoute />,
});

const acceptInvitationRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/auth/invitations/accept',
  component: () => <AcceptInvitationRoute />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  unitRoute,
  lessonRoute,
  editorRoute,
  appRoute,
  signInRoute,
  signUpRoute,
  acceptInvitationRoute,
]);

export const router = new Router({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/solid-router' {
  interface Register {
    router: typeof router;
  }
}
