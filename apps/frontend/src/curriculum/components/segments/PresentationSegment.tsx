import { For, Show, batch, createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
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

interface BeadToken {
  id: number;
  fresh: boolean;
}

interface BeadTrayTokens {
  thousand: BeadToken[];
  hundred: BeadToken[];
  ten: BeadToken[];
  unit: BeadToken[];
}

interface StampToken {
  id: number;
  fresh: boolean;
}

interface StampColumnTokens {
  hundreds: StampToken[];
  tens: StampToken[];
  units: StampToken[];
}

interface PresentationStageState {
  narration: string;
  multiplicandStack: number[];
  multiplierCard?: number;
  paperNotes: string[];
  beadTrays: BeadTrayTokens[];
  stampColumns: StampColumnTokens[];
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
  nextTokenId: number;
}

const createEmptyBeadTray = (): BeadTrayTokens => ({
  thousand: [],
  hundred: [],
  ten: [],
  unit: [],
});

const createEmptyStampColumn = (): StampColumnTokens => ({
  hundreds: [],
  tens: [],
  units: [],
});

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
  nextTokenId: 0,
});

const normalizeCardValue = (value: string) => {
  const numeric = Number(value.replace(/[^0-9-]/g, ''));
  return Number.isNaN(numeric) ? 0 : numeric;
};

type BeadPlace = keyof BeadTrayTokens;
type StampPlace = keyof StampColumnTokens;

const settleTokens = <T extends { fresh: boolean }>(tokens: T[]): T[] =>
  tokens.map((token) => ({ ...token, fresh: false }));

const AUTO_STEP_DELAY_MS = 3200;

