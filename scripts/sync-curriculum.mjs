#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTHORING_STATUS_VALUES = new Set([
  'not_started',
  'outline',
  'presentation',
  'guided',
  'practice',
  'qa',
  'published',
]);

let cachedCurriculumFactories = null;
const loadCurriculumClientFactories = async () => {
  if (cachedCurriculumFactories) return cachedCurriculumFactories;
  try {
    const module = await import('../packages/api/dist/index.js');
    const httpFactory = module.createCurriculumHttpClient;
    const managerFactory = module.createCurriculumClientManager;
    if (typeof httpFactory !== 'function' || typeof managerFactory !== 'function') {
      throw new Error('Unable to load curriculum client factories from @monte/api.');
    }
    cachedCurriculumFactories = {
      createCurriculumHttpClient: httpFactory,
      createCurriculumClientManager: managerFactory,
    };
    return cachedCurriculumFactories;
  } catch (error) {
    throw new Error(
      'Unable to load curriculum API helpers. Run `pnpm --filter @monte/api build` and try again.',
    );
  }
};

const readJson = async (relativePath) => {
  const absolute = path.resolve(__dirname, relativePath);
  const data = await fs.readFile(absolute, 'utf8');
  return JSON.parse(data);
};

const unique = (values) => Array.from(new Set(values));

