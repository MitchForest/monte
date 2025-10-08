import { curriculumLessons } from '../lessons';

interface SkillCoverage {
  lessonId: string;
  skillId: string;
  presented: boolean;
}

const results: SkillCoverage[] = [];

for (const lesson of curriculumLessons) {
  const focusSkills = lesson.focusSkills ?? [];
  for (const skillId of focusSkills) {
    const coverage: SkillCoverage = {
      lessonId: lesson.id,
      skillId,
      presented: false,
    };

    for (const segment of lesson.segments) {
      if ((segment.skills ?? []).includes(skillId)) {
        coverage.presented = true;
      }
    }

    results.push(coverage);
  }
}

const errors: string[] = [];
const warnings: string[] = [];

for (const coverage of results) {
  if (!coverage.presented) {
    errors.push(
      `Lesson ${coverage.lessonId} never references ${coverage.skillId} in a presentation/worked example segment.`,
    );
  }

}

if (errors.length === 0) {
  console.log('✔ Lesson skill coverage check passed.');
} else {
  console.error('✘ Lesson skill coverage check failed:');
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
}

if (warnings.length > 0) {
  console.warn('⚠ Warnings:');
  for (const warning of warnings) {
    console.warn(`  - ${warning}`);
  }
}

if (errors.length > 0) {
  process.exitCode = 1;
}
