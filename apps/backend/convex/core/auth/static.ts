import { getStaticAuth } from '@convex-dev/better-auth';

import { createAuth } from './client.js';

export const auth = getStaticAuth(createAuth);
