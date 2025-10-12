/* @refresh reload */
import { render } from 'solid-js/web';
import { RouterProvider } from '@tanstack/solid-router';

import { router } from './router';
import './globals.css';
import { CurriculumProvider } from './providers/CurriculumProvider';
import { AuthProvider } from './providers/AuthProvider';
import { Toaster } from 'solid-sonner';

if (import.meta.env.DEV) {
  await import('solid-devtools');
}

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(
  () => (
    <CurriculumProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" closeButton richColors />
      </AuthProvider>
    </CurriculumProvider>
  ),
  root!,
);
