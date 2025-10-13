import { createApi } from '@convex-dev/better-auth';

import schema from '../generated/betterAuth/schema.js';
import { createAuth } from './client.js';

export const {
  create,
  findOne,
  findMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
} = createApi(schema, createAuth);
