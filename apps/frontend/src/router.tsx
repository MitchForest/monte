import { lazy } from 'solid-js';
import { Route, Router, RootRoute } from '@tanstack/solid-router';

import App from './App';
import { RoleGuard } from './components/RoleGuard';

const HomeRoute = lazy(() => import('./routes/home'));
const UnitRoute = lazy(() => import('./routes/unit'));
const LessonRoute = lazy(() => import('./routes/lesson'));
const EditorRoute = lazy(() => import('./routes/editor'));
const SignInRoute = lazy(() => import('./routes/auth/sign-in'));
const SignUpRoute = lazy(() => import('./routes/auth/sign-up'));

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
    <RoleGuard allowedRoles={['admin', 'curriculum_writer']}>
      <EditorRoute />
    </RoleGuard>
  ),
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  unitRoute,
  lessonRoute,
  editorRoute,
  signInRoute,
  signUpRoute,
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
