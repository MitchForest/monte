import type {
  GuidedEvaluatorId,
  GuidedStep,
  PracticePassCriteria,
  PracticeQuestion,
  PresentationAction,
  PresentationActionInput,
  PresentationScript,
} from '../types';

export interface GoldenBeadScenario {
  kind: 'golden-beads';
  seed: number;
  multiplicand: number;
  multiplier: number;
  digits: {
    thousands: number;
    hundreds: number;
    tens: number;
    units: number;
  };
  unitTotal: number;
  unitRemainder: number;
  unitCarry: number;
  tensTotal: number;
  tensRemainder: number;
  tensCarry: number;
  hundredsTotal: number;
  hundredsRemainder: number;
  hundredsCarry: number;
  thousandsTotal: number;
  product: number;
}

export interface StampGameScenario {
  kind: 'stamp-game';
  seed: number;
  multiplicand: number;
  multiplier: number;
  digits: {
    hundreds: number;
    tens: number;
    units: number;
  };
  unitsTotal: number;
  unitsRemainder: number;
  unitsCarry: number;
  tensTotal: number;
  tensRemainder: number;
  tensCarry: number;
  hundredsTotal: number;
  hundredsRemainder: number;
  hundredsCarry: number;
  thousandsTotal: number;
  product: number;
}

const createSeededRng = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

const randomInclusive = (rand: () => number, min: number, max: number) =>
  Math.floor(rand() * (max - min + 1)) + min;

const generateDigits = (rand: () => number) => {
  const thousands = randomInclusive(rand, 1, 2); // Keep products within 4 digits
  const hundreds = randomInclusive(rand, 1, 4);
  const tens = randomInclusive(rand, 2, 8);
  const units = randomInclusive(rand, 2, 9);
  return { thousands, hundreds, tens, units };
};

export const generateGoldenBeadScenario = (seed?: number): GoldenBeadScenario => {
  const baseSeed = seed ?? Math.floor(Math.random() * 1_000_000_000);
  const rand = createSeededRng(baseSeed);

  while (true) {
    const digits = generateDigits(rand);
    const multiplier = randomInclusive(rand, 2, 4);
    const multiplicand = digits.thousands * 1000 + digits.hundreds * 100 + digits.tens * 10 + digits.units;

    const unitTotal = digits.units * multiplier;
    const unitCarry = Math.floor(unitTotal / 10);
    const unitRemainder = unitTotal % 10;

    const tensTotal = digits.tens * multiplier + unitCarry;
    const tensCarry = Math.floor(tensTotal / 10);
    const tensRemainder = tensTotal % 10;

    const hundredsTotal = digits.hundreds * multiplier + tensCarry;
    const hundredsCarry = Math.floor(hundredsTotal / 10);
    const hundredsRemainder = hundredsTotal % 10;

    const thousandsTotal = digits.thousands * multiplier + hundredsCarry;
    if (thousandsTotal >= 10) {
      continue; // avoid five-digit products
    }

    const product = multiplicand * multiplier;
    const hasCarry = unitCarry > 0 || tensCarry > 0 || hundredsCarry > 0;
    if (!hasCarry) {
      continue; // ensure at least one exchange occurs
    }

    return {
      kind: 'golden-beads',
      seed: baseSeed,
      multiplicand,
      multiplier,
      digits,
      unitTotal,
      unitRemainder,
      unitCarry,
      tensTotal,
      tensRemainder,
      tensCarry,
      hundredsTotal,
      hundredsRemainder,
      hundredsCarry,
      thousandsTotal,
      product,
    } satisfies GoldenBeadScenario;
  }
};

