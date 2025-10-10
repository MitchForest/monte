import { execSync } from 'node:child_process';

const run = (command) => {
  execSync(command, { stdio: 'inherit', shell: true });
};

try {
  run('pnpm sync:codegen');
} catch (error) {
  console.error('pnpm sync:codegen failed');
  process.exit(typeof error.status === 'number' ? error.status : 1);
}

try {
  const status = execSync('git status --porcelain apps/backend/convex/_generated packages/api/convex/_generated', {
    encoding: 'utf8',
  });
  if (status.trim().length > 0) {
    console.error('\nGenerated Convex files are out of sync. Run "pnpm sync:codegen" and commit the changes.');
    process.exit(1);
  }
} catch (error) {
  if (error.stdout) {
    console.error(error.stdout.toString());
  }
  if (error.stderr) {
    console.error(error.stderr.toString());
  }
  process.exit(typeof error.status === 'number' ? error.status : 1);
}

