import { getStaticAuth } from '@convex-dev/better-auth';

import { createAuth } from '../auth.js';

export const auth = getStaticAuth(createAuth);