export const generateStampGameScenario = (seed?: number): StampGameScenario => {
  const baseSeed = seed ?? Math.floor(Math.random() * 1_000_000_000);
  const rand = createSeededRng(baseSeed);

  while (true) {
    const hundreds = randomInclusive(rand, 2, 5);
    const tens = randomInclusive(rand, 2, 8);
    const units = randomInclusive(rand, 1, 9);
    const multiplier = randomInclusive(rand, 2, 5);
    const digits = { hundreds, tens, units };
    const multiplicand = hundreds * 100 + tens * 10 + units;

    const unitsTotal = units * multiplier;
    const unitsCarry = Math.floor(unitsTotal / 10);
    const unitsRemainder = unitsTotal % 10;

    const tensTotal = tens * multiplier + unitsCarry;
    const tensCarry = Math.floor(tensTotal / 10);
    const tensRemainder = tensTotal % 10;

    const hundredsTotal = hundreds * multiplier + tensCarry;
    const hundredsCarry = Math.floor(hundredsTotal / 10);
    const hundredsRemainder = hundredsTotal % 10;

    const thousandsTotal = hundredsCarry;
    if (thousandsTotal >= 10) {
      continue;
    }

    const product = multiplicand * multiplier;
    const hasCarry = unitsCarry > 0 || tensCarry > 0 || hundredsCarry > 0;
    if (!hasCarry) {
      continue;
    }

    return {
      kind: 'stamp-game',
      seed: baseSeed,
      multiplicand,
      multiplier,
      digits,
      unitsTotal,
      unitsRemainder,
      unitsCarry,
      tensTotal,
      tensRemainder,
      tensCarry,
      hundredsTotal,
      hundredsRemainder,
      hundredsCarry,
      thousandsTotal,
      product,
    } satisfies StampGameScenario;
  }
};

const formatNumber = (value: number) => value.toLocaleString();

const withActionIds = (
  actions: readonly PresentationActionInput[],
  prefix: string,
): PresentationAction[] =>
  actions.map((action, index) => ({
    id: `${prefix}-${index + 1}`,
    ...action,
  }));

