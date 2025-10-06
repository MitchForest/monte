/* @refresh reload */
import { render } from 'solid-js/web';
import 'solid-devtools';

import { RouterProvider } from '@tanstack/solid-router';

import { router } from './router';
import './globals.css';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => <RouterProvider router={router} />, root!);