export const PresentationSegment = (props: PresentationSegmentProps) => {
  const script = createMemo(() => props.script);

  const [stage, setStage] = createStore(createInitialState());
  const [activeIndex, setActiveIndex] = createSignal(0);
  const [appliedCount, setAppliedCount] = createSignal(0);
  const [processedScriptId, setProcessedScriptId] = createSignal<string | undefined>(undefined);

  let timer: number | undefined;
  let completionSignalled = false;

  const createBeadTokens = (count: number): BeadToken[] => {
    if (count <= 0) return [];
    let created: BeadToken[] = [];
    setStage('nextTokenId', (nextId: number) => {
      created = Array.from({ length: count }, (_, index) => ({ id: nextId + index, fresh: true }));
      return nextId + count;
    });
    return created;
  };

  const createStampTokens = (count: number): StampToken[] => {
    if (count <= 0) return [];
    let created: StampToken[] = [];
    setStage('nextTokenId', (nextId: number) => {
      created = Array.from({ length: count }, (_, index) => ({ id: nextId + index, fresh: true }));
      return nextId + count;
    });
    return created;
  };

  const scheduleBeadSettlement = (trayIndex: number, place: BeadPlace) => {
    window.setTimeout(() => {
      setStage('beadTrays', trayIndex, place, (tokens: BeadToken[]) => settleTokens(tokens));
    }, 220);
  };

  const scheduleStampSettlement = (columnIndex: number, place: StampPlace) => {
    window.setTimeout(() => {
      setStage('stampColumns', columnIndex, place, (tokens: StampToken[]) => settleTokens(tokens));
    }, 220);
  };

  const resetStage = () => {
    setStage(createInitialState());
    setActiveIndex(0);
    setAppliedCount(0);
    completionSignalled = false;
    // Don't reset processedScriptId here - we track it separately
  };

  const ensureBeadTray = (index: number) => {
    setStage(
      'beadTrays',
      produce((trays: BeadTrayTokens[]) => {
        while (trays.length < index) {
          trays.push(createEmptyBeadTray());
        }
      }),
    );
  };

  const ensureStampColumn = (index: number) => {
    setStage(
      'stampColumns',
      produce((columns: StampColumnTokens[]) => {
        while (columns.length < index) {
          columns.push(createEmptyStampColumn());
        }
      }),
    );
  };

  const logPaperNote = (text: string) => {
    setStage('paperNotes', (notes: string[]) => [...notes, text]);
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
          setStage('multiplicandStack', (cards: number[]) => [...cards, cardValue]);
        } else if (action.position === 'multiplier') {
          setStage('multiplierCard', cardValue);
        } else if (action.position === 'paper') {
          setStage('paperNotes', (notes: string[]) => [...notes, action.card]);
        }
        break;
      }
      case 'placeBeads': {
        setStage('activeMaterial', 'golden-beads');
        ensureBeadTray(action.tray);
        const tokens = createBeadTokens(action.quantity);
        setStage('highlight', action.place);
        setStage('beadTrays', action.tray - 1, action.place, () => tokens);
        scheduleBeadSettlement(action.tray - 1, action.place);
        break;
      }
      case 'duplicateTray': {
        if (stage.beadTrays.length > 0) {
          const source = stage.beadTrays[0];
          const duplicates = Array.from({ length: action.count }, () => ({
            thousand: createBeadTokens(source.thousand.length),
            hundred: createBeadTokens(source.hundred.length),
            ten: createBeadTokens(source.ten.length),
            unit: createBeadTokens(source.unit.length),
          }));
          setStage('beadTrays', () => duplicates);
          duplicates.forEach((tray, trayIndex) => {
            if (tray.thousand.length) scheduleBeadSettlement(trayIndex, 'thousand');
            if (tray.hundred.length) scheduleBeadSettlement(trayIndex, 'hundred');
            if (tray.ten.length) scheduleBeadSettlement(trayIndex, 'ten');
            if (tray.unit.length) scheduleBeadSettlement(trayIndex, 'unit');
          });
        } else if (stage.stampColumns.length > 0) {
          const source = stage.stampColumns[0];
          const duplicates = Array.from({ length: action.count }, () => ({
            hundreds: createStampTokens(source.hundreds.length),
            tens: createStampTokens(source.tens.length),
            units: createStampTokens(source.units.length),
          }));
          setStage('stampColumns', () => duplicates);
          duplicates.forEach((column, columnIndex) => {
            if (column.hundreds.length) scheduleStampSettlement(columnIndex, 'hundreds');
            if (column.tens.length) scheduleStampSettlement(columnIndex, 'tens');
            if (column.units.length) scheduleStampSettlement(columnIndex, 'units');
          });
        } else {
          setStage('beadTrays', () => Array.from({ length: action.count }, () => createEmptyBeadTray()));
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
          const fromKey = action.from === 'unit' ? 'units' : action.from === 'ten' ? 'tens' : 'hundreds';
          ensureStampColumn(1);
          const column = stage.stampColumns[0] ?? createEmptyStampColumn();
          const currentTokens = column[fromKey];
          const kept = currentTokens.slice(0, Math.min(action.remainder, currentTokens.length)).map((token: StampToken) => ({
            ...token,
            fresh: false,
          }));
          const removedCount = currentTokens.length - kept.length;
          const carriedGroups = action.quantity > 0 ? Math.max(0, Math.floor(removedCount / action.quantity)) : 0;

          setStage('stampColumns', 0, fromKey, () => kept);
          scheduleStampSettlement(0, fromKey);

          if (carriedGroups > 0) {
            if (action.to === 'thousand') {
              setStage('paperNotes', (notes: string[]) => [...notes, `${carriedGroups} thousand carried forward.`]);
            } else {
              const toKey: StampPlace = action.to === 'ten' ? 'tens' : 'hundreds';
              const carryTokens = createStampTokens(carriedGroups);
              setStage('stampColumns', 0, toKey, (existing: StampToken[]) => [...existing, ...carryTokens]);
              scheduleStampSettlement(0, toKey);
            }
          }

          setStage('highlight', action.from);
          setStage('exchangeBoards', action.from, { remainder: action.remainder, carried: carriedGroups, to: action.to });
        } else {
          ensureBeadTray(1);
          const tray = stage.beadTrays[0] ?? createEmptyBeadTray();
          const currentTokens = tray[action.from];
          const kept = currentTokens.slice(0, Math.min(action.remainder, currentTokens.length)).map((token: BeadToken) => ({
            ...token,
            fresh: false,
          }));
          const removedCount = currentTokens.length - kept.length;
          const carriedGroups = action.quantity > 0 ? Math.max(0, Math.floor(removedCount / action.quantity)) : 0;

          setStage('beadTrays', 0, action.from, () => kept);
          scheduleBeadSettlement(0, action.from);

          if (carriedGroups > 0) {
            const carryTokens = createBeadTokens(carriedGroups);
            setStage('beadTrays', 0, action.to, (existing: BeadToken[]) => [...existing, ...carryTokens]);
            scheduleBeadSettlement(0, action.to);
          }

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
            const tokens = createStampTokens(action.rows);
            setStage('stampColumns', index, 'hundreds', () => tokens);
            scheduleStampSettlement(index, 'hundreds');
          }
          if (action.stamp === '10') {
            const tokens = createStampTokens(action.rows);
            setStage('stampColumns', index, 'tens', () => tokens);
            scheduleStampSettlement(index, 'tens');
          }
          if (action.stamp === '1') {
            const tokens = createStampTokens(action.rows);
            setStage('stampColumns', index, 'units', () => tokens);
            scheduleStampSettlement(index, 'units');
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
    // Capture all reactive values first to avoid multiple reads
    const scriptValue = script();
    const currentIndex = activeIndex();
    const currentApplied = appliedCount();
    const currentScriptId = processedScriptId();
    
    if (!scriptValue) {
      resetStage();
      setProcessedScriptId(undefined);
      return;
    }

    // Reset if script changed
    if (scriptValue.id !== currentScriptId) {
      resetStage();
      setProcessedScriptId(scriptValue.id);
      return; // Exit early, let it re-run with clean state
    }

    // Skip if we're going backwards
    if (currentApplied > currentIndex) {
      return;
    }

    // Apply actions from currentApplied to currentIndex
    const actions = scriptValue.actions;
    
    // Batch all state updates to prevent mid-update re-renders
    batch(() => {
      let applied = currentApplied;
      while (applied <= currentIndex && applied < actions.length) {
        applyAction(actions[applied]);
        applied += 1;
      }
      setAppliedCount(applied);
    });

    // Check for completion
    if (currentIndex >= actions.length - 1 && !completionSignalled) {
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
    const scriptValue = script();
    if (!scriptValue) return;

    const currentIndex = activeIndex();
    if (currentIndex >= scriptValue.actions.length - 1) {
      return;
    }

    // Use the captured index value to avoid reactive loop
    timer = window.setTimeout(() => {
      setActiveIndex(currentIndex + 1);
    }, AUTO_STEP_DELAY_MS);
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

  const BeadTokenStack = (props: {
    tokens?: BeadToken[];
    count?: number;
    kind: BeadPlace;
    highlighted?: boolean;
  }) => {
    const resolved = props.tokens ??
      Array.from({ length: Math.max(props.count ?? 0, 0) }, (_, index) => ({ id: -index - 1, fresh: false }));
    return (
      <div class={`presentation-token-stack ${props.highlighted ? 'is-highlighted' : ''}`} data-kind={props.kind}>
        <Show when={resolved.length > 0} fallback={<span class="presentation-token-placeholder">0</span>}>
          <For each={resolved}>
            {(token: BeadToken) => (
              <div class={`presentation-token ${token.fresh ? 'is-fresh' : ''}`} data-id={token.id}>
                {beadVisualFor(props.kind)}
              </div>
            )}
          </For>
        </Show>
      </div>
    );
  };

  const StampTokenStack = (props: {
    tokens?: StampToken[];
    count?: number;
    value: 1 | 10 | 100;
    highlighted?: boolean;
  }) => {
    const resolved = props.tokens ??
      Array.from({ length: Math.max(props.count ?? 0, 0) }, (_, index) => ({ id: -index - 1, fresh: false }));
    return (
      <div class={`presentation-token-stack ${props.highlighted ? 'is-highlighted' : ''}`} data-kind={`stamp-${props.value}`}>
        <Show when={resolved.length > 0} fallback={<span class="presentation-token-placeholder">0</span>}>
          <For each={resolved}>
            {(token: StampToken) => (
              <div class={`presentation-token ${token.fresh ? 'is-fresh' : ''}`} data-id={token.id}>
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

  // Make this a reactive rendering - inline in JSX instead of function
  const renderGoldenBeadWorkspace = () => {
    const trays = stage.beadTrays;
    
    return (
      <Show when={trays.length > 0}>
        <div class="presentation-bead-workspace">
          <div class="presentation-bead-tray-collection">
            <For each={trays}>
              {(tray: BeadTrayTokens) => (
                <div class="presentation-bead-tray">
                  <div class="presentation-bead-tray__grid">
                    <For each={[
                      { key: 'thousand' as const, tokens: tray.thousand },
                      { key: 'hundred' as const, tokens: tray.hundred },
                      { key: 'ten' as const, tokens: tray.ten },
                      { key: 'unit' as const, tokens: tray.unit },
                    ]}>
                      {(entry: { key: BeadPlace; tokens: BeadToken[] }) => (
                        <div class={`presentation-bead-place ${stage.highlight === entry.key ? 'is-highlighted' : ''}`}>
                          <BeadTokenStack tokens={entry.tokens} kind={entry.key} highlighted={stage.highlight === entry.key} />
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
              <YellowRibbon length={trays.length >= 3 ? 'long' : trays.length === 2 ? 'medium' : 'short'} />
            </div>
          </Show>

          <Show when={exchangeEntries().length > 0}>
            <div class="presentation-exchange-board">
              <For each={exchangeEntries()}>
                {(entry: { from: 'unit' | 'ten' | 'hundred'; info: { remainder: number; carried: number; to: 'ten' | 'hundred' | 'thousand' } }) => (
                  <div class={`presentation-exchange-board__cell ${stage.highlight === entry.from ? 'is-highlighted' : ''}`}>
                    <div class="presentation-exchange-board__group">
                      <BeadTokenStack count={entry.info.remainder} kind={entry.from} highlighted={stage.highlight === entry.from} />
                    </div>
                    <Show when={entry.info.carried > 0}>
                      <div class="presentation-exchange-board__group">
                        <BeadTokenStack count={entry.info.carried} kind={entry.info.to} />
                      </div>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>
      </Show>
    );
  };

  const StampGameWorkspaceVisual = () => {
    if (stage.stampColumns.length === 0) {
      return null; // Don't show placeholder text - keep it clean
    }

    return (
      <div class="presentation-stamp-workspace">
        <For each={stage.stampColumns}>
          {(column: StampColumnTokens) => (
            <div class="presentation-stamp-column">
              <div class="presentation-stamp-stack">
                <StampTokenStack tokens={column.hundreds} value={100} highlighted={stage.highlight === 'hundred'} />
                <StampTokenStack tokens={column.tens} value={10} highlighted={stage.highlight === 'ten'} />
                <StampTokenStack tokens={column.units} value={1} highlighted={stage.highlight === 'unit'} />
              </div>
            </div>
          )}
        </For>
      </div>
    );
  };

  const scriptSummary = () => script()?.summary ?? '';
  const actions = () => script()?.actions ?? [];

  // Allow scrubbing backwards: when user selects an earlier index, reset and re-apply
  const handleSelectAction = (index: number) => {
    const scriptValue = script();
    if (!scriptValue) return;
    const safeIndex = Math.max(0, Math.min(index, scriptValue.actions.length - 1));
    // If we go backwards, rebuild state to the selected action
    if (appliedCount() > safeIndex) {
      resetStage();
      setProcessedScriptId(scriptValue.id);
      batch(() => {
        let applied = 0;
        while (applied <= safeIndex && applied < scriptValue.actions.length) {
          applyAction(scriptValue.actions[applied]);
          applied += 1;
        }
        setAppliedCount(applied);
        setActiveIndex(safeIndex);
      });
      return;
    }
    // Forward move uses normal mechanism
    setActiveIndex(safeIndex);
  };

  if (!script()) {
    return (
      <Card variant="soft" class="space-y-3 text-subtle">
        <p>No scripted presentation available.</p>
      </Card>
    );
  }

  return (
    <div class="lesson-stage" data-variant="presentation" style={{ position: 'relative' }}>
      {/* Prominent caption for K-3 learners */}
      <Show when={stage.narration}>
        <div class="presentation-caption">
          {stage.narration}
        </div>
      </Show>

      <div class="lesson-stage__canvas">
        <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', gap: '2rem', width: '100%', 'max-width': '900px', position: 'relative' }}>
          {/* Paper notes area (handwritten) */}
          <Show when={stage.paperNotes.length > 0}>
            <div class="presentation-paper-notes" aria-label="Notes">
              <For each={stage.paperNotes}>
                {(note: string) => (
                  <PaperNote>{note}</PaperNote>
                )}
              </For>
            </div>
          </Show>

          {/* Show number cards only when they exist */}
          <Show when={stage.multiplicandStack.length > 0 || stage.multiplierCard !== undefined}>
            <div class="presentation-cards-minimal">
              <Show when={stage.multiplicandStack.length > 0}>
                <div class="presentation-card-stack">
                  <For each={stage.multiplicandStack}>
                    {(card: number, index: () => number) => (
                      <div class="presentation-card-stack__item" style={{ '--offset': `${index()}` }}>
                        <NumberCard value={card} size="md" />
                      </div>
                    )}
                  </For>
                </div>
              </Show>
              <Show when={stage.multiplierCard !== undefined}>
                <div class="presentation-multiplier-minimal">
                  <NumberCard value={stage.multiplierCard ?? 0} size="md" />
                </div>
              </Show>
            </div>
          </Show>

          {/* Minimal workspace - materials and workspace */}
          <div class="presentation-workspace-minimal">
            <Show when={stage.activeMaterial === 'stamp-game'}>
              <StampGameWorkspaceVisual />
            </Show>
            <Show when={stage.activeMaterial === 'golden-beads'}>
              {renderGoldenBeadWorkspace()}
            </Show>
          </div>

          {/* Show final answer when available */}
          <Show when={finalProductValue() !== null}>
            <div class="presentation-answer">
              <NumberCard value={finalProductValue() ?? 0} size="lg" />
            </div>
          </Show>

          {/* Per-action timeline */}
          <Show when={actions().length > 0}>
            <div class="presentation-action-timeline" aria-label="Action timeline">
              <div class="presentation-action-track">
                <div class="presentation-action-progress" style={{ width: `${(activeIndex() / Math.max(actions().length - 1, 1)) * 100}%` }} />
                <For each={actions()}>
                  {(_: PresentationAction, idx: () => number) => {
                    const position = actions().length <= 1 ? 0 : (idx() / (actions().length - 1)) * 100;
                    const isCurrent = idx() === activeIndex();
                    return (
                      <button
                        type="button"
                        class={`presentation-action-dot ${isCurrent ? 'is-active' : ''}`}
                        style={{ left: `${position}%` }}
                        aria-label={`Action ${idx() + 1}`}
                        onClick={() => handleSelectAction(idx())}
                      />
                    );
                  }}
                </For>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};