export const buildGoldenBeadPresentationScript = (scenario: GoldenBeadScenario): PresentationScript => {
  const { digits, multiplier, unitTotal, unitRemainder, unitCarry, tensTotal, tensRemainder, tensCarry, hundredsTotal, hundredsRemainder, hundredsCarry, product } = scenario;
  const multiplicandStr = formatNumber(scenario.multiplicand);
  const multiplierStr = multiplier.toString();

  const actionInputs = [
    // Action 1: Write problem on paper (handwritten style font) to the side: 2344 x 3
    { type: 'showCard', card: `${multiplicandStr} × ${multiplierStr}`, position: 'paper' },
    { type: 'narrate', text: `We will multiply ${multiplicandStr} by ${multiplierStr} using golden beads.` },

    // Actions 2-5: Lay out 2000, then 300, then 40, then 4 stacked
    { type: 'showCard', card: `${digits.thousands * 1000}`, position: 'multiplicand-stack' },
    { type: 'showCard', card: `${digits.hundreds * 100}`, position: 'multiplicand-stack' },
    { type: 'showCard', card: `${digits.tens * 10}`, position: 'multiplicand-stack' },
    { type: 'showCard', card: `${digits.units}`, position: 'multiplicand-stack' },
    { type: 'narrate', text: `Stack the thousand, hundred, ten, and unit cards to show ${multiplicandStr}.` },

    // Actions 6-7: Put multiplier (3) below the 4, put x to left of 3
    { type: 'showCard', card: multiplierStr, position: 'multiplier' },
    { type: 'showCard', card: '×', position: 'paper' },

    // Actions 8-11: Place beads for each place value left to right
    { type: 'narrate', text: 'Lay out the golden beads to match each place value.' },
    { type: 'placeBeads', place: 'thousand', quantity: digits.thousands, tray: 1 },
    { type: 'placeBeads', place: 'hundred', quantity: digits.hundreds, tray: 1 },
    { type: 'placeBeads', place: 'ten', quantity: digits.tens, tray: 1 },
    { type: 'placeBeads', place: 'unit', quantity: digits.units, tray: 1 },

    // Actions 12-13: Repeat 2nd and 3rd time to match multiplier
    { type: 'narrate', text: `Repeat the layout a second time.` },
    { type: 'duplicateTray', count: 2 },
    { type: 'narrate', text: `Repeat the layout a third time.` },
    { type: 'duplicateTray', count: 3 },

    // Action 14: Put yellow multiplication ribbon down
    { type: 'narrate', text: 'Lay a yellow ribbon beneath to signal multiplication.' },
    { type: 'highlight', target: 'multiplication-ribbon', text: 'Place ribbon' },

    // UNIT EXCHANGE - Step by step
    { type: 'narrate', text: 'Move all unit beads below the yellow line.' },
    { type: 'moveBeadsBelowLine', place: 'unit', totalCount: unitTotal },
    
    { type: 'narrate', text: 'Group the units into sets of ten.' },
    { type: 'groupForExchange', place: 'unit', groupsOfTen: unitCarry, remainder: unitRemainder },
    
    { type: 'narrate', text: `Exchange ${unitCarry === 1 ? 'this group of 10 units' : `${unitCarry} groups of 10 units`} for ${unitCarry === 1 ? 'a ten bar' : `${unitCarry} ten bars`}.` },
    { type: 'exchangeBeads', from: 'unit', to: 'ten', groupsOfTen: unitCarry },
    
    { type: 'narrate', text: `${unitRemainder} units remain.` },
    { type: 'placeResultCard', place: 'unit', value: unitRemainder },
    { type: 'showCard', card: `${unitRemainder}`, position: 'paper' },

    // TEN EXCHANGE - Step by step
    { type: 'narrate', text: 'Move all ten bars below the yellow line.' },
    { type: 'moveBeadsBelowLine', place: 'ten', totalCount: tensTotal },
    
    { type: 'narrate', text: 'Group the tens into sets of ten.' },
    { type: 'groupForExchange', place: 'ten', groupsOfTen: tensCarry, remainder: tensRemainder },
    
    { type: 'narrate', text: `Exchange ${tensCarry === 1 ? 'this group of 10 tens' : `${tensCarry} groups of 10 tens`} for ${tensCarry === 1 ? 'a hundred square' : `${tensCarry} hundred squares`}.` },
    { type: 'exchangeBeads', from: 'ten', to: 'hundred', groupsOfTen: tensCarry },
    
    { type: 'narrate', text: `${tensRemainder} tens remain.` },
    { type: 'placeResultCard', place: 'ten', value: tensRemainder },

    // HUNDRED EXCHANGE - Step by step
    { type: 'narrate', text: 'Move all hundred squares below the yellow line.' },
    { type: 'moveBeadsBelowLine', place: 'hundred', totalCount: hundredsTotal },
    
    { type: 'narrate', text: 'Group the hundreds into sets of ten.' },
    { type: 'groupForExchange', place: 'hundred', groupsOfTen: hundredsCarry, remainder: hundredsRemainder },
    
    { type: 'narrate', text: `Exchange ${hundredsCarry === 1 ? 'this group of 10 hundreds' : `${hundredsCarry} groups of 10 hundreds`} for ${hundredsCarry === 1 ? 'a thousand cube' : `${hundredsCarry} thousand cubes`}.` },
    { type: 'exchangeBeads', from: 'hundred', to: 'thousand', groupsOfTen: hundredsCarry },
    
    { type: 'narrate', text: `${hundredsRemainder} hundreds remain.` },
    { type: 'placeResultCard', place: 'hundred', value: hundredsRemainder },

    // Final stacking and product
    { type: 'narrate', text: 'Stack each place value to read the product.' },
    { type: 'stackPlaceValues', order: ['thousand', 'hundred', 'ten', 'unit'] },
    { type: 'writeResult', value: formatNumber(product) },
    { type: 'narrate', text: `${multiplicandStr} multiplied by ${multiplierStr} equals ${formatNumber(product)}.` },
  ] satisfies PresentationActionInput[];

  const actions = withActionIds(actionInputs, 'presentation.multiplication.goldenBeads');

  return {
    id: 'presentation.multiplication.goldenBeads',
    title: 'Golden Bead Staircase Multiplication',
    summary: `Demonstrate ${multiplicandStr} × ${multiplierStr} using golden beads, exchanges, and final stacking.`,
    actions,
  } satisfies PresentationScript;
};

