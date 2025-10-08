import { For, Show, createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
import { createStore, produce } from 'solid-js/store';

import type { PlayerStatus } from '../../machines/lessonPlayer';
import type { LessonSegment, PresentationAction, PresentationScript } from '../../types';
import { Button, Card, Chip } from '../../../design-system';
import {
  NumberCard,
  GoldenBeadUnit,
  GoldenBeadTen,
  GoldenBeadHundred,
  GoldenBeadThousand,
  StampTile,
  YellowRibbon,
  PaperNote,
} from '../materials';

interface PresentationSegmentProps {
  lessonId: string;
  segment: LessonSegment & { type: 'presentation' };
  playerStatus: PlayerStatus;
  onAutoAdvance: () => void;
  script: PresentationScript;
}

interface BeadCounts {
  thousand: number;
  hundred: number;
  ten: number;
  unit: number;
}

interface StampColumn {
  hundreds: number;
  tens: number;
  units: number;
}

interface PresentationStageState {
  narration: string;
  multiplicandStack: number[];
  multiplierCard?: number;
  paperNotes: string[];
  beadTrays: BeadCounts[];
  stampColumns: StampColumn[];
  highlight?: string;
  lastAction?: PresentationAction;
  ribbonVisible: boolean;
  activeMaterial?: 'golden-beads' | 'stamp-game';
  exchangeBoards: {
    unit?: { remainder: number; carried: number; to: 'ten' };
    ten?: { remainder: number; carried: number; to: 'hundred' };
    hundred?: { remainder: number; carried: number; to: 'thousand' };
  };
  finalStackOrder: ('thousand' | 'hundred' | 'ten' | 'unit')[];
  finalProduct?: string;
}

const initialBeadCounts = (): BeadCounts => ({ thousand: 0, hundred: 0, ten: 0, unit: 0 });

const createInitialState = (): PresentationStageState => ({
  narration: '',
  multiplicandStack: [],
  multiplierCard: undefined,
  paperNotes: [],
  beadTrays: [],
  stampColumns: [],
  highlight: undefined,
  lastAction: undefined,
  ribbonVisible: false,
  activeMaterial: undefined,
  exchangeBoards: {},
  finalStackOrder: [],
  finalProduct: undefined,
});

const normalizeCardValue = (value: string) => {
  const numeric = Number(value.replace(/[^0-9-]/g, ''));
  return Number.isNaN(numeric) ? 0 : numeric;
};

const sumBeadTrays = (trays: BeadCounts[]): BeadCounts =>
  trays.reduce<BeadCounts>(
    (totals, tray) => ({
      thousand: totals.thousand + tray.thousand,
      hundred: totals.hundred + tray.hundred,
      ten: totals.ten + tray.ten,
      unit: totals.unit + tray.unit,
    }),
    initialBeadCounts(),
  );

const cloneBeadCounts = (counts: BeadCounts): BeadCounts => ({
  thousand: counts.thousand,
  hundred: counts.hundred,
  ten: counts.ten,
  unit: counts.unit,
});

const sumStampColumns = (columns: StampColumn[]) =>
  columns.reduce(
    (totals, column) => ({
      hundreds: totals.hundreds + column.hundreds,
      tens: totals.tens + column.tens,
      units: totals.units + column.units,
    }),
    { hundreds: 0, tens: 0, units: 0 },
  );

const ACTION_INTERVAL_MS = 4200;

export const PresentationSegment = (props: PresentationSegmentProps) => {
  const script = createMemo(() => props.script);

  const [stage, setStage] = createStore(createInitialState());
  const [activeIndex, setActiveIndex] = createSignal(0);
  const [appliedCount, setAppliedCount] = createSignal(0);
  const [autoPlaying, setAutoPlaying] = createSignal(false);

  let timer: number | undefined;
  let completionSignalled = false;

  const resetStage = () => {
    setStage(createInitialState());
    setActiveIndex(0);
    setAppliedCount(0);
    completionSignalled = false;
  };

  const ensureBeadTray = (index: number) => {
    setStage(
      'beadTrays',
      produce((trays) => {
        while (trays.length < index) {
          trays.push(initialBeadCounts());
        }
      }),
    );
  };

  const ensureStampColumn = (index: number) => {
    setStage(
      'stampColumns',
      produce((columns) => {
        while (columns.length < index) {
          columns.push({ hundreds: 0, tens: 0, units: 0 });
        }
      }),
    );
  };

  const updateStampColumn = (index: number, partial: Partial<StampColumn>) => {
    setStage('stampColumns', (columns) => {
      const next = [...columns];
      const current = next[index] ?? { hundreds: 0, tens: 0, units: 0 };
      next[index] = { ...current, ...partial };
      return next;
    });
  };

  const logPaperNote = (text: string) => {
    setStage('paperNotes', (notes) => [...notes, text]);
  };

  const applyAction = (action: PresentationAction) => {
    setStage('lastAction', action);

    switch (action.type) {
      case 'narrate':
        setStage('narration', action.text);
        break;
      case 'showCard': {
        const cardValue = normalizeCardValue(action.card);
        if (action.position === 'multiplicand-stack') {
          setStage('multiplicandStack', (cards) => [...cards, cardValue]);
        } else if (action.position === 'multiplier') {
          setStage('multiplierCard', cardValue);
        } else if (action.position === 'paper') {
          setStage('paperNotes', (notes) => [...notes, action.card]);
        }
        break;
      }
      case 'placeBeads': {
        setStage('activeMaterial', 'golden-beads');
        ensureBeadTray(action.tray);
        setStage('beadTrays', action.tray - 1, action.place, action.quantity);
        break;
      }
      case 'duplicateTray': {
        if (stage.beadTrays.length > 0) {
          const source = stage.beadTrays[0];
          setStage('beadTrays', () => Array.from({ length: action.count }, () => ({ ...source })));
        } else if (stage.stampColumns.length > 0) {
          const source = stage.stampColumns[0];
          setStage('stampColumns', () => Array.from({ length: action.count }, () => ({ ...source })));
        } else {
          // create empty trays to reflect count even if no data yet
          setStage('beadTrays', () => Array.from({ length: action.count }, () => initialBeadCounts()));
        }
        break;
      }
      case 'highlight':
        setStage('highlight', action.target);
        if (action.target === 'multiplication-ribbon') {
          setStage('ribbonVisible', true);
        }
        if (action.text) {
          logPaperNote(action.text);
        }
        break;
      case 'exchange': {
        if (stage.activeMaterial === 'stamp-game') {
          const totals = sumStampColumns(stage.stampColumns);
          const fromKey = action.from === 'unit' ? 'units' : action.from === 'ten' ? 'tens' : 'hundreds';
          const toKey = action.to === 'ten' ? 'tens' : action.to === 'hundred' ? 'hundreds' : 'thousand';
          const sourceTotal = totals[fromKey as 'units' | 'tens' | 'hundreds'];
          const traded = sourceTotal - action.remainder;
          const carriedGroups = action.quantity > 0 ? Math.max(0, Math.floor(traded / action.quantity)) : 0;
          const nextTotals = { ...totals, [fromKey]: action.remainder };

          if (carriedGroups > 0) {
            if (action.to === 'ten') nextTotals.tens += carriedGroups;
            if (action.to === 'hundred') nextTotals.hundreds += carriedGroups;
            if (action.to === 'thousand') {
              // thousands show as bead tray for final product; keep as note on paper
              setStage('paperNotes', (notes) => [...notes, `${carriedGroups} thousand carried forward.`]);
            }
          }

          setStage('stampColumns', () => [nextTotals]);
          setStage('highlight', action.from);
          setStage('exchangeBoards', action.from, { remainder: action.remainder, carried: carriedGroups, to: action.to });
        } else {
          const totals = sumBeadTrays(stage.beadTrays);
          const sourceTotal = totals[action.from];
          const traded = sourceTotal - action.remainder;
          const carriedGroups = action.quantity > 0 ? Math.max(0, Math.floor(traded / action.quantity)) : 0;
          const nextTotals = cloneBeadCounts(totals);
          nextTotals[action.from] = action.remainder;

          if (carriedGroups > 0) {
            if (action.to === 'ten') {
              nextTotals.ten += carriedGroups;
            }
            if (action.to === 'hundred') {
              nextTotals.hundred += carriedGroups;
            }
            if (action.to === 'thousand') {
              nextTotals.thousand += carriedGroups;
            }
          }

          setStage('beadTrays', () => [nextTotals]);
          setStage('highlight', action.from);
          setStage('exchangeBoards', action.from, { remainder: action.remainder, carried: carriedGroups, to: action.to });
        }

        const summary = `Exchange: ${action.quantity} ${action.from}s → ${action.to}s, remainder ${action.remainder}`;
        logPaperNote(summary);
        break;
      }
      case 'stackPlaceValues': {
        const summary = `Stack order: ${action.order.join(' → ')}`;
        logPaperNote(summary);
        setStage('finalStackOrder', action.order);
        break;
      }
      case 'writeResult':
        logPaperNote(action.value);
        if (!/[A-Za-z]/.test(action.value)) {
          setStage('finalProduct', action.value);
        }
        break;
      case 'showStamp': {
        setStage('activeMaterial', 'stamp-game');
        ensureStampColumn(action.columns);
        for (let index = 0; index < action.columns; index += 1) {
          if (action.stamp === '100') {
            updateStampColumn(index, { hundreds: action.rows });
          }
          if (action.stamp === '10') {
            updateStampColumn(index, { tens: action.rows });
          }
          if (action.stamp === '1') {
            updateStampColumn(index, { units: action.rows });
          }
        }
        break;
      }
      case 'countTotal':
        logPaperNote(`Total: ${action.value}`);
        break;
    }
  };

  const advanceTo = (index: number) => {
    const scriptValue = script();
    if (!scriptValue) return;
    const safeIndex = Math.max(0, Math.min(index, scriptValue.actions.length - 1));
    setActiveIndex(safeIndex);
  };

  createEffect(() => {
    const scriptValue = script();
    if (!scriptValue) {
      resetStage();
      return;
    }

    if (appliedCount() > activeIndex()) {
      // Rewind requested; rebuild state from scratch
      resetStage();
    }

    const target = activeIndex();
    const actions = scriptValue.actions;
    let applied = appliedCount();
    while (applied <= target && applied < actions.length) {
      applyAction(actions[applied]);
      applied += 1;
    }
    setAppliedCount(applied);

    if (target >= actions.length - 1 && !completionSignalled) {
      completionSignalled = true;
      props.onAutoAdvance();
    }
  });

  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  createEffect(() => {
    clearTimer();
    const status = props.playerStatus;
    const scriptValue = script();
    if (!scriptValue) return;
    if (status !== 'playing') {
      setAutoPlaying(false);
      return;
    }

    setAutoPlaying(true);
    if (activeIndex() >= scriptValue.actions.length - 1) {
      return;
    }

    timer = window.setTimeout(() => {
      advanceTo(activeIndex() + 1);
    }, ACTION_INTERVAL_MS);
  });

  onCleanup(() => {
    clearTimer();
  });

  const placeLabels: Record<'thousand' | 'hundred' | 'ten' | 'unit', string> = {
    thousand: 'Thousands',
    hundred: 'Hundreds',
    ten: 'Tens',
    unit: 'Units',
  };

  const beadVisualFor = (kind: 'thousand' | 'hundred' | 'ten' | 'unit') => {
    switch (kind) {
      case 'thousand':
        return <GoldenBeadThousand />;
      case 'hundred':
        return <GoldenBeadHundred />;
      case 'ten':
        return <GoldenBeadTen />;
      default:
        return <GoldenBeadUnit />;
    }
  };

  const BeadTokenStack = (props: { count: number; kind: 'thousand' | 'hundred' | 'ten' | 'unit'; highlighted?: boolean }) => {
    const items = Array.from({ length: Math.max(props.count, 0) });
    return (
      <div class={`presentation-token-stack ${props.highlighted ? 'is-highlighted' : ''}`} data-kind={props.kind}>
        <Show when={props.count > 0} fallback={<span class="presentation-token-placeholder">0</span>}>
          <For each={items}>
            {(_, index) => (
              <div class="presentation-token" data-index={index()}>{beadVisualFor(props.kind)}</div>
            )}
          </For>
        </Show>
      </div>
    );
  };

  const StampTokenStack = (props: { count: number; value: 1 | 10 | 100; highlighted?: boolean }) => {
    const items = Array.from({ length: Math.max(props.count, 0) });
    return (
      <div class={`presentation-token-stack ${props.highlighted ? 'is-highlighted' : ''}`} data-kind={`stamp-${props.value}`}>
        <Show when={props.count > 0} fallback={<span class="presentation-token-placeholder">0</span>}>
          <For each={items}>
            {(_, index) => (
              <div class="presentation-token" data-index={index()}>
                <StampTile value={props.value} />
              </div>
            )}
          </For>
        </Show>
      </div>
    );
  };

  const exchangeEntries = createMemo(() => {
    const entries: Array<{
      from: 'unit' | 'ten' | 'hundred';
      info: { remainder: number; carried: number; to: 'ten' | 'hundred' | 'thousand' };
    }> = [];
    if (stage.exchangeBoards.unit) entries.push({ from: 'unit', info: stage.exchangeBoards.unit });
    if (stage.exchangeBoards.ten) entries.push({ from: 'ten', info: stage.exchangeBoards.ten });
    if (stage.exchangeBoards.hundred) entries.push({ from: 'hundred', info: stage.exchangeBoards.hundred });
    return entries;
  });

  const finalProductValue = createMemo(() =>
    stage.finalProduct ? normalizeCardValue(stage.finalProduct) : null,
  );

  const GoldenBeadWorkspaceVisual = () => {
    if (stage.beadTrays.length === 0) {
      return <p class="text-xs text-subtle">Golden beads will appear as the guide lays them out.</p>;
    }

    const trays = stage.beadTrays;
    const ribbonLength = trays.length >= 3 ? 'long' : trays.length === 2 ? 'medium' : 'short';

    return (
      <div class="presentation-bead-workspace">
        <div class="presentation-bead-tray-collection">
          <For each={trays}>
            {(tray, index) => (
              <div class="presentation-bead-tray">
                <span class="presentation-panel__label">Layout {index() + 1}</span>
                <div class="presentation-bead-tray__grid">
                  <For each={[
                    { key: 'thousand' as const, value: tray.thousand },
                    { key: 'hundred' as const, value: tray.hundred },
                    { key: 'ten' as const, value: tray.ten },
                    { key: 'unit' as const, value: tray.unit },
                  ]}>
                    {(entry) => (
                      <div class={`presentation-bead-place ${stage.highlight === entry.key ? 'is-highlighted' : ''}`}>
                        <span class="presentation-bead-place__label">{placeLabels[entry.key]}</span>
                        <BeadTokenStack count={entry.value} kind={entry.key} highlighted={stage.highlight === entry.key} />
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>

        <Show when={stage.ribbonVisible}>
          <div class={`presentation-ribbon ${stage.highlight === 'multiplication-ribbon' ? 'is-highlighted' : ''}`}>
            <YellowRibbon length={ribbonLength} />
          </div>
        </Show>

        <Show when={exchangeEntries().length > 0}>
          <div class="presentation-exchange-board">
            <For each={exchangeEntries()}>
              {(entry) => (
                <div class={`presentation-exchange-board__cell ${stage.highlight === entry.from ? 'is-highlighted' : ''}`}>
                  <span class="presentation-panel__label">Gather {placeLabels[entry.from]}</span>
                  <div class="presentation-exchange-board__group">
                    <span class="presentation-exchange-board__group-label">Remain</span>
                    <BeadTokenStack count={entry.info.remainder} kind={entry.from} highlighted={stage.highlight === entry.from} />
                  </div>
                  <Show when={entry.info.carried > 0}>
                    <div class="presentation-exchange-board__group">
                      <span class="presentation-exchange-board__group-label">Carry to {placeLabels[entry.info.to]}</span>
                      <BeadTokenStack count={entry.info.carried} kind={entry.info.to} />
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    );
  };

  const StampGameWorkspaceVisual = () => {
    if (stage.stampColumns.length === 0) {
      return <p class="text-xs text-subtle">Stamp tiles will appear as the guide lays them out.</p>;
    }

    return (
      <div class="presentation-stamp-workspace">
        <For each={stage.stampColumns}>
          {(column, index) => (
            <div class="presentation-stamp-column">
              <span class="presentation-panel__label">Column {index() + 1}</span>
              <div class="presentation-stamp-stack">
                <StampTokenStack count={column.hundreds} value={100} highlighted={stage.highlight === 'hundred'} />
                <StampTokenStack count={column.tens} value={10} highlighted={stage.highlight === 'ten'} />
                <StampTokenStack count={column.units} value={1} highlighted={stage.highlight === 'unit'} />
              </div>
            </div>
          )}
        </For>
      </div>
    );
  };

  const scriptSummary = () => script()?.summary ?? '';
  const actions = () => script()?.actions ?? [];

  if (!script()) {
    return (
      <Card variant="soft" class="space-y-3 text-subtle">
        <p>No scripted presentation available.</p>
      </Card>
    );
  }

  return (
    <div class="flex flex-col gap-5 text-[color:var(--color-text)]">
      <div class="space-y-2">
        <Chip tone="primary" size="sm">
          Narrated presentation
        </Chip>
        <h4 class="text-2xl font-semibold text-[color:var(--color-heading)]">{script()?.title}</h4>
        <Show when={scriptSummary()}>
          {(summary) => <p class="text-sm text-subtle">{summary()}</p>}
        </Show>
      </div>

      <Card variant="flat" class="surface-neutral rounded-[var(--radius-lg)] p-4 sm:p-5 space-y-3">
        <p class="text-xs uppercase tracking-wide text-label-soft">Stage narration</p>
        <p class="text-base leading-snug">{stage.narration || 'Press play to begin the scripted presentation.'}</p>
        <div class="flex flex-wrap items-center gap-2">
          <Button size="compact" onClick={() => advanceTo(Math.max(activeIndex() - 1, 0))}>
            Previous step
          </Button>
          <Button size="compact" onClick={() => advanceTo(Math.min(activeIndex() + 1, actions().length - 1))}>
            Next step
          </Button>
          <Button variant="secondary" size="compact" onClick={resetStage}>
            Restart presentation
          </Button>
          <Show when={autoPlaying()}>
            <Chip tone="green" size="sm">
              Auto advance
            </Chip>
          </Show>
        </div>
      </Card>

      <Card variant="soft" class="rounded-[var(--radius-lg)] p-4 sm:p-5 space-y-4">
        <header class="space-y-1">
          <p class="text-xs uppercase tracking-wide text-label-soft">Montessori stage</p>
          <p class="text-sm text-subtle">
            Snapshot of materials after the current scripted action.
          </p>
        </header>

        <div class="presentation-stage-grid">
          <section class="presentation-panel">
            <h5 class="text-sm font-semibold text-[color:var(--color-heading)]">Number cards</h5>
            <div class="presentation-card-stack">
              <Show
                when={stage.multiplicandStack.length > 0}
                fallback={<p class="text-xs text-subtle">Cards will appear as the guide introduces them.</p>}
              >
                <For each={stage.multiplicandStack}>
                  {(card, index) => (
                    <div class="presentation-card-stack__item" style={{ '--offset': `${index()}` }}>
                      <NumberCard value={card} size="sm" />
                    </div>
                  )}
                </For>
              </Show>
            </div>
            <div class="presentation-multiplier">
              <span class="presentation-panel__label">Multiplier</span>
              <Show
                when={stage.multiplierCard !== undefined}
                fallback={<span class="text-xs text-subtle">—</span>}
              >
                <NumberCard value={stage.multiplierCard ?? 0} size="sm" />
              </Show>
            </div>
          </section>

          <section class={`presentation-panel presentation-panel--workspace ${stage.highlight === 'multiplication-ribbon' ? 'is-highlighted' : ''}`}>
            <h5 class="text-sm font-semibold text-[color:var(--color-heading)]">
              {stage.activeMaterial === 'stamp-game' ? 'Stamp game workspace' : 'Golden bead workspace'}
            </h5>
            <Show when={stage.activeMaterial === 'stamp-game'}>
              <StampGameWorkspaceVisual />
            </Show>
            <Show when={stage.activeMaterial !== 'stamp-game'}>
              <GoldenBeadWorkspaceVisual />
            </Show>
          </section>

          <section class="presentation-panel presentation-panel--paper">
            <h5 class="text-sm font-semibold text-[color:var(--color-heading)]">Guide’s paper</h5>
            <Show
              when={stage.paperNotes.length > 0}
              fallback={<p class="text-xs text-subtle">Notes will appear as the guide records them.</p>}
            >
              <div class="presentation-paper-notes">
                <For each={stage.paperNotes}>{(note) => <PaperNote>{note}</PaperNote>}</For>
              </div>
            </Show>
          </section>

          <Show when={finalProductValue() !== null}>
            <section class="presentation-panel presentation-panel--final">
              <h5 class="text-sm font-semibold text-[color:var(--color-heading)]">Final product</h5>
              <NumberCard value={finalProductValue() ?? 0} size="md" />
              <Show when={stage.finalProduct}>
                {(value) => <p class="text-sm text-subtle">{value()}</p>}
              </Show>
            </section>
          </Show>
        </div>
      </Card>

      <Card variant="flat" class="surface-neutral rounded-[var(--radius-lg)] p-4 sm:p-5">
        <p class="text-xs uppercase tracking-wide text-label-soft">Script actions</p>
        <div class="mt-3 flex flex-col gap-2">
          <For each={actions()}>
            {(action, index) => {
              const isActive = () => index() === activeIndex();
              return (
                <button
                  type="button"
                  onClick={() => advanceTo(index())}
                  class={`rounded-[var(--radius-md)] px-4 py-3 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:rgba(64,157,233,0.55)] ${
                    isActive()
                      ? 'surface-info text-[#0b4a8c] shadow-ambient'
                      : 'surface-soft text-[color:var(--color-text)] hover:shadow-ambient'
                  }`}
                >
                  <span class="block text-xs font-semibold uppercase tracking-wide text-label-soft">
                    Step {index() + 1}
                  </span>
                  <span class="mt-1 block leading-snug">
                    {action.type === 'narrate' && action.text}
                    {action.type === 'showCard' && `Show card ${action.card} (${action.position})`}
                    {action.type === 'placeBeads' && `Place ${action.quantity} ${action.place} beads on tray ${action.tray}`}
                    {action.type === 'duplicateTray' && `Duplicate layout ${action.count} times`}
                    {action.type === 'highlight' && `Highlight ${action.target}`}
                    {action.type === 'exchange' && `Exchange ${action.quantity} ${action.from}s for ${action.to}s`}
                    {action.type === 'stackPlaceValues' && `Stack ${action.order.join(', ')}`}
                    {action.type === 'writeResult' && `Write ${action.value}`}
                    {action.type === 'showStamp' && `Show ${action.rows} rows of ${action.stamp} stamp${action.rows > 1 ? 's' : ''}`}
                    {action.type === 'countTotal' && `Count total ${action.value}`}
                  </span>
                </button>
              );
            }}
          </For>
        </div>
      </Card>
    </div>
  );
};
