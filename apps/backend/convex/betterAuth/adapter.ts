import { createApi } from '@convex-dev/better-auth';

import schema from './schema.js';
import { createAuth } from '../auth.js';

export const {
  create,
  findOne,
  findMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
} = createApi(schema, createAuth);