export const buildStampGamePresentationScript = (scenario: StampGameScenario): PresentationScript => {
  const { digits, multiplier, unitsRemainder, tensRemainder, product } = scenario;
  const multiplicandStr = formatNumber(scenario.multiplicand);
  const multiplierStr = multiplier.toString();

  const actionInputs = [
    { type: 'narrate', text: `Let us multiply ${multiplicandStr} by ${multiplierStr} using the stamp game.` },
    { type: 'showCard', card: multiplicandStr, position: 'paper' },
    { type: 'showCard', card: multiplierStr, position: 'multiplier' },
    { type: 'narrate', text: `Build one column with ${digits.hundreds} red hundreds, ${digits.tens} blue tens, and ${digits.units} green units.` },
    { type: 'showStamp', stamp: '100', columns: 1, rows: digits.hundreds },
    { type: 'showStamp', stamp: '10', columns: 1, rows: digits.tens },
    { type: 'showStamp', stamp: '1', columns: 1, rows: digits.units },
    { type: 'narrate', text: `Repeat this column ${multiplierStr} times for the multiplier.` },
    { type: 'duplicateTray', count: multiplier },
    { type: 'narrate', text: 'Gather the tiles and make exchanges: ten greens become a blue, ten blues become a red.' },
    { type: 'exchange', from: 'unit', to: 'ten', quantity: 10, remainder: unitsRemainder },
    { type: 'exchange', from: 'ten', to: 'hundred', quantity: 10, remainder: tensRemainder },
    { type: 'countTotal', value: formatNumber(product) },
    { type: 'narrate', text: `${multiplicandStr} times ${multiplierStr} equals ${formatNumber(product)}.` },
  ] satisfies PresentationActionInput[];

  const actions = withActionIds(actionInputs, 'presentation.multiplication.stampGame');

  return {
    id: 'presentation.multiplication.stampGame',
    title: 'Stamp Game Multiplication Stories',
    summary: `Show ${multiplicandStr} × ${multiplierStr} on the stamp game with exchanges.`,
    actions,
  } satisfies PresentationScript;
};

