import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import mp3Duration from 'mp3-duration';
import OpenAI from 'openai';
import { config as loadEnv } from 'dotenv';

import { loadLessonDocuments } from './utils/loadLessons';
import type { LessonDocument, LessonSegment, PresentationScript, PresentationAction } from '@monte/types';
import {
  generateGoldenBeadScenario,
  generateStampGameScenario,
  buildGoldenBeadPresentationScript,
  buildStampGamePresentationScript,
} from '../scenarios/multiplication';

type PresentationSegmentInfo = {
  lessonId: string;
  segment: LessonSegment;
  steps: string[];
};

const projectRoot = path.resolve(process.cwd(), '../../');
const envPath = path.resolve(projectRoot, '.env');

loadEnv({ path: envPath });

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('Missing OPENAI_API_KEY in environment or .env file.');
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

const voiceModel = process.env.CURRICULUM_TTS_MODEL ?? 'gpt-4o-mini-tts';
const voicePreset = process.env.CURRICULUM_TTS_VOICE ?? 'alloy';

const force = process.argv.includes('--force');
const dryRun = process.argv.includes('--dry-run');

const defaultScenarioSeeds: Record<string, number> = {
  'presentation-golden-beads': 202501,
  'presentation-stamp-game': 202502,
};

const collectPresentationSegments = (documents: LessonDocument[]): PresentationSegmentInfo[] => {
  const unique = new Map<string, PresentationSegmentInfo>();

  for (const document of documents) {
    const lesson = document.lesson;

    for (const segment of lesson.segments) {
      if (segment.type !== 'presentation') continue;
      if (unique.has(segment.id)) continue;

      let script: PresentationScript | undefined;

      if (lesson.id === 'lesson-multiplication-golden-beads' && segment.id === 'presentation-golden-beads') {
        const seed = defaultScenarioSeeds[segment.id] ?? undefined;
        script = buildGoldenBeadPresentationScript(generateGoldenBeadScenario(seed));
      }

      if (lesson.id === 'lesson-multiplication-stamp-game' && segment.id === 'presentation-stamp-game') {
        const seed = defaultScenarioSeeds[segment.id] ?? undefined;
        script = buildStampGamePresentationScript(generateStampGameScenario(seed));
      }

      if (!script) {
        console.warn(`No narration script builder configured for ${segment.id}.`);
        continue;
      }

      const narrationSteps = script.actions
        .filter((action): action is PresentationAction & { type: 'narrate' } => action.type === 'narrate')
        .map((action) => action.text)
        .filter((text) => text.trim().length > 0);

      unique.set(segment.id, {
        lessonId: lesson.id,
        segment,
        steps: narrationSteps,
      });
    }
  }

  return Array.from(unique.values());
};

const formatTimestamp = (value: number) => {
  const clamped = Math.max(0, value);
  const hours = Math.floor(clamped / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((clamped % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (clamped % 60).toFixed(3).padStart(6, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const buildVtt = (steps: string[], durationSeconds: number) => {
  if (steps.length === 0 || durationSeconds <= 0) {
    return 'WEBVTT\n\n';
  }

  const wordCounts = steps.map((step) => step.split(/\s+/).filter(Boolean).length || 1);
  const totalWords = wordCounts.reduce((total, count) => total + count, 0);

  let currentTime = 0;
  const cues: Array<{ index: number; start: number; end: number; text: string }> = [];

  for (let index = 0; index < steps.length; index += 1) {
    const weight = Math.max(wordCounts[index], 1) / totalWords;
    const span = Math.max(durationSeconds * weight, 1.75);
    const start = currentTime;
    const end = Math.min(durationSeconds, start + span);
    cues.push({ index: index + 1, start, end, text: steps[index] });
    currentTime = end;
  }

  if (cues.length) {
    cues[cues.length - 1].end = durationSeconds;
  }

  const cueText = cues
    .map((cue) => `${cue.index}\n${formatTimestamp(cue.start)} --> ${formatTimestamp(cue.end)}\n${cue.text}\n`)
    .join('\n');

  return `WEBVTT\n\n${cueText}`;
};

const ensureDirectory = async (targetPath: string) => fs.mkdir(targetPath, { recursive: true });

const getOutputTargets = (lessonId: string, segmentId: string) => {
  const primaryDir = path.resolve(projectRoot, 'packages/curriculum-service/assets/audio', lessonId);
  const publicDir = path.resolve(projectRoot, 'apps/frontend/public/curriculum/assets/audio', lessonId);

  return [
    {
      baseDir: primaryDir,
      audioPath: path.resolve(primaryDir, `${segmentId}.mp3`),
      captionPath: path.resolve(primaryDir, `${segmentId}.vtt`),
    },
    {
      baseDir: publicDir,
      audioPath: path.resolve(publicDir, `${segmentId}.mp3`),
      captionPath: path.resolve(publicDir, `${segmentId}.vtt`),
    },
  ];
};

const writeNarrationAssets = async (info: PresentationSegmentInfo) => {
  const targets = getOutputTargets(info.lessonId, info.segment.id);
  for (const target of targets) {
    await ensureDirectory(target.baseDir);
  }

  const [primary] = targets;
  const audioPath = primary.audioPath;
  const captionPath = primary.captionPath;

  if (!force) {
    try {
      await fs.access(audioPath);
      await fs.access(captionPath);
      console.log(`✔︎ Skipping ${info.segment.id} (assets already exist)`);
      return;
    } catch {
      // fall through and regenerate
    }
  }

  if (dryRun) {
    console.log(`ℹ️  Would generate narration for ${info.segment.id}`);
    return;
  }

  console.log(`🎙️  Generating narration for ${info.segment.id} → ${audioPath}`);

  const prompt = info.steps.join('\n\n');

  const response = await openai.audio.speech.create({
    model: voiceModel,
    voice: voicePreset,
    input: prompt,
    response_format: 'mp3',
  });

  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = Buffer.from(arrayBuffer);
  await fs.writeFile(audioPath, audioBuffer);
  for (const target of targets.slice(1)) {
    await fs.writeFile(target.audioPath, audioBuffer);
  }

  let duration = 0;
  if (!duration) {
    try {
      duration = await mp3Duration(audioBuffer);
    } catch (error) {
      console.warn(`⚠️  Unable to measure duration for ${info.segment.id}. Using fallback.`);
      console.warn(error);
      const estimatedWordsPerSecond = 2.5;
      const totalWords = info.steps.reduce((sum, step) => sum + step.split(/\s+/).filter(Boolean).length, 0);
      duration = Math.max(totalWords / estimatedWordsPerSecond, 8);
    }
  }

  const vtt = buildVtt(info.steps, duration);
  await fs.writeFile(captionPath, vtt, 'utf8');
  for (const target of targets.slice(1)) {
    await fs.writeFile(target.captionPath, vtt, 'utf8');
  }

  console.log(`✅ Saved ${path.relative(projectRoot, audioPath)} and captions.`);
};

const run = async () => {
  const documents = await loadLessonDocuments();
  const segments = collectPresentationSegments(documents);
  if (segments.length === 0) {
    console.log('No presentation segments discovered. Nothing to do.');
    return;
  }

  for (const segment of segments) {
    try {
      await writeNarrationAssets(segment);
    } catch (error) {
      console.error(`❌ Failed to generate narration for ${segment.segment.id}`);
      console.error(error);
    }
  }
};

void run();
