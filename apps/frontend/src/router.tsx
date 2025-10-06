import { lazy } from 'solid-js';
import { Route, Router, RootRoute } from '@tanstack/solid-router';

import App from './App';

const HomeRoute = lazy(() => import('./routes/home'));
const FormsRoute = lazy(() => import('./routes/forms'));
const TableRoute = lazy(() => import('./routes/table'));

const rootRoute = new RootRoute({
  component: App,
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeRoute,
});

const formsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/forms',
  component: FormsRoute,
});

const tableRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/table',
  component: TableRoute,
});

const routeTree = rootRoute.addChildren([indexRoute, formsRoute, tableRoute]);

export const router = new Router({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/solid-router' {
  interface Register {
    router: typeof router;
  }
}