export const buildGoldenBeadGuidedSteps = (
  scenario: GoldenBeadScenario,
): (GuidedStep & { evaluatorId: GuidedEvaluatorId })[] => {
  const multiplicandStr = formatNumber(scenario.multiplicand);
  const productStr = formatNumber(scenario.product);
  return [
    {
      id: 'step-build-base',
      prompt: `Lay out ${multiplicandStr} with bead cards and matching quantities.`,
      expectation: `${scenario.digits.thousands} thousands, ${scenario.digits.hundreds} hundreds, ${scenario.digits.tens} tens, ${scenario.digits.units} units.`,
      successCheck: 'Cards and beads match the multiplicand.',
      nudge: 'Check each place value: thousands, hundreds, tens, ones. Add missing bead bars.',
      evaluatorId: 'golden-beads-build-base',
    },
    {
      id: 'step-duplicate',
      prompt: `Create the ${multiplicandStr} layout ${scenario.multiplier} times to match the multiplier.`,
      expectation: `${scenario.multiplier} full copies separated by the ribbon.`,
      successCheck: 'Correct number of full sets present.',
      nudge: 'Use the yellow ribbon to separate each copy and confirm counts.',
      evaluatorId: 'golden-beads-duplicate',
    },
    {
      id: 'step-exchange-units',
      prompt: 'Combine the units and exchange every 10 for a ten bar.',
      expectation: `${scenario.unitRemainder} units remain with ${scenario.unitCarry} ten carried.`,
      successCheck: 'Units reduced below ten with the carry recorded.',
      nudge: 'Group ten unit beads, trade them for a ten bar, and place the ten on the tens column.',
      evaluatorId: 'golden-beads-exchange-units',
    },
    {
      id: 'step-exchange-tens',
      prompt: 'Combine tens, exchanging groups of ten tens for a hundred.',
      expectation: `${scenario.tensRemainder} tens remain with ${scenario.tensCarry} hundred carried.`,
      successCheck: 'Tens consolidated with the carry noted.',
      nudge: 'Bundle ten tens, trade for a hundred square, and move it to hundreds.',
      evaluatorId: 'golden-beads-exchange-tens',
    },
    {
      id: 'step-exchange-hundreds',
      prompt: 'Combine hundreds, exchanging ten hundreds for a thousand.',
      expectation: `${scenario.hundredsRemainder} hundreds remain with ${scenario.hundredsCarry} thousand carried.`,
      successCheck: 'Hundreds consolidated with the carry noted.',
      nudge: 'Gather ten hundreds, swap for a thousand cube, and add it to thousands.',
      evaluatorId: 'golden-beads-exchange-hundreds',
    },
    {
      id: 'step-stack-result',
      prompt: 'Stack the final thousands, hundreds, tens, and units to read the product.',
      expectation: `Result cards show ${productStr}.`,
      successCheck: `Final stack equals ${productStr}.`,
      nudge: 'Slide each place value pile to form the final number and read it aloud.',
      evaluatorId: 'golden-beads-stack-result',
    },
  ];
};

export const buildStampGameGuidedSteps = (
  scenario: StampGameScenario,
): (GuidedStep & { evaluatorId: GuidedEvaluatorId })[] => {
  const multiplicandStr = formatNumber(scenario.multiplicand);
  const productStr = formatNumber(scenario.product);
  return [
    {
      id: 'step-build',
      prompt: `Lay out ${multiplicandStr} using stamp tiles in a single column.`,
      expectation: `${scenario.digits.hundreds} hundreds, ${scenario.digits.tens} tens, ${scenario.digits.units} units.`,
      successCheck: 'Tiles match the multiplicand layout.',
      nudge: 'Use red 100s on top, blue 10s beneath, green 1s at bottom.',
      evaluatorId: 'stamp-game-build',
    },
    {
      id: 'step-repeat-columns',
      prompt: `Repeat the column ${scenario.multiplier} times for the multiplier.`,
      expectation: `${scenario.multiplier} matching columns ready to combine.`,
      successCheck: 'The correct number of columns is present.',
      nudge: 'Count each column aloud as you copy to the right.',
      evaluatorId: 'stamp-game-repeat-columns',
    },
    {
      id: 'step-exchange',
      prompt: 'Gather all tiles and exchange groups of ten for the next place value.',
      expectation: `${scenario.unitsRemainder} units, ${scenario.tensRemainder} tens, ${scenario.hundredsRemainder} hundreds, plus ${scenario.thousandsTotal} thousands.`,
      successCheck: 'Remaining tiles per place value are fewer than ten with carries recorded.',
      nudge: 'Stack tiles by color, trade ten greens for a blue, ten blues for a red.',
      evaluatorId: 'stamp-game-exchange',
    },
    {
      id: 'step-read-result',
      prompt: 'Count the final tiles to read the product aloud.',
      expectation: `${productStr}.`,
      successCheck: `Learner states ${productStr}.`,
      nudge: 'Count hundreds first, then tens, then ones to gather the total.',
      evaluatorId: 'stamp-game-read-result',
    },
  ];
};

