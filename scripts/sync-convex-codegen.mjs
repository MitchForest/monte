#!/usr/bin/env node
import { cpSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const backendGenerated = join(ROOT, '../apps/backend/convex/_generated');
const sharedGenerated = join(ROOT, '../packages/api/convex/_generated');

const files = [
  'api.js',
  'api.d.ts',
  'dataModel.d.ts',
  'server.js',
  'server.d.ts',
];

mkdirSync(sharedGenerated, { recursive: true });

for (const file of files) {
  cpSync(join(backendGenerated, file), join(sharedGenerated, file));
}

writeFileSync(
  join(backendGenerated, 'api.js'),
  "export { api, components, internal } from '@monte/api/convex/_generated/api.js';\n",
);
writeFileSync(
  join(backendGenerated, 'api.d.ts'),
  "export type * from '@monte/api/convex/_generated/api.d.ts';\n",
);
writeFileSync(
  join(backendGenerated, 'dataModel.d.ts'),
  "export type * from '@monte/api/convex/_generated/dataModel.d.ts';\n",
);
writeFileSync(
  join(backendGenerated, 'server.js'),
  "export {\n  action,\n  httpAction,\n  internalAction,\n  internalMutation,\n  internalQuery,\n  mutation,\n  query,\n} from '@monte/api/convex/_generated/server.js';\n",
);
writeFileSync(
  join(backendGenerated, 'server.d.ts'),
  "export type * from '@monte/api/convex/_generated/server.d.ts';\n",
);
writeFileSync(join(sharedGenerated, 'dataModel.js'), 'export {};\n');
writeFileSync(
  join(backendGenerated, 'dataModel.js'),
  "export * from '@monte/api/convex/_generated/dataModel.js';\n",
);
const apiDtsPath = join(sharedGenerated, 'api.d.ts');
let apiDts = readFileSync(apiDtsPath, 'utf8');
apiDts = apiDts
  .replaceAll('../../../../apps/backend/convex/auth.js', '@monte/backend/convex/auth')
  .replaceAll('../../../../apps/backend/convex/curriculum.js', '@monte/backend/convex/curriculum')
  .replaceAll('../../../../apps/backend/convex/http.js', '@monte/backend/convex/http');
writeFileSync(apiDtsPath, apiDts);
