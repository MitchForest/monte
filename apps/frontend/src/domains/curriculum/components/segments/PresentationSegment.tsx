import { For, Show, batch, createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { Motion } from 'solid-motionone';

import type { PlayerStatus } from '../../machines/lessonPlayer';
import type { DemoEventRecorder } from '../../analytics/events';
import type { LessonSegment, PresentationAction, PresentationScript } from '@monte/types';
import { Card } from '../../../../components/ui';
import {
  NumberCard,
  GoldenBeadUnit,
  GoldenBeadTen,
  GoldenBeadHundred,
  GoldenBeadThousand,
  StampTile,
  YellowRibbon,
} from '../materials';
import { LessonInventoryOverlay, useSegmentInventory } from '../../inventory/context';
import { LessonCanvas, useViewportObserver } from '../../canvas';

export interface PresentationSegmentProps {
  lessonId: string;
  segment: LessonSegment & { type: 'presentation' };
  playerStatus: PlayerStatus;
  onAutoAdvance: () => void;
  script: PresentationScript;
  audioSrc?: string;
  captionSrc?: string;
  audioLoading?: boolean;
  recordEvent?: DemoEventRecorder;
  onNarrationChange?: (narration: string, actionIndex: number) => void;
  onPaperNotesChange?: (notes: string[]) => void;
  onActionChange?: (currentIndex: number, totalActions: number) => void;
  onActionSelect?: (handler: (index: number) => void) => void;
  actionJumpToIndex?: number;
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

type TokenKind = 'thousand' | 'hundred' | 'ten' | 'unit' | 'copy';

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
  exchangeZone: {
    unit: BeadToken[];
    ten: BeadToken[];
    hundred: BeadToken[];
    thousand: BeadToken[];
  };
  belowLineBeads: {
    unit: BeadToken[];
    ten: BeadToken[];
    hundred: BeadToken[];
  };
  exchangeResultCards: {
    unit?: number;
    ten?: number;
    hundred?: number;
    thousand?: number;
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
  exchangeZone: {
    unit: [],
    ten: [],
    hundred: [],
    thousand: [],
  },
  belowLineBeads: {
    unit: [],
    ten: [],
    hundred: [],
  },
  exchangeResultCards: {},
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

  createEffect(() => {
    void props.segment.id; // Track segment changes
    setHasPlayedAudio(false);
    setAudioUnavailable(false);
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
  });

  createEffect(() => {
    if (!audioElement || !props.audioSrc) return;
    if (props.playerStatus === 'playing') {
      void audioElement.play().catch(() => undefined);
    }
    if (props.playerStatus === 'paused' || props.playerStatus === 'idle') {
      audioElement.pause();
    }
  });

  useViewportObserver(
    (state) => {
      props.recordEvent?.({
        type: 'canvas.viewport',
        lessonId: props.lessonId,
        segmentId: props.segment.id,
        scale: Number(state.scale.toFixed(3)),
        offset: {
          x: Math.round(state.offset.x),
          y: Math.round(state.offset.y),
        },
      });
    },
    {
      throttleMs: 200,
      minScaleDelta: 0.02,
      minOffsetDelta: 4,
    },
  );

  const [stage, setStage] = createStore(createInitialState());
  const [activeIndex, setActiveIndex] = createSignal(0);
  const [appliedCount, setAppliedCount] = createSignal(0);
  const [processedScriptId, setProcessedScriptId] = createSignal<string | undefined>(undefined);
  const [hasPlayedAudio, setHasPlayedAudio] = createSignal(false);
  const [audioUnavailable, setAudioUnavailable] = createSignal(false);
  const hasAudio = createMemo(() => Boolean(props.audioSrc));
  const audioLoading = createMemo(() => Boolean(props.audioLoading));

  createEffect(() => {
    if (props.audioSrc) {
      setAudioUnavailable(false);
    }
  });
  const segmentInventory = useSegmentInventory({
    id: props.segment.id,
    materialBankId: props.segment.materialBankId,
  });
  const inventoryBank = segmentInventory.bank;
  const inventoryTokens = segmentInventory.tokenTypes;
  const inventoryActions = segmentInventory.actions;

  type InventoryTokenEntry = ReturnType<typeof inventoryTokens>[number];

  const tokensByKind = createMemo<Map<TokenKind, InventoryTokenEntry>>(() => {
    const map = new Map<TokenKind, InventoryTokenEntry>();
    const tokens = inventoryTokens();

    const assign = (kind: TokenKind, token: InventoryTokenEntry) => {
      if (!map.has(kind)) {
        map.set(kind, token);
      }
    };

    for (const token of tokens) {
      const visual = token.definition.visual;
      if (!visual) continue;
      if (visual.kind === 'bead') {
        assign(visual.place, token);
      } else if (visual.kind === 'stamp') {
        switch (visual.value) {
          case 100:
            assign('hundred', token);
            break;
          case 10:
            assign('ten', token);
            break;
          case 1:
            assign('unit', token);
            break;
          default:
            break;
        }
      } else if (visual.kind === 'card' || visual.kind === 'custom') {
        assign('copy', token);
      }
    }

    return map;
  });

  const recordInventoryDelta = (tokenTypeId: string, delta: number, reason: 'consume' | 'replenish') => {
    if (!props.recordEvent) return;
    const bank = inventoryBank();
    if (!bank) return;
    props.recordEvent({
      type: 'inventory.delta',
      lessonId: props.lessonId,
      segmentId: props.segment.id,
      bankId: bank.id,
      tokenTypeId,
      delta,
      reason,
    });
  };

  const handleInventoryShortage = (label: string) => {
    logPaperNote(`Not enough ${label.toLowerCase()} available in supply.`);
  };

  const recordInventoryReset = () => {
    const bank = inventoryBank();
    if (!bank) return;
    props.recordEvent?.({
      type: 'inventory.reset',
      lessonId: props.lessonId,
      segmentId: props.segment.id,
      bankId: bank.id,
    });
  };

  const getAvailableQuantity = (kind: TokenKind) => tokensByKind().get(kind)?.quantity ?? 0;

  const ensureInventoryAvailable = (requirements: Array<[TokenKind, number]>) => {
    for (const [kind, amount] of requirements) {
      if (amount <= 0) continue;
      if (getAvailableQuantity(kind) < amount) {
        const label = tokensByKind().get(kind)?.definition.label ?? kind;
        handleInventoryShortage(label);
        setStage('highlight', kind);
        return false;
      }
    }
    return true;
  };

  const consumeInventory = (kind: TokenKind, amount: number) => {
    if (amount <= 0) return true;
    const entry = tokensByKind().get(kind);
    if (!entry) {
      return true;
    }
    const success = inventoryActions.consumeToken(entry.definition.id, amount);
    if (success) {
      recordInventoryDelta(entry.definition.id, -amount, 'consume');
      return true;
    }
    handleInventoryShortage(entry.definition.label ?? kind);
    return false;
  };

  createEffect(() => {
    const materialId = segmentInventory.materialId();
    if (!materialId) return;
    if (materialId === 'golden-beads' || materialId === 'stamp-game') {
      if (stage.activeMaterial !== materialId) {
        setStage('activeMaterial', materialId);
      }
    }
  });

  let audioElement: HTMLAudioElement | undefined;

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
    recordInventoryReset();
    inventoryActions.resetBank();
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
    setStage('paperNotes', (notes: string[]) => {
      const updated = [...notes, text];
      props.onPaperNotesChange?.(updated);
      return updated;
    });
  };

  const applyAction = (action: PresentationAction) => {
    setStage('lastAction', action);

    switch (action.type) {
      case 'narrate':
        setStage('narration', action.text);
        props.onNarrationChange?.(action.text, activeIndex());
        break;
      case 'showCard': {
        const cardValue = normalizeCardValue(action.card);
        if (action.position === 'multiplicand-stack') {
          setStage('multiplicandStack', (cards: number[]) => [...cards, cardValue]);
        } else if (action.position === 'multiplier') {
          setStage('multiplierCard', cardValue);
          // Update paper notes when both multiplicand and multiplier are set
          const multiplicandTotal = stage.multiplicandStack.reduce((sum: number, val: number) => sum + val, 0);
          if (multiplicandTotal > 0) {
            logPaperNote(`${multiplicandTotal.toLocaleString()} × ${cardValue}`);
          }
        } else if (action.position === 'paper') {
          logPaperNote(action.card);
        }
        break;
      }
      case 'placeBeads': {
        if (!consumeInventory(action.place, action.quantity)) {
          setStage('highlight', action.place);
          break;
        }
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
          const existing = stage.beadTrays.length;
          const additional = existing === 0 ? action.count : Math.max(0, action.count - existing);
          const requirements: Array<[TokenKind, number]> = [
            ['thousand', source.thousand.length * additional],
            ['hundred', source.hundred.length * additional],
            ['ten', source.ten.length * additional],
            ['unit', source.unit.length * additional],
          ];
          if (!ensureInventoryAvailable(requirements)) {
            return;
          }
          for (const [kind, amount] of requirements) {
            if (amount > 0) {
              consumeInventory(kind, amount);
            }
          }

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
          const existingColumns = stage.stampColumns.length;
          const additionalColumns = existingColumns === 0 ? action.count : Math.max(0, action.count - existingColumns);
          const stampRequirements: Array<[TokenKind, number]> = [
            ['hundred', source.hundreds.length * additionalColumns],
            ['ten', source.tens.length * additionalColumns],
            ['unit', source.units.length * additionalColumns],
          ];
          if (!ensureInventoryAvailable(stampRequirements)) {
            return;
          }
          for (const [kind, amount] of stampRequirements) {
            if (amount > 0) {
              consumeInventory(kind, amount);
            }
          }

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
        const stampKind: TokenKind = action.stamp === '100' ? 'hundred' : action.stamp === '10' ? 'ten' : 'unit';
        const totalTokens = action.rows * action.columns;
        if (!consumeInventory(stampKind, totalTokens)) {
          setStage('highlight', stampKind);
          break;
        }
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
      
      case 'moveBeadsBelowLine': {
        // Collect all beads of this type from all trays
        const allBeads: BeadToken[] = [];
        stage.beadTrays.forEach((tray: BeadTrayTokens) => {
          allBeads.push(...tray[action.place]);
        });
        
        // Move them to below-line zone
        setStage('belowLineBeads', action.place, allBeads);
        
        // Clear them from trays
        stage.beadTrays.forEach((_: BeadTrayTokens, trayIndex: number) => {
          setStage('beadTrays', trayIndex, action.place, []);
        });
        
        setStage('highlight', action.place);
        break;
      }
      
      case 'groupForExchange': {
        // Visual grouping happens in render - just update state
        setStage('highlight', action.place);
        break;
      }
      
      case 'exchangeBeads': {
        const beadsToExchange = stage.belowLineBeads[action.from];
        const groupSize = 10;
        const totalGroups = action.groupsOfTen;
        
        // Remove the beads being exchanged
        const remainingBeads = beadsToExchange.slice(totalGroups * groupSize);
        setStage('belowLineBeads', action.from, remainingBeads);
        
        // Create new beads in the exchange zone (they'll animate to the top)
        if (totalGroups > 0) {
          const newBeads = createBeadTokens(totalGroups);
          setStage('exchangeZone', action.to, newBeads);
          
          // After animation, move them to the first tray
          setTimeout(() => {
            ensureBeadTray(1);
            setStage('beadTrays', 0, action.to, (existing: BeadToken[]) => [...existing, ...newBeads]);
            setStage('exchangeZone', action.to, []);
            scheduleBeadSettlement(0, action.to);
          }, 1000);
        }
        
        setStage('highlight', action.from);
        break;
      }
      
      case 'placeResultCard': {
        setStage('exchangeResultCards', action.place, action.value);
        break;
      }
    }
  };

  // Expose action selection to parent
  createEffect(() => {
    const scriptValue = script();
    const currentIndex = activeIndex();
    if (scriptValue && props.onActionChange) {
      props.onActionChange(currentIndex, scriptValue.actions.length);
    }
  });

  // Expose handleSelectAction to parent via onActionSelect prop
  onMount(() => {
    if (props.onActionSelect) {
      // Pass our internal handleSelectAction function to the parent
      props.onActionSelect(handleSelectAction);
    }
  });

  // React to external action selection via prop - use untrack to prevent loop
  createEffect(() => {
    const jumpIndex = props.actionJumpToIndex;
    if (jumpIndex !== undefined && jumpIndex >= 0 && jumpIndex !== activeIndex()) {
      handleSelectAction(jumpIndex);
    }
  });

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

    // Only advance if playing
    if (props.playerStatus !== 'playing') {
      return;
    }

    // Use the captured index value to avoid reactive loop
    timer = window.setTimeout(() => {
      setActiveIndex(currentIndex + 1);
    }, AUTO_STEP_DELAY_MS);
  });

  onCleanup(() => {
    clearTimer();
    if (audioElement) {
      audioElement.pause();
    }
    recordInventoryReset();
    inventoryActions.resetBank();
  });

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
    
    // Determine optimal layout based on quantity and type
    const getLayout = () => {
      const count = resolved.length;
      if (count === 0) return { rows: 1, cols: 0 };
      
      // For thousands (cubes): arrange in compact rows
      if (props.kind === 'thousand') {
        if (count <= 3) return { rows: 1, cols: count };
        if (count <= 6) return { rows: 2, cols: 3 };
        return { rows: 3, cols: Math.ceil(count / 3) };
      }
      
      // For hundreds (squares): arrange in compact rows
      if (props.kind === 'hundred') {
        if (count <= 3) return { rows: 1, cols: count };
        if (count <= 6) return { rows: 2, cols: 3 };
        if (count <= 9) return { rows: 3, cols: 3 };
        return { rows: 3, cols: Math.ceil(count / 3) };
      }
      
      // For tens (bars): use compact grid - MUCH better space usage
      if (props.kind === 'ten') {
        if (count <= 2) return { rows: 1, cols: count };
        if (count <= 4) return { rows: 2, cols: 2 };
        if (count <= 6) return { rows: 2, cols: 3 };
        if (count <= 9) return { rows: 3, cols: 3 };
        if (count <= 12) return { rows: 3, cols: 4 };
        return { rows: 4, cols: Math.ceil(count / 4) };
      }
      
      // For units (single beads): arrange in compact grid
      if (props.kind === 'unit') {
        if (count <= 3) return { rows: count, cols: 1 };
        if (count <= 6) return { rows: 3, cols: 2 };
        if (count <= 9) return { rows: 3, cols: 3 };
        return { rows: 4, cols: Math.ceil(count / 4) };
      }
      
      return { rows: 1, cols: count };
    };
    
    const layout = getLayout();
    
    return (
      <div 
        class={`presentation-token-stack ${props.highlighted ? 'is-highlighted' : ''}`} 
        data-kind={props.kind}
        style={{
          'display': 'grid',
          'grid-template-columns': `repeat(${layout.cols}, auto)`,
          'grid-template-rows': `repeat(${layout.rows}, auto)`,
          'gap': props.kind === 'unit' ? '0.15rem' : props.kind === 'ten' ? '0.25rem' : '0.35rem',
          'justify-items': 'center',
          'align-items': 'center',
        }}
      >
        <Show when={resolved.length > 0}>
          <For each={resolved}>
            {(token: BeadToken) => (
              <Motion.div 
                class={`presentation-token ${token.fresh ? 'is-fresh' : ''}`} 
                data-id={token.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, easing: 'ease-out' }}
              >
                {beadVisualFor(props.kind)}
              </Motion.div>
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
        <Show when={resolved.length > 0}>
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
    const hasBeadsAboveLine = trays.some((tray: BeadTrayTokens) => 
      tray.thousand.length > 0 || tray.hundred.length > 0 || tray.ten.length > 0 || tray.unit.length > 0
    );
    const hasBeadsBelowLine = 
      stage.belowLineBeads.unit.length > 0 || 
      stage.belowLineBeads.ten.length > 0 || 
      stage.belowLineBeads.hundred.length > 0;
    
    return (
      <Show when={hasBeadsAboveLine || hasBeadsBelowLine}>
        <div class="presentation-bead-workspace">
          {/* Exchange zone - appears at top when exchanging beads upward */}
          <Show when={stage.exchangeZone.unit.length > 0 || stage.exchangeZone.ten.length > 0 || stage.exchangeZone.hundred.length > 0 || stage.exchangeZone.thousand.length > 0}>
            <Motion.div 
              class="presentation-exchange-zone"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, easing: 'ease-out' }}
            >
              <For each={[
                { key: 'thousand' as const, tokens: stage.exchangeZone.thousand },
                { key: 'hundred' as const, tokens: stage.exchangeZone.hundred },
                { key: 'ten' as const, tokens: stage.exchangeZone.ten },
                { key: 'unit' as const, tokens: stage.exchangeZone.unit },
              ]}>
                {(entry: { key: BeadPlace; tokens: BeadToken[] }) => (
                  <Show when={entry.tokens.length > 0}>
                    <Motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 100 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.8, easing: 'ease-out' }}
                    >
                      <BeadTokenStack tokens={entry.tokens} kind={entry.key} />
                    </Motion.div>
                  </Show>
                )}
              </For>
            </Motion.div>
          </Show>
        
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
                        <Show when={entry.tokens.length > 0}>
                          <div class={`presentation-bead-place ${stage.highlight === entry.key ? 'is-highlighted' : ''}`}>
                            <BeadTokenStack tokens={entry.tokens} kind={entry.key} highlighted={stage.highlight === entry.key} />
                          </div>
                        </Show>
                      )}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </div>

          <Show when={stage.ribbonVisible}>
            <Motion.div 
              class={`presentation-ribbon ${stage.highlight === 'multiplication-ribbon' ? 'is-highlighted' : ''}`}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.5, easing: 'ease-out' }}
            >
              <YellowRibbon length="full" />
            </Motion.div>
          </Show>

          {/* Below line exchange area */}
          <Show when={hasBeadsBelowLine}>
            <Motion.div 
              class="presentation-below-line-zone"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, easing: 'ease-out' }}
            >
              <For each={[
                { key: 'unit' as const, tokens: stage.belowLineBeads.unit },
                { key: 'ten' as const, tokens: stage.belowLineBeads.ten },
                { key: 'hundred' as const, tokens: stage.belowLineBeads.hundred },
              ]}>
                {(entry: { key: 'unit' | 'ten' | 'hundred'; tokens: BeadToken[] }) => (
                  <Show when={entry.tokens.length > 0}>
                    <div class="presentation-below-line-group">
                      <Motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, easing: 'ease-out' }}
                      >
                        <BeadTokenStack tokens={entry.tokens} kind={entry.key} highlighted={stage.highlight === entry.key} />
                      </Motion.div>
                      <Show when={stage.exchangeResultCards[entry.key] !== undefined}>
                        <Motion.div
                          class="presentation-result-card"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: 0.3, easing: 'ease-out' }}
                        >
                          <NumberCard value={stage.exchangeResultCards[entry.key] ?? 0} size="sm" />
                        </Motion.div>
                      </Show>
                    </div>
                  </Show>
                )}
              </For>
            </Motion.div>
          </Show>

          <Show when={exchangeEntries().length > 0}>
            <Motion.div 
              class="presentation-exchange-board"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, easing: 'ease-out' }}
            >
              <For each={exchangeEntries()}>
                {(entry: { from: 'unit' | 'ten' | 'hundred'; info: { remainder: number; carried: number; to: 'ten' | 'hundred' | 'thousand' } }) => (
                  <Motion.div 
                    class={`presentation-exchange-board__cell ${stage.highlight === entry.from ? 'is-highlighted' : ''}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2, easing: 'ease-out' }}
                  >
                    <div class="presentation-exchange-board__group">
                      <div class="presentation-exchange-label">Remaining:</div>
                      <BeadTokenStack count={entry.info.remainder} kind={entry.from} highlighted={stage.highlight === entry.from} />
                    </div>
                    <Show when={entry.info.carried > 0}>
                      <Motion.div 
                        class="presentation-exchange-board__group"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.5, easing: 'ease-out' }}
                      >
                        <div class="presentation-exchange-label">Exchanged:</div>
                        <BeadTokenStack count={entry.info.carried} kind={entry.info.to} />
                      </Motion.div>
                    </Show>
                  </Motion.div>
                )}
              </For>
            </Motion.div>
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
      <Card variant="soft" class="space-y-3 text-[color:var(--color-text-subtle)]">
        <p>No scripted presentation available.</p>
      </Card>
    );
  }

  return (
    <LessonCanvas
      data-variant="presentation"
      stageClass="lesson-segment lesson-segment--presentation"
      renderOverlay={<LessonInventoryOverlay bank={inventoryBank} tokens={inventoryTokens} />}
    >
      <Show when={(audioUnavailable() || !hasAudio()) && !audioLoading()}>
        <div class="mb-3 inline-flex items-center gap-2 rounded-md bg-[rgba(255,195,74,0.25)] px-3 py-2 text-sm font-medium text-[color:#8a5a00]">
          Narration audio is unavailable. Continue with the on-screen presentation.
        </div>
      </Show>
      {/* Hidden audio element for playback control */}
      <Show when={props.audioSrc}>
        <audio
          ref={(element) => {
            audioElement = element ?? undefined;
          }}
          src={props.audioSrc}
          preload="auto"
          style={{ display: 'none' }}
          onPlay={() => {
            const replay = hasPlayedAudio();
            if (!replay) {
              setHasPlayedAudio(true);
            }
            props.recordEvent?.({
              type: 'audio.play',
              lessonId: props.lessonId,
              segmentId: props.segment.id,
              replay,
            });
          }}
          onPause={() => {
            props.recordEvent?.({
              type: 'audio.pause',
              lessonId: props.lessonId,
              segmentId: props.segment.id,
            });
          }}
          onEnded={() => {
            props.recordEvent?.({
              type: 'audio.end',
              lessonId: props.lessonId,
              segmentId: props.segment.id,
            });
          }}
          onError={() => {
            setAudioUnavailable(true);
            if (audioElement) {
              audioElement.pause();
              audioElement.removeAttribute('src');
              audioElement.load();
            }
            console.warn(
              `Narration audio unavailable for segment "${props.segment.title}" (lesson ${props.lessonId}).`,
            );
            props.recordEvent?.({
              type: 'audio.error',
              lessonId: props.lessonId,
              segmentId: props.segment.id,
              message: 'Unable to load narration audio.',
            });
          }}
        >
          <Show when={props.captionSrc}>
            <track kind="captions" src={props.captionSrc} default />
          </Show>
        </audio>
      </Show>

      <div class="lesson-segment__canvas lesson-segment__canvas--presentation">
        <div style={{ display: 'grid', 'grid-template-columns': '1fr auto', 'grid-template-rows': 'auto 1fr', gap: '1rem', width: '100%', height: '100%', overflow: 'visible' }}>
          
          {/* Problem cards - TOP RIGHT */}
          <Show when={stage.multiplicandStack.length > 0 || stage.multiplierCard !== undefined}>
            <div style={{ 'grid-column': '2', 'grid-row': '1', 'justify-self': 'end', 'align-self': 'start' }}>
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
                  <div style={{ display: 'flex', 'flex-direction': 'column', gap: '0.25rem', 'align-items': 'flex-end', width: '100%' }}>
                    <div class="presentation-multiplier-minimal">
                      <span class="presentation-multiplier-symbol">×</span>
                      <NumberCard value={stage.multiplierCard ?? 0} size="md" />
                    </div>
                    <Show when={stage.multiplicandStack.length > 0}>
                      <div class="presentation-equation-divider" />
                    </Show>
                  </div>
                </Show>
              </div>
            </div>
          </Show>

          {/* Golden beads workspace - LEFT SIDE, spanning both rows */}
          <div style={{ 'grid-column': '1', 'grid-row': '1 / 3', display: 'flex', 'flex-direction': 'column', 'justify-content': 'flex-start', 'align-items': 'flex-start', gap: '1rem', 'padding-top': '0.5rem', overflow: 'visible' }}>
            {/* Minimal workspace - materials and workspace */}
            <div class="presentation-workspace-minimal" style={{ width: '100%', 'justify-content': 'flex-start' }}>
              <Show when={stage.activeMaterial === 'stamp-game'}>
                <StampGameWorkspaceVisual />
              </Show>
              <Show when={stage.activeMaterial === 'golden-beads'}>
                {renderGoldenBeadWorkspace()}
              </Show>
            </div>

            {/* Show final answer when available */}
            <Show when={finalProductValue() !== null}>
              <div class="presentation-answer" style={{ 'margin-top': 'auto' }}>
                <NumberCard value={finalProductValue() ?? 0} size="lg" />
              </div>
            </Show>
          </div>
        </div>
      </div>
    </LessonCanvas>
  );
};