const uniqueProblems = (existing: PracticeQuestion[], candidate: PracticeQuestion) =>
  !existing.some((entry) => entry.multiplicand === candidate.multiplicand && entry.multiplier === candidate.multiplier);

const randomGoldenProblem = (rand: () => number): PracticeQuestion => {
  const digits = generateDigits(rand);
  const multiplier = randomInclusive(rand, 2, 4);
  const multiplicand = digits.thousands * 1000 + digits.hundreds * 100 + digits.tens * 10 + digits.units;
  return {
    id: `gb-${multiplicand}-${multiplier}`,
    multiplicand,
    multiplier,
    prompt: `Solve ${formatNumber(multiplicand)} × ${multiplier}.`,
    correctAnswer: multiplicand * multiplier,
    difficulty: multiplier <= 3 ? 'medium' : 'hard',
  } satisfies PracticeQuestion;
};

const randomStampProblem = (rand: () => number): PracticeQuestion => {
  const hundreds = randomInclusive(rand, 2, 5);
  const tens = randomInclusive(rand, 2, 8);
  const units = randomInclusive(rand, 1, 9);
  const multiplicand = hundreds * 100 + tens * 10 + units;
  const multiplier = randomInclusive(rand, 2, 5);
  return {
    id: `sg-${multiplicand}-${multiplier}`,
    multiplicand,
    multiplier,
    prompt: `Solve ${formatNumber(multiplicand)} × ${multiplier}.`,
    correctAnswer: multiplicand * multiplier,
    difficulty: multiplier <= 3 ? 'medium' : 'hard',
  } satisfies PracticeQuestion;
};

export const buildGoldenBeadPractice = (scenario: GoldenBeadScenario): PracticeQuestion[] => {
  const questions: PracticeQuestion[] = [
    {
      id: `gb-scenario-${scenario.seed}`,
      multiplicand: scenario.multiplicand,
      multiplier: scenario.multiplier,
      prompt: `Solve ${formatNumber(scenario.multiplicand)} × ${scenario.multiplier}.`,
      correctAnswer: scenario.product,
      difficulty: 'easy',
    },
  ];

  const rand = createSeededRng(scenario.seed + 101);
  while (questions.length < 5) {
    const candidate = randomGoldenProblem(rand);
    if (uniqueProblems(questions, candidate)) {
      questions.push({ ...candidate, id: `gb-${scenario.seed}-${questions.length}` });
    }
  }

  questions[1].difficulty = 'medium';
  questions[2].difficulty = 'medium';
  questions[3].difficulty = 'hard';
  questions[4].difficulty = 'hard';

  return questions;
};

export const buildStampGamePractice = (scenario: StampGameScenario): PracticeQuestion[] => {
  const questions: PracticeQuestion[] = [
    {
      id: `sg-scenario-${scenario.seed}`,
      multiplicand: scenario.multiplicand,
      multiplier: scenario.multiplier,
      prompt: `Solve ${formatNumber(scenario.multiplicand)} × ${scenario.multiplier}.`,
      correctAnswer: scenario.product,
      difficulty: 'easy',
    },
  ];

  const rand = createSeededRng(scenario.seed + 211);
  while (questions.length < 5) {
    const candidate = randomStampProblem(rand);
    if (uniqueProblems(questions, candidate)) {
      questions.push({ ...candidate, id: `sg-${scenario.seed}-${questions.length}` });
    }
  }

  questions[1].difficulty = 'medium';
  questions[2].difficulty = 'medium';
  questions[3].difficulty = 'hard';
  questions[4].difficulty = 'hard';

  return questions;
};

export const goldenBeadPassCriteria: PracticePassCriteria = {
  type: 'threshold',
  firstCorrect: 2,
  totalCorrect: 3,
  maxMisses: 3,
};

export const stampGamePassCriteria: PracticePassCriteria = {
  type: 'threshold',
  firstCorrect: 2,
  totalCorrect: 3,
  maxMisses: 3,
};