const normalizeUnits = (units) =>
  units
    .map((unit) => ({
      id: unit.id,
      slug: unit.id,
      title: unit.name,
      summary: unit.summary,
      domainId: unit.domainId,
      ritRange: unit.ritRange,
      primaryCcss: unit.primaryCcss,
      topicOrder: unit.topicOrder ?? [],
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

const normalizeTopics = (topics) =>
  topics
    .map((topic) => ({
      id: topic.id,
      slug: topic.id,
      unitId: topic.unitId,
      title: topic.name,
      overview: topic.description,
      focusSkills: topic.ccssFocus ?? [],
      ritRange: topic.ritRange,
      ccssFocus: topic.ccssFocus,
      priority: topic.priority,
      prerequisiteTopicIds: topic.prerequisiteTopicIds ?? [],
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));

const normalizeLessons = (lessonPlanSources) => {
  const byLessonId = new Map();

  for (const [gradeLevel, plans] of Object.entries(lessonPlanSources)) {
    for (const plan of plans) {
      const slug = plan.id;
      const existing = byLessonId.get(slug);

      if (existing) {
        existing.gradeLevels = unique([...existing.gradeLevels, gradeLevel]);
        existing.skills = unique([...(existing.skills ?? []), ...(plan.skills ?? [])]);
        existing.prerequisiteLessonIds = unique([
          ...(existing.prerequisiteLessonIds ?? []),
          ...(plan.prerequisiteLessonIds ?? []),
        ]);
        if (plan.segments?.length) {
          existing.segments = plan.segments.map((segment) => ({
            type: segment.type,
            representation: segment.representation,
          }));
        }
        if (!existing.notes && plan.notes) {
          existing.notes = plan.notes;
        }
        continue;
      }

      byLessonId.set(slug, {
        id: plan.id,
        slug,
        topicId: plan.topicId,
        title: plan.name,
        materialId: plan.materialId,
        gradeLevels: [gradeLevel],
        segments: (plan.segments ?? []).map((segment) => ({
          type: segment.type,
          representation: segment.representation,
        })),
        prerequisiteLessonIds: plan.prerequisiteLessonIds ?? [],
        skills: plan.skills ?? [],
        notes: plan.notes,
      });
    }
  }

  return Array.from(byLessonId.values()).sort((a, b) => a.slug.localeCompare(b.slug));
};

const buildManifest = async () => {
  const domains = await readJson('../packages/curriculum-service/content/domains.json');
  const topics = await readJson('../packages/curriculum-service/content/topics.json');
  const units = await readJson('../packages/curriculum-service/content/units.json');
  const lessonPlansKindergarten = await readJson(
    '../packages/curriculum-service/content/lesson-plans/kindergarten.json',
  );
  const lessonPlansGrade1 = await readJson('../packages/curriculum-service/content/lesson-plans/grade1.json');
  const lessonPlansGrade2 = await readJson('../packages/curriculum-service/content/lesson-plans/grade2.json');
  const lessonPlansGrade3 = await readJson('../packages/curriculum-service/content/lesson-plans/grade3.json');

  const lessonPlanSources = {
    kindergarten: lessonPlansKindergarten,
    grade1: lessonPlansGrade1,
    grade2: lessonPlansGrade2,
    grade3: lessonPlansGrade3,
  };

  return {
    generatedAt: new Date().toISOString(),
    domains,
    units: normalizeUnits(units),
    topics: normalizeTopics(topics),
    lessons: normalizeLessons(lessonPlanSources),
  };
};

const formatCount = (label, count) => `${label}: ${count.toLocaleString()}`;

const logManifestSummary = (manifest, title = 'Curriculum manifest summary') => {
  const gradeLevels = new Map();
  for (const lesson of manifest.lessons ?? []) {
    for (const gradeLevel of lesson.gradeLevels ?? []) {
      gradeLevels.set(gradeLevel, (gradeLevels.get(gradeLevel) ?? 0) + 1);
    }
  }

  const summaryLines = [
    formatCount('Units', manifest.units?.length ?? 0),
    formatCount('Topics', manifest.topics?.length ?? 0),
    formatCount('Lessons', manifest.lessons?.length ?? 0),
    ...Array.from(gradeLevels.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([gradeLevel, count]) => `  • ${gradeLevel}: ${count}`),
  ];

  console.log(`${title}:`);
  for (const line of summaryLines) {
    console.log(`  ${line}`);
  }
};

const logSyncSummary = (summary) => {
  const formatSection = (name, stats) =>
    `${name}: +${stats.created} / ~${stats.updated} / -${stats.deleted}`;

  console.log('\nConvex sync summary:');
  console.log(`  Manifest hash: ${summary.manifestHash}`);
  if (summary.manifestCommit) {
    console.log(`  Manifest commit: ${summary.manifestCommit}`);
  }
  console.log(`  Generated at: ${summary.manifestGeneratedAt}`);
  console.log(`  ${formatSection('Units', summary.units)}`);
  console.log(`  ${formatSection('Topics', summary.topics)}`);
  console.log(`  ${formatSection('Lessons', summary.lessons)}`);
};

const main = async () => {
  const argv = process.argv.slice(2);
  const hasFlag = (flag) => argv.includes(flag);
  const getFlagValue = (flag) => {
    const index = argv.indexOf(flag);
    if (index === -1 || index + 1 >= argv.length) return undefined;
    return argv[index + 1];
  };

  const dryRun = hasFlag('--dry-run');
  const check = hasFlag('--check');
  const push = hasFlag('--push');
  const prune = hasFlag('--prune');
  const exportRemote = hasFlag('--export');
  const commitRef = getFlagValue('--commit');
  const defaultStatusValue = getFlagValue('--default-status');
  let defaultStatus;
  if (defaultStatusValue) {
    if (!AUTHORING_STATUS_VALUES.has(defaultStatusValue)) {
      console.error(
        `✖ Invalid default status "${defaultStatusValue}". Expected one of: ${Array.from(
          AUTHORING_STATUS_VALUES,
        ).join(', ')}`,
      );
      process.exit(1);
    }
    defaultStatus = defaultStatusValue;
  }

  let manifest = await buildManifest();
  const outPath = path.resolve(process.cwd(), 'packages/curriculum-service/content/manifest.json');

  let previousContent;
  let previousManifest;
  try {
    previousContent = await fs.readFile(outPath, 'utf8');
    previousManifest = JSON.parse(previousContent);
  } catch (error) {
    previousContent = undefined;
    previousManifest = undefined;
  }

  if (previousManifest?.generatedAt) {
    manifest.generatedAt = previousManifest.generatedAt;
  }

  const normalizedContent = `${JSON.stringify(manifest, null, 2)}\n`;
  const hasChanges = previousContent ? previousContent !== normalizedContent : true;

  const manifestWithTimestamp = hasChanges
    ? { ...manifest, generatedAt: new Date().toISOString() }
    : manifest;
  const finalContent = `${JSON.stringify(manifestWithTimestamp, null, 2)}\n`;

  if (dryRun || check) {
    console.log(`ℹ️  Would write curriculum manifest to ${outPath}`);
  } else {
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, finalContent, 'utf8');
    console.log(`✔︎ Wrote curriculum manifest to ${outPath}`);
  }

  if (check) {
    if (!previousContent) {
      console.error(
        '✖ Manifest missing. Run `pnpm sync:curriculum` locally and commit the generated manifest.',
      );
      process.exitCode = 1;
    } else if (hasChanges) {
      console.error(
        '✖ Manifest out of date. Run `pnpm sync:curriculum` locally and commit the updated manifest.',
      );
      process.exitCode = 1;
    } else {
      console.log('✔︎ Manifest is up to date.');
    }
  }

  manifest = manifestWithTimestamp;

  logManifestSummary(manifest);

  let clientManager;
  if (push || exportRemote) {
    const {
      createCurriculumHttpClient,
      createCurriculumClientManager,
    } = await loadCurriculumClientFactories();
    const convexUrl =
      process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL ?? '';
    if (!convexUrl) {
      throw new Error(
        'Missing Convex URL. Set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL when using --push or --export.',
      );
    }
    clientManager = createCurriculumClientManager(createCurriculumHttpClient(convexUrl));
    const authToken =
      process.env.CONVEX_AUTH_TOKEN ??
      process.env.MONTE_CONVEX_TOKEN ??
      process.env.CONVEX_DEPLOYMENT_TOKEN ??
      null;
    if (authToken) {
      clientManager.setAuthToken(authToken);
    } else if (!dryRun) {
      console.warn('⚠️  No Convex auth token provided; requests may fail. Set CONVEX_AUTH_TOKEN.');
    }
  }

  if (push) {
    if (dryRun) {
      console.log('ℹ️  Would push manifest to Convex (omit --dry-run to execute).');
    } else if (clientManager) {
      const summary = await clientManager.syncManifest({
        manifest,
        prune,
        manifestCommit: commitRef,
        defaultStatus,
      });
      logSyncSummary(summary);
    }
  }

  if (exportRemote) {
    if (dryRun) {
      const remotePath = path.resolve(
        process.cwd(),
        'packages/curriculum-service/content/manifest.convex.json',
      );
      console.log(`ℹ️  Would export Convex manifest to ${remotePath}`);
    } else if (clientManager) {
      const remoteManifest = await clientManager.exportManifest();
      const remotePath = path.resolve(
        process.cwd(),
        'packages/curriculum-service/content/manifest.convex.json',
      );
      await fs.mkdir(path.dirname(remotePath), { recursive: true });
      await fs.writeFile(remotePath, `${JSON.stringify(remoteManifest, null, 2)}\n`, 'utf8');
      console.log(`✔︎ Exported Convex manifest to ${remotePath}`);
      logManifestSummary(remoteManifest, 'Convex manifest summary');
    }
  }

  if (!push && !exportRemote) {
    console.log('\nNext actions:');
    console.log(
      '  • Feed packages/curriculum-service/content/manifest.json into Convex admin mutations to seed units/topics/lessons.',
    );
    console.log(
      '  • Snapshot the manifest hash alongside Convex records for round-trip synchronization.',
    );
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
