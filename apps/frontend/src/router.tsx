import { lazy } from 'solid-js';
import { Route, Router, RootRoute } from '@tanstack/solid-router';

import App from './App';

const HomeRoute = lazy(() => import('./routes/home'));
const UnitRoute = lazy(() => import('./routes/unit'));
const LessonRoute = lazy(() => import('./routes/lesson'));
const EditorRoute = lazy(() => import('./routes/editor'));

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
  component: () => <EditorRoute />,
});

const routeTree = rootRoute.addChildren([indexRoute, unitRoute, lessonRoute, editorRoute]);

export const router = new Router({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/solid-router' {
  interface Register {
    router: typeof router;
  }
}
