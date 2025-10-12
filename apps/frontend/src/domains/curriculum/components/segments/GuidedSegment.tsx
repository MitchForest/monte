import { For, Show, createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
import type { Accessor, JSX } from 'solid-js';
import { createStore } from 'solid-js/store';

import type {
  GuidedSegment as GuidedSegmentType,
  GuidedEvaluatorId,
  GuidedStep,
  TokenTypeDefinition,
  WorkspaceKind,
} from '@monte/types';
import type { GoldenBeadScenario, StampGameScenario } from '@monte/lesson-service';
import { Button, Card } from '../../../../components/ui';
import { LessonCanvas, useViewportObserver } from '../../canvas';
import type { DemoEventRecorder } from '../../analytics/events';
import {
  NumberCard,
  GoldenBeadUnit,
  GoldenBeadTen,
  GoldenBeadHundred,
  GoldenBeadThousand,
  StampTile,
  YellowRibbon,
} from '../materials';
import {
  LessonInventoryOverlay,
  useSegmentInventory,
  type InventoryDelta,
} from '../../inventory/context';

export interface GuidedSegmentProps {
  lessonId: string;
  segment: GuidedSegmentType;
  steps: (GuidedStep & { evaluatorId: GuidedEvaluatorId })[];
  scenario?: GoldenBeadScenario | StampGameScenario;
  onSegmentComplete: () => void;
  recordEvent?: DemoEventRecorder;
}

export interface GoldenBeadsGuidedState {
  kind: 'golden-beads';
  thousands: number;
  hundreds: number;
  tens: number;
  units: number;
  copies: number;
  unitRemainder: number;
  unitCarryToTens: number;
  tensRemainder: number;
  tensCarryToHundreds: number;
  hundredsRemainder: number;
  hundredsCarryToThousands: number;
  finalThousands: number;
  finalHundreds: number;
  finalTens: number;
  finalUnits: number;
  finalValue?: number;
}

export interface StampGameGuidedState {
  kind: 'stamp-game';
  hundreds: number;
  tens: number;
  units: number;
  columns: number;
  unitsAfterExchange: number;
  tensAfterExchange: number;
  hundredsAfterExchange: number;
  finalThousands: number;
  finalHundreds: number;
  finalTens: number;
  finalUnits: number;
  finalValue?: number;
}

export type GuidedWorkspaceSnapshot =
  | GoldenBeadsGuidedState
  | StampGameGuidedState
  | { kind: 'none' };

type TokenKind = 'thousand' | 'hundred' | 'ten' | 'unit' | 'copy' | 'digit';

type TokenWithQuantity = {
  definition: TokenTypeDefinition;
  quantity: number;
};

interface DragContext {
  source: 'supply' | 'zone';
  zoneId?: string;
  kind: TokenKind;
  digitValue?: number;
  tokenTypeId?: string;
  consumed?: boolean;
}

const evaluateGoldenBeads = (
  id: GuidedEvaluatorId,
  state: GoldenBeadsGuidedState,
  scenario?: GoldenBeadScenario,
): boolean => {
  if (!scenario) return false;
  switch (id) {
    case 'golden-beads-build-base':
      return (
        state.thousands === scenario.digits.thousands &&
        state.hundreds === scenario.digits.hundreds &&
        state.tens === scenario.digits.tens &&
        state.units === scenario.digits.units
      );
    case 'golden-beads-duplicate':
      return state.copies === scenario.multiplier;
    case 'golden-beads-exchange-units':
      return state.unitRemainder === scenario.unitRemainder && state.unitCarryToTens === scenario.unitCarry;
    case 'golden-beads-exchange-tens':
      return state.tensRemainder === scenario.tensRemainder && state.tensCarryToHundreds === scenario.tensCarry;
    case 'golden-beads-exchange-hundreds':
      return (
        state.hundredsRemainder === scenario.hundredsRemainder &&
        state.hundredsCarryToThousands === scenario.hundredsCarry
      );
    case 'golden-beads-stack-result':
      return state.finalValue === scenario.product;
    default:
      return false;
  }
};

const evaluateStampGame = (
  id: GuidedEvaluatorId,
  state: StampGameGuidedState,
  scenario?: StampGameScenario,
): boolean => {
  if (!scenario) return false;
  switch (id) {
    case 'stamp-game-build':
      return (
        state.hundreds === scenario.digits.hundreds &&
        state.tens === scenario.digits.tens &&
        state.units === scenario.digits.units
      );
    case 'stamp-game-repeat-columns':
      return state.columns === scenario.multiplier;
    case 'stamp-game-exchange':
      return (
        state.unitsAfterExchange === scenario.unitsRemainder &&
        state.tensAfterExchange === scenario.tensRemainder &&
        state.hundredsAfterExchange === scenario.hundredsRemainder
      );
    case 'stamp-game-read-result':
      return state.finalValue === scenario.product;
    default:
      return false;
  }
};

const evaluateStep = (
  id: GuidedEvaluatorId,
  state: GuidedWorkspaceSnapshot,
  scenario?: GoldenBeadScenario | StampGameScenario,
): boolean => {
  if (state.kind === 'golden-beads') {
    return evaluateGoldenBeads(id, state, scenario as GoldenBeadScenario | undefined);
  }
  if (state.kind === 'stamp-game') {
    return evaluateStampGame(id, state, scenario as StampGameScenario | undefined);
  }
  return false;
};

const GoldenBeadsWorkspace = (props: {
  onStateChange?: (snapshot: GoldenBeadsGuidedState) => void;
  scenario?: GoldenBeadScenario;
  currentStepEvaluator?: GuidedEvaluatorId;
  tokensByKind: Accessor<Map<TokenKind, TokenWithQuantity>>;
  inventoryActions: {
    consumeToken: (tokenTypeId: string, amount?: number) => boolean;
    replenishToken: (tokenTypeId: string, amount?: number) => void;
    recordDelta: (delta: InventoryDelta) => void;
  };
  reportInventoryFeedback: (message: string) => void;
  recordInventoryDelta: (tokenTypeId: string, delta: number, reason: 'consume' | 'replenish') => void;
}) => {
  const createDefaultLayout = () => ({
    base: {
      thousands: 0,
      hundreds: 0,
      tens: 0,
      units: 0,
    },
    copies: 0,
    exchanges: {
      unitRemainder: 0,
      tensCarry: 0,
      tensRemainder: 0,
      hundredsCarry: 0,
      hundredsRemainder: 0,
      thousandsCarry: 0,
    },
    finalDigits: {
      thousands: null as number | null,
      hundreds: null as number | null,
      tens: null as number | null,
      units: null as number | null,
    },
  });

  const [layout, setLayout] = createStore(createDefaultLayout());
  let dragContext: DragContext | null = null;
  const getTokensByKind = props.tokensByKind;
  const inventoryActions = props.inventoryActions;
  const reportInventoryFeedback = props.reportInventoryFeedback;
  const recordInventoryDelta = props.recordInventoryDelta;

  const scenarioSignature = createMemo(() => {
    const scenario = props.scenario;
    return scenario
      ? `${scenario.seed}-${scenario.multiplicand}-${scenario.multiplier}-${scenario.product}`
      : 'none';
  });

  createEffect(() => {
    void scenarioSignature();
    setLayout(createDefaultLayout());
  });

  const beadVisual = (kind: 'thousand' | 'hundred' | 'ten' | 'unit') => {
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

  const beadDescription = (kind: 'thousand' | 'hundred' | 'ten' | 'unit') => {
    switch (kind) {
      case 'thousand':
        return 'Thousand cube';
      case 'hundred':
        return 'Hundred square';
      case 'ten':
        return 'Ten bar';
      default:
        return 'Unit bead';
    }
  };

  const zoneAccepts: Record<string, TokenKind[]> = {
    'supply-thousand': ['thousand'],
    'supply-hundred': ['hundred'],
    'supply-ten': ['ten'],
    'supply-unit': ['unit'],
    'supply-copy': ['copy'],
    'supply-digit': ['digit'],
    'layout-thousand': ['thousand'],
    'layout-hundred': ['hundred'],
    'layout-ten': ['ten'],
    'layout-unit': ['unit'],
    'copies-zone': ['copy'],
    'units-remaining': ['unit'],
    'tens-carry': ['ten'],
    'tens-remaining': ['ten'],
    'hundreds-carry': ['hundred'],
    'hundreds-remaining': ['hundred'],
    'thousands-carry': ['thousand'],
    'final-digit-thousands': ['digit'],
    'final-digit-hundreds': ['digit'],
    'final-digit-tens': ['digit'],
    'final-digit-units': ['digit'],
  };

  const deriveState = (): GoldenBeadsGuidedState => {
    const finalThousands = layout.finalDigits.thousands ?? 0;
    const finalHundreds = layout.finalDigits.hundreds ?? 0;
    const finalTens = layout.finalDigits.tens ?? 0;
    const finalUnits = layout.finalDigits.units ?? 0;
    const finalValue = finalThousands * 1000 + finalHundreds * 100 + finalTens * 10 + finalUnits;

    return {
      kind: 'golden-beads',
      thousands: layout.base.thousands,
      hundreds: layout.base.hundreds,
      tens: layout.base.tens,
      units: layout.base.units,
      copies: layout.copies,
      unitRemainder: layout.exchanges.unitRemainder,
      unitCarryToTens: layout.exchanges.tensCarry,
      tensRemainder: layout.exchanges.tensRemainder,
      tensCarryToHundreds: layout.exchanges.hundredsCarry,
      hundredsRemainder: layout.exchanges.hundredsRemainder,
      hundredsCarryToThousands: layout.exchanges.thousandsCarry,
      finalThousands,
      finalHundreds,
      finalTens,
      finalUnits,
      finalValue,
    } satisfies GoldenBeadsGuidedState;
  };

  createEffect(() => {
    props.onStateChange?.(deriveState());
  });

  const resetDigitZone = (zoneId: string) => {
    switch (zoneId) {
      case 'final-digit-thousands':
        setLayout('finalDigits', 'thousands', null);
        break;
      case 'final-digit-hundreds':
        setLayout('finalDigits', 'hundreds', null);
        break;
      case 'final-digit-tens':
        setLayout('finalDigits', 'tens', null);
        break;
      case 'final-digit-units':
        setLayout('finalDigits', 'units', null);
        break;
    }
  };

  const setDigitZone = (zoneId: string, value: number) => {
    switch (zoneId) {
      case 'final-digit-thousands':
        setLayout('finalDigits', 'thousands', value);
        break;
      case 'final-digit-hundreds':
        setLayout('finalDigits', 'hundreds', value);
        break;
      case 'final-digit-tens':
        setLayout('finalDigits', 'tens', value);
        break;
      case 'final-digit-units':
        setLayout('finalDigits', 'units', value);
        break;
    }
  };

  const decrementZone = (zoneId: string, _kind: TokenKind) => {
    switch (zoneId) {
      case 'layout-thousand':
        setLayout('base', 'thousands', (value) => Math.max(0, value - 1));
        break;
      case 'layout-hundred':
        setLayout('base', 'hundreds', (value) => Math.max(0, value - 1));
        break;
      case 'layout-ten':
        setLayout('base', 'tens', (value) => Math.max(0, value - 1));
        break;
      case 'layout-unit':
        setLayout('base', 'units', (value) => Math.max(0, value - 1));
        break;
      case 'copies-zone':
        setLayout('copies', (value) => Math.max(0, value - 1));
        break;
      case 'units-remaining':
        setLayout('exchanges', 'unitRemainder', (value) => Math.max(0, value - 1));
        break;
      case 'tens-carry':
        setLayout('exchanges', 'tensCarry', (value) => Math.max(0, value - 1));
        break;
      case 'tens-remaining':
        setLayout('exchanges', 'tensRemainder', (value) => Math.max(0, value - 1));
        break;
      case 'hundreds-carry':
        setLayout('exchanges', 'hundredsCarry', (value) => Math.max(0, value - 1));
        break;
      case 'hundreds-remaining':
        setLayout('exchanges', 'hundredsRemainder', (value) => Math.max(0, value - 1));
        break;
      case 'thousands-carry':
        setLayout('exchanges', 'thousandsCarry', (value) => Math.max(0, value - 1));
        break;
      case 'final-digit-thousands':
      case 'final-digit-hundreds':
      case 'final-digit-tens':
      case 'final-digit-units':
        resetDigitZone(zoneId);
        break;
      default:
        if (_kind === 'digit') {
          resetDigitZone(zoneId);
        }
        break;
    }
  };

  const incrementZone = (zoneId: string, _kind: TokenKind, digitValue?: number) => {
    switch (zoneId) {
      case 'layout-thousand':
        setLayout('base', 'thousands', (value) => Math.min(12, value + 1));
        break;
      case 'layout-hundred':
        setLayout('base', 'hundreds', (value) => Math.min(12, value + 1));
        break;
      case 'layout-ten':
        setLayout('base', 'tens', (value) => Math.min(12, value + 1));
        break;
      case 'layout-unit':
        setLayout('base', 'units', (value) => Math.min(12, value + 1));
        break;
      case 'copies-zone':
        setLayout('copies', (value) => Math.min(8, value + 1));
        break;
      case 'units-remaining':
        setLayout('exchanges', 'unitRemainder', (value) => Math.min(12, value + 1));
        break;
      case 'tens-carry':
        setLayout('exchanges', 'tensCarry', (value) => Math.min(12, value + 1));
        break;
      case 'tens-remaining':
        setLayout('exchanges', 'tensRemainder', (value) => Math.min(12, value + 1));
        break;
      case 'hundreds-carry':
        setLayout('exchanges', 'hundredsCarry', (value) => Math.min(12, value + 1));
        break;
      case 'hundreds-remaining':
        setLayout('exchanges', 'hundredsRemainder', (value) => Math.min(12, value + 1));
        break;
      case 'thousands-carry':
        setLayout('exchanges', 'thousandsCarry', (value) => Math.min(12, value + 1));
        break;
      case 'final-digit-thousands':
      case 'final-digit-hundreds':
      case 'final-digit-tens':
      case 'final-digit-units':
        if (digitValue !== undefined) {
          setDigitZone(zoneId, digitValue);
        }
        break;
    }
  };

  const handleDrop = (zoneId: string) => {
    if (!dragContext) return;
    const accepts = zoneAccepts[zoneId] ?? [];
    if (accepts.length && !accepts.includes(dragContext.kind)) {
      if (dragContext.consumed && dragContext.tokenTypeId) {
        inventoryActions.replenishToken(dragContext.tokenTypeId);
      }
      dragContext = null;
      return;
    }

    if (zoneId.startsWith('supply-')) {
      if (dragContext.source === 'zone' && dragContext.zoneId) {
        decrementZone(dragContext.zoneId, dragContext.kind);
      }
      if (dragContext.tokenTypeId) {
        inventoryActions.replenishToken(dragContext.tokenTypeId);
      }
      dragContext = null;
      return;
    }

    if (dragContext.source === 'zone' && dragContext.zoneId) {
      decrementZone(dragContext.zoneId, dragContext.kind);
    }

    incrementZone(zoneId, dragContext.kind, dragContext.digitValue);
    dragContext = null;
  };

  const handleDragStart = (source: 'supply' | 'zone', kind: TokenKind, zoneId?: string, digitValue?: number) =>
    (event: DragEvent) => {
      const tokenTypeId = getTokensByKind().get(kind)?.definition.id;
      let consumed = false;
      if (source === 'supply' && tokenTypeId) {
        consumed = inventoryActions.consumeToken(tokenTypeId);
        if (!consumed) {
          event.preventDefault();
          reportInventoryFeedback(
            `No more ${getTokensByKind().get(kind)?.definition.label ?? kind} available.`,
          );
          return;
        }
        recordInventoryDelta(tokenTypeId, -1, 'consume');
      }
      dragContext = { source, kind, zoneId, digitValue, tokenTypeId, consumed };
      event.dataTransfer?.setData('text/plain', `${kind}`);
      event.dataTransfer?.setDragImage(new Image(), 0, 0);
    };

  const handleDragEnd = () => {
    if (dragContext?.consumed && dragContext.tokenTypeId) {
      inventoryActions.replenishToken(dragContext.tokenTypeId);
      recordInventoryDelta(dragContext.tokenTypeId, 1, 'replenish');
    }
    dragContext = null;
  };

  const renderBeadTokens = (count: number, kind: 'thousand' | 'hundred' | 'ten' | 'unit', zoneId: string) => (
    <For each={Array.from({ length: count })}>
      {(_, index) => (
        <div
          class="manipulative-token"
          draggable
          onDragStart={handleDragStart('zone', kind, zoneId)}
          onDragEnd={handleDragEnd}
        >
          {beadVisual(kind)}
          <span class="sr-only">{beadDescription(kind)} {index() + 1}</span>
        </div>
      )}
    </For>
  );

  const renderDigitToken = (value: number | null, zoneId: string) => {
    if (value === null) {
      return <span class="digit-slot-placeholder">Drop digit</span>;
    }
    return (
      <div
        class="manipulative-token"
        draggable
        onDragStart={handleDragStart('zone', 'digit', zoneId, value)}
        onDragEnd={handleDragEnd}
      >
        <NumberCard value={value} size="xs" />
        <span class="sr-only">Digit {value}</span>
      </div>
    );
  };

  const DigitSupply = () => (
    <div class="supply-group">
      <span class="supply-title">Digits</span>
      <div class="supply-grid">
        <For each={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}>
          {(value) => (
            <div
              class="manipulative-token"
              draggable
              onDragStart={handleDragStart('supply', 'digit', undefined, value)}
              onDragEnd={handleDragEnd}
            >
              <NumberCard value={value} size="xs" />
              <span class="sr-only">Digit {value}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );

  const renderCopyTokens = () => (
    <For each={Array.from({ length: layout.copies })}>
      {(_, index) => (
        <div
          class="manipulative-token"
          draggable
          onDragStart={handleDragStart('zone', 'copy', 'copies-zone')}
          onDragEnd={handleDragEnd}
        >
          <YellowRibbon length="short" />
          <span class="sr-only">Ribbon placement {index() + 1}</span>
        </div>
      )}
    </For>
  );

  const SupplyToken = (props: {
    kind: TokenKind;
    label: string;
    children: JSX.Element;
    digitValue?: number;
  }) => {
    const quantity = createMemo(() => getTokensByKind().get(props.kind)?.quantity ?? null);
    const depleted = () => {
      const value = quantity();
      return value !== null && value <= 0;
    };

    const handleStart = (event: DragEvent) => {
      if (depleted()) {
        event.preventDefault();
        reportInventoryFeedback(`No more ${props.label.toLowerCase()} available.`);
        return;
      }
      handleDragStart('supply', props.kind, undefined, props.digitValue)(event);
    };

    return (
      <div
        class="manipulative-token"
        classList={{ 'manipulative-token--depleted': depleted() }}
        draggable={!depleted()}
        data-depleted={depleted() ? 'true' : 'false'}
        onDragStart={handleStart}
        onDragEnd={handleDragEnd}
      >
        {props.children}
        <span class="sr-only">{props.label}</span>
        <Show when={quantity() !== null}>
          {(value) => <span class="supply-quantity" aria-hidden>× {value()}</span>}
        </Show>
      </div>
    );
  };

  const Zone = (props: {
    zoneId: string;
    label: string;
    children: () => JSX.Element;
    hint?: string;
  }) => {
    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
    };

    return (
      <div
        class="drop-zone"
        data-zone={props.zoneId}
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(props.zoneId)}
      >
        <div class="drop-zone-header">
          <span class="drop-zone-label">{props.label}</span>
          <Show when={props.hint}>
            {(hint) => <span class="drop-zone-hint">Target: {hint()}</span>}
          </Show>
        </div>
        <div class="drop-zone-body">{props.children()}</div>
      </div>
    );
  };

  // Progressive disclosure: show zones based on current step
  const showSupply = () => props.currentStepEvaluator === 'golden-beads-build-base';
  const showBuildZones = () => props.currentStepEvaluator === 'golden-beads-build-base';
  const showRibbonSupply = () => props.currentStepEvaluator === 'golden-beads-duplicate';
  const showCopiesZone = () => props.currentStepEvaluator === 'golden-beads-duplicate';
  const showExchangeUnits = () => props.currentStepEvaluator === 'golden-beads-exchange-units';
  const showExchangeTens = () => props.currentStepEvaluator === 'golden-beads-exchange-tens';
  const showExchangeHundreds = () => props.currentStepEvaluator === 'golden-beads-exchange-hundreds';
  const showFinalDigits = () => props.currentStepEvaluator === 'golden-beads-stack-result';
  const showDigitSupply = () => showFinalDigits();

  return (
    <div class="guided-workspace-minimal">
      {/* Supply section - only show for relevant steps */}
      <Show when={showSupply() || showRibbonSupply() || showDigitSupply()}>
        <div class="guided-supply-row">
          <Show when={showSupply()}>
            <div class="supply-group">
              <div class="supply-grid">
                <SupplyToken kind="thousand" label="Thousand cube">
                  <GoldenBeadThousand />
                </SupplyToken>
                <SupplyToken kind="hundred" label="Hundred square">
                  <GoldenBeadHundred />
                </SupplyToken>
                <SupplyToken kind="ten" label="Ten bar">
                  <GoldenBeadTen />
                </SupplyToken>
                <SupplyToken kind="unit" label="Unit bead">
                  <GoldenBeadUnit />
                </SupplyToken>
              </div>
            </div>
          </Show>
          <Show when={showRibbonSupply()}>
            <div class="supply-group">
              <SupplyToken kind="copy" label="Yellow ribbon">
                <YellowRibbon length="short" />
              </SupplyToken>
            </div>
          </Show>
          <Show when={showDigitSupply()}>
            <DigitSupply />
          </Show>
        </div>
      </Show>

      {/* Step 1: Build the multiplicand - ONLY show these 4 zones */}
      <Show when={showBuildZones()}>
        <div class="guided-zone-grid">
          <Zone zoneId="layout-thousand" label="Thousands" hint={props.scenario?.digits.thousands?.toString()}>
            {() => renderBeadTokens(layout.base.thousands, 'thousand', 'layout-thousand')}
          </Zone>
          <Zone zoneId="layout-hundred" label="Hundreds" hint={props.scenario?.digits.hundreds?.toString()}>
            {() => renderBeadTokens(layout.base.hundreds, 'hundred', 'layout-hundred')}
          </Zone>
          <Zone zoneId="layout-ten" label="Tens" hint={props.scenario?.digits.tens?.toString()}>
            {() => renderBeadTokens(layout.base.tens, 'ten', 'layout-ten')}
          </Zone>
          <Zone zoneId="layout-unit" label="Units" hint={props.scenario?.digits.units?.toString()}>
            {() => renderBeadTokens(layout.base.units, 'unit', 'layout-unit')}
          </Zone>
        </div>
      </Show>

      {/* Step 2: Multiplier copies */}
      <Show when={showCopiesZone()}>
        <div class="guided-zone-grid">
          <Zone zoneId="copies-zone" label="Create copies" hint={props.scenario?.multiplier.toString()}>
            {renderCopyTokens}
          </Zone>
        </div>
      </Show>

      {/* Step 3: Exchange units */}
      <Show when={showExchangeUnits()}>
        <div class="guided-zone-grid">
          <Zone zoneId="units-remaining" label="Units left" hint={props.scenario?.unitRemainder?.toString()}>
            {() => renderBeadTokens(layout.exchanges.unitRemainder, 'unit', 'units-remaining')}
          </Zone>
          <Zone zoneId="tens-carry" label="Tens made" hint={props.scenario?.unitCarry?.toString()}>
            {() => renderBeadTokens(layout.exchanges.tensCarry, 'ten', 'tens-carry')}
          </Zone>
        </div>
      </Show>

      {/* Step 4: Exchange tens */}
      <Show when={showExchangeTens()}>
        <div class="guided-zone-grid">
          <Zone zoneId="tens-remaining" label="Tens left" hint={props.scenario?.tensRemainder?.toString()}>
            {() => renderBeadTokens(layout.exchanges.tensRemainder, 'ten', 'tens-remaining')}
          </Zone>
          <Zone zoneId="hundreds-carry" label="Hundreds made" hint={props.scenario?.tensCarry?.toString()}>
            {() => renderBeadTokens(layout.exchanges.hundredsCarry, 'hundred', 'hundreds-carry')}
          </Zone>
        </div>
      </Show>

      {/* Step 5: Exchange hundreds */}
      <Show when={showExchangeHundreds()}>
        <div class="guided-zone-grid">
          <Zone zoneId="hundreds-remaining" label="Hundreds left" hint={props.scenario?.hundredsRemainder?.toString()}>
            {() => renderBeadTokens(layout.exchanges.hundredsRemainder, 'hundred', 'hundreds-remaining')}
          </Zone>
          <Zone zoneId="thousands-carry" label="Thousands made" hint={props.scenario?.hundredsCarry?.toString()}>
            {() => renderBeadTokens(layout.exchanges.thousandsCarry, 'thousand', 'thousands-carry')}
          </Zone>
        </div>
      </Show>

      {/* Step 6: Final answer */}
      <Show when={showFinalDigits()}>
        <div class="guided-zone-grid">
          <Zone
            zoneId="final-digit-thousands"
            label="Thousands"
            hint={props.scenario ? `${Math.floor(props.scenario.product / 1000) % 10}` : undefined}
          >
            {() => renderDigitToken(layout.finalDigits.thousands, 'final-digit-thousands')}
          </Zone>
          <Zone
            zoneId="final-digit-hundreds"
            label="Hundreds"
            hint={props.scenario ? `${Math.floor(props.scenario.product / 100) % 10}` : undefined}
          >
            {() => renderDigitToken(layout.finalDigits.hundreds, 'final-digit-hundreds')}
          </Zone>
          <Zone
            zoneId="final-digit-tens"
            label="Tens"
            hint={props.scenario ? `${Math.floor(props.scenario.product / 10) % 10}` : undefined}
          >
            {() => renderDigitToken(layout.finalDigits.tens, 'final-digit-tens')}
          </Zone>
          <Zone
            zoneId="final-digit-units"
            label="Units"
            hint={props.scenario ? `${props.scenario.product % 10}` : undefined}
          >
            {() => renderDigitToken(layout.finalDigits.units, 'final-digit-units')}
          </Zone>
        </div>
      </Show>
    </div>
  );
};

const StampGameWorkspace = (props: {
  onStateChange?: (snapshot: StampGameGuidedState) => void;
  scenario?: StampGameScenario;
  tokensByKind: Accessor<Map<TokenKind, TokenWithQuantity>>;
  inventoryActions: {
    consumeToken: (tokenTypeId: string, amount?: number) => boolean;
    replenishToken: (tokenTypeId: string, amount?: number) => void;
    recordDelta: (delta: InventoryDelta) => void;
  };
  reportInventoryFeedback: (message: string) => void;
  recordInventoryDelta: (tokenTypeId: string, delta: number, reason: 'consume' | 'replenish') => void;
}) => {
  const createDefaultLayout = () => ({
    base: {
      hundreds: 0,
      tens: 0,
      units: 0,
    },
    columns: 0,
    exchanges: {
      units: 0,
      tens: 0,
      hundreds: 0,
    },
    finalDigits: {
      thousands: null as number | null,
      hundreds: null as number | null,
      tens: null as number | null,
      units: null as number | null,
    },
  });

  const [layout, setLayout] = createStore(createDefaultLayout());
  let dragContext: DragContext | null = null;
  const getTokensByKind = props.tokensByKind;
  const inventoryActions = props.inventoryActions;
  const reportInventoryFeedback = props.reportInventoryFeedback;
  const recordInventoryDelta = props.recordInventoryDelta;

  const multiplicandHint = () =>
    props.scenario ? `${props.scenario.multiplicand.toLocaleString()} × ${props.scenario.multiplier}` : undefined;

  const scenarioSignature = createMemo(() => {
    const scenario = props.scenario;
    return scenario
      ? `${scenario.seed}-${scenario.multiplicand}-${scenario.multiplier}-${scenario.product}`
      : 'none';
  });

  createEffect(() => {
    void scenarioSignature();
    setLayout(createDefaultLayout());
  });

  const stampVisual = (kind: 'hundred' | 'ten' | 'unit') => {
    const value = kind === 'hundred' ? 100 : kind === 'ten' ? 10 : 1;
    return <StampTile value={value} />;
  };

  const stampDescription = (kind: 'hundred' | 'ten' | 'unit') => {
    switch (kind) {
      case 'hundred':
        return 'Hundred stamp';
      case 'ten':
        return 'Ten stamp';
      default:
        return 'Unit stamp';
    }
  };

  const zoneAccepts: Record<string, TokenKind[]> = {
    'supply-hundred': ['hundred'],
    'supply-ten': ['ten'],
    'supply-unit': ['unit'],
    'supply-copy': ['copy'],
    'supply-digit': ['digit'],
    'layout-hundred': ['hundred'],
    'layout-ten': ['ten'],
    'layout-unit': ['unit'],
    'columns-zone': ['copy'],
    'units-after': ['unit'],
    'tens-after': ['ten'],
    'hundreds-after': ['hundred'],
    'final-digit-thousands': ['digit'],
    'final-digit-hundreds': ['digit'],
    'final-digit-tens': ['digit'],
    'final-digit-units': ['digit'],
  };

  const deriveState = (): StampGameGuidedState => {
    const finalThousands = layout.finalDigits.thousands ?? 0;
    const finalHundreds = layout.finalDigits.hundreds ?? 0;
    const finalTens = layout.finalDigits.tens ?? 0;
    const finalUnits = layout.finalDigits.units ?? 0;
    const finalValue = finalThousands * 1000 + finalHundreds * 100 + finalTens * 10 + finalUnits;

    return {
      kind: 'stamp-game',
      hundreds: layout.base.hundreds,
      tens: layout.base.tens,
      units: layout.base.units,
      columns: layout.columns,
      unitsAfterExchange: layout.exchanges.units,
      tensAfterExchange: layout.exchanges.tens,
      hundredsAfterExchange: layout.exchanges.hundreds,
      finalThousands,
      finalHundreds,
      finalTens,
      finalUnits,
      finalValue,
    } satisfies StampGameGuidedState;
  };

  createEffect(() => {
    props.onStateChange?.(deriveState());
  });

  const resetDigitZone = (zoneId: string) => {
    switch (zoneId) {
      case 'final-digit-thousands':
        setLayout('finalDigits', 'thousands', null);
        break;
      case 'final-digit-hundreds':
        setLayout('finalDigits', 'hundreds', null);
        break;
      case 'final-digit-tens':
        setLayout('finalDigits', 'tens', null);
        break;
      case 'final-digit-units':
        setLayout('finalDigits', 'units', null);
        break;
    }
  };

  const setDigitZone = (zoneId: string, value: number) => {
    switch (zoneId) {
      case 'final-digit-thousands':
        setLayout('finalDigits', 'thousands', value);
        break;
      case 'final-digit-hundreds':
        setLayout('finalDigits', 'hundreds', value);
        break;
      case 'final-digit-tens':
        setLayout('finalDigits', 'tens', value);
        break;
      case 'final-digit-units':
        setLayout('finalDigits', 'units', value);
        break;
    }
  };

  const decrementZone = (zoneId: string, _kind: TokenKind) => {
    switch (zoneId) {
      case 'layout-hundred':
        setLayout('base', 'hundreds', (value) => Math.max(0, value - 1));
        break;
      case 'layout-ten':
        setLayout('base', 'tens', (value) => Math.max(0, value - 1));
        break;
      case 'layout-unit':
        setLayout('base', 'units', (value) => Math.max(0, value - 1));
        break;
      case 'columns-zone':
        setLayout('columns', (value) => Math.max(0, value - 1));
        break;
      case 'units-after':
        setLayout('exchanges', 'units', (value) => Math.max(0, value - 1));
        break;
      case 'tens-after':
        setLayout('exchanges', 'tens', (value) => Math.max(0, value - 1));
        break;
      case 'hundreds-after':
        setLayout('exchanges', 'hundreds', (value) => Math.max(0, value - 1));
        break;
      case 'final-digit-thousands':
      case 'final-digit-hundreds':
      case 'final-digit-tens':
      case 'final-digit-units':
        resetDigitZone(zoneId);
        break;
    }
  };

  const incrementZone = (zoneId: string, _kind: TokenKind, digitValue?: number) => {
    switch (zoneId) {
      case 'layout-hundred':
        setLayout('base', 'hundreds', (value) => Math.min(12, value + 1));
        break;
      case 'layout-ten':
        setLayout('base', 'tens', (value) => Math.min(12, value + 1));
        break;
      case 'layout-unit':
        setLayout('base', 'units', (value) => Math.min(12, value + 1));
        break;
      case 'columns-zone':
        setLayout('columns', (value) => Math.min(8, value + 1));
        break;
      case 'units-after':
        setLayout('exchanges', 'units', (value) => Math.min(12, value + 1));
        break;
      case 'tens-after':
        setLayout('exchanges', 'tens', (value) => Math.min(12, value + 1));
        break;
      case 'hundreds-after':
        setLayout('exchanges', 'hundreds', (value) => Math.min(12, value + 1));
        break;
      case 'final-digit-thousands':
      case 'final-digit-hundreds':
      case 'final-digit-tens':
      case 'final-digit-units':
        if (digitValue !== undefined) {
          setDigitZone(zoneId, digitValue);
        }
        break;
    }
  };

  const handleDrop = (zoneId: string) => {
    if (!dragContext) return;
    const accepts = zoneAccepts[zoneId] ?? [];
    if (accepts.length && !accepts.includes(dragContext.kind)) {
      if (dragContext.consumed && dragContext.tokenTypeId) {
        inventoryActions.replenishToken(dragContext.tokenTypeId);
        recordInventoryDelta(dragContext.tokenTypeId, 1, 'replenish');
      }
      dragContext = null;
      return;
    }

    if (zoneId.startsWith('supply-')) {
      if (dragContext.source === 'zone' && dragContext.zoneId) {
        decrementZone(dragContext.zoneId, dragContext.kind);
      }
      if (dragContext.tokenTypeId) {
        inventoryActions.replenishToken(dragContext.tokenTypeId);
        recordInventoryDelta(dragContext.tokenTypeId, 1, 'replenish');
      }
      dragContext = null;
      return;
    }

    if (dragContext.source === 'zone' && dragContext.zoneId) {
      decrementZone(dragContext.zoneId, dragContext.kind);
    }

    incrementZone(zoneId, dragContext.kind, dragContext.digitValue);
    dragContext = null;
  };

  const handleDragStart = (source: 'supply' | 'zone', kind: TokenKind, zoneId?: string, digitValue?: number) =>
    (event: DragEvent) => {
      const tokenTypeId = getTokensByKind().get(kind)?.definition.id;
      let consumed = false;
      if (source === 'supply' && tokenTypeId) {
        consumed = inventoryActions.consumeToken(tokenTypeId);
        if (!consumed) {
          event.preventDefault();
          reportInventoryFeedback(`No more ${getTokensByKind().get(kind)?.definition.label ?? kind} available.`);
          return;
        }
        recordInventoryDelta(tokenTypeId, -1, 'consume');
      }
      dragContext = { source, kind, zoneId, digitValue, tokenTypeId, consumed };
      event.dataTransfer?.setData('text/plain', `${kind}`);
      event.dataTransfer?.setDragImage(new Image(), 0, 0);
    };

  const handleDragEnd = () => {
    if (dragContext?.consumed && dragContext.tokenTypeId) {
      inventoryActions.replenishToken(dragContext.tokenTypeId);
      recordInventoryDelta(dragContext.tokenTypeId, 1, 'replenish');
    }
    dragContext = null;
  };

  const renderBeadTokens = (count: number, kind: 'hundred' | 'ten' | 'unit', zoneId: string) => (
    <For each={Array.from({ length: count })}>
      {(_, index) => (
        <div
          class="manipulative-token"
          draggable
          onDragStart={handleDragStart('zone', kind, zoneId)}
          onDragEnd={handleDragEnd}
        >
          {stampVisual(kind)}
          <span class="sr-only">{stampDescription(kind)} {index() + 1}</span>
        </div>
      )}
    </For>
  );

  const renderDigitToken = (value: number | null, zoneId: string) => {
    if (value === null) {
      return <span class="digit-slot-placeholder">Drop digit</span>;
    }
    return (
      <div
        class="manipulative-token"
        draggable
        onDragStart={handleDragStart('zone', 'digit', zoneId, value)}
        onDragEnd={handleDragEnd}
      >
        <NumberCard value={value} size="xs" />
        <span class="sr-only">Digit {value}</span>
      </div>
    );
  };

  const DigitSupply = () => (
    <div class="supply-group">
      <span class="supply-title">Digits</span>
      <div class="supply-grid">
        <For each={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}>
          {(value) => (
            <div
              class="manipulative-token"
              draggable
              onDragStart={handleDragStart('supply', 'digit', undefined, value)}
              onDragEnd={handleDragEnd}
            >
              <NumberCard value={value} size="xs" />
              <span class="sr-only">Digit {value}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );

  const renderCopyTokens = () => (
    <For each={Array.from({ length: layout.columns })}>
      {(_, index) => (
        <div
          class="manipulative-token"
          draggable
          onDragStart={handleDragStart('zone', 'copy', 'columns-zone')}
          onDragEnd={handleDragEnd}
        >
          <YellowRibbon length="short" />
          <span class="sr-only">Column marker {index() + 1}</span>
        </div>
      )}
    </For>
  );

  const SupplyToken = (props: {
    kind: TokenKind;
    label: string;
    children: JSX.Element;
    digitValue?: number;
  }) => {
    const quantity = createMemo(() => getTokensByKind().get(props.kind)?.quantity ?? null);
    const depleted = () => {
      const value = quantity();
      return value !== null && value <= 0;
    };

    const handleStart = (event: DragEvent) => {
      if (depleted()) {
        event.preventDefault();
        reportInventoryFeedback(`No more ${props.label.toLowerCase()} available.`);
        return;
      }
      handleDragStart('supply', props.kind, undefined, props.digitValue)(event);
    };

    return (
      <div
        class="manipulative-token"
        classList={{ 'manipulative-token--depleted': depleted() }}
        draggable={!depleted()}
        data-depleted={depleted() ? 'true' : 'false'}
        onDragStart={handleStart}
        onDragEnd={handleDragEnd}
      >
        {props.children}
        <span class="sr-only">{props.label}</span>
        <Show when={quantity() !== null}>
          {(value) => <span class="supply-quantity" aria-hidden>× {value()}</span>}
        </Show>
      </div>
    );
  };

  const Zone = (props: {
    zoneId: string;
    label: string;
    children: () => JSX.Element;
    hint?: string;
  }) => {
    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
    };

    return (
      <div class="drop-zone" data-zone={props.zoneId} onDragOver={handleDragOver} onDrop={() => handleDrop(props.zoneId)}>
        <div class="drop-zone-header">
          <span class="drop-zone-label">{props.label}</span>
          <Show when={props.hint}>
            {(hint) => <span class="drop-zone-hint">Target: {hint()}</span>}
          </Show>
        </div>
        <div class="drop-zone-body">{props.children()}</div>
      </div>
    );
  };

  return (
    <Card variant="soft" class="flex flex-col gap-5 p-4 sm:p-5 text-xs text-[color:var(--color-text)]">
      <div class="grid gap-3 md:grid-cols-3">
        <div class="supply-group">
          <span class="supply-title">Stamp supply</span>
          <div class="supply-grid">
            <SupplyToken kind="hundred" label="Hundred stamp">
              <StampTile value={100} />
            </SupplyToken>
            <SupplyToken kind="ten" label="Ten stamp">
              <StampTile value={10} />
            </SupplyToken>
            <SupplyToken kind="unit" label="Unit stamp">
              <StampTile value={1} />
            </SupplyToken>
          </div>
        </div>
        <div class="supply-group">
          <span class="supply-title">Columns</span>
          <SupplyToken kind="copy" label="Column marker">
            <YellowRibbon length="short" />
          </SupplyToken>
        </div>
        <DigitSupply />
      </div>

      <div class="space-y-3">
        <p class="text-sm font-semibold text-[color:var(--color-heading)]">Build base column</p>
        <Show when={multiplicandHint()}>
          {(hint) => <p class="text-xs text-[color:var(--color-text-subtle)]">Target: {hint()}</p>}
        </Show>
        <div class="grid gap-3 sm:grid-cols-3">
          <Zone zoneId="layout-hundred" label="Hundreds" hint={props.scenario?.digits.hundreds?.toString()}>
            {() => renderBeadTokens(layout.base.hundreds, 'hundred', 'layout-hundred')}
          </Zone>
          <Zone zoneId="layout-ten" label="Tens" hint={props.scenario?.digits.tens?.toString()}>
            {() => renderBeadTokens(layout.base.tens, 'ten', 'layout-ten')}
          </Zone>
          <Zone zoneId="layout-unit" label="Units" hint={props.scenario?.digits.units?.toString()}>
            {() => renderBeadTokens(layout.base.units, 'unit', 'layout-unit')}
          </Zone>
        </div>
      </div>

      <div class="space-y-3">
        <p class="text-sm font-semibold text-[color:var(--color-heading)]">Repeated columns</p>
        <Zone zoneId="columns-zone" label="Columns created" hint={props.scenario?.multiplier.toString()}>
          {renderCopyTokens}
        </Zone>
      </div>

      <div class="space-y-3">
        <p class="text-sm font-semibold text-[color:var(--color-heading)]">After exchanges</p>
        <div class="grid gap-3 sm:grid-cols-3">
          <Zone zoneId="units-after" label="Units remaining" hint={props.scenario?.unitsRemainder?.toString()}>
            {() => renderBeadTokens(layout.exchanges.units, 'unit', 'units-after')}
          </Zone>
          <Zone zoneId="tens-after" label="Tens remaining" hint={props.scenario?.tensRemainder?.toString()}>
            {() => renderBeadTokens(layout.exchanges.tens, 'ten', 'tens-after')}
          </Zone>
          <Zone zoneId="hundreds-after" label="Hundreds remaining" hint={props.scenario?.hundredsRemainder?.toString()}>
            {() => renderBeadTokens(layout.exchanges.hundreds, 'hundred', 'hundreds-after')}
          </Zone>
        </div>
      </div>

      <div class="space-y-3">
        <p class="text-sm font-semibold text-[color:var(--color-heading)]">Final product digits</p>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Zone
            zoneId="final-digit-thousands"
            label="Thousands place"
            hint={props.scenario ? `${Math.floor(props.scenario.product / 1000) % 10}` : undefined}
          >
            {() => renderDigitToken(layout.finalDigits.thousands, 'final-digit-thousands')}
          </Zone>
          <Zone
            zoneId="final-digit-hundreds"
            label="Hundreds place"
            hint={props.scenario ? `${Math.floor(props.scenario.product / 100) % 10}` : undefined}
          >
            {() => renderDigitToken(layout.finalDigits.hundreds, 'final-digit-hundreds')}
          </Zone>
          <Zone
            zoneId="final-digit-tens"
            label="Tens place"
            hint={props.scenario ? `${Math.floor(props.scenario.product / 10) % 10}` : undefined}
          >
            {() => renderDigitToken(layout.finalDigits.tens, 'final-digit-tens')}
          </Zone>
          <Zone zoneId="final-digit-units" label="Units place" hint={props.scenario ? `${props.scenario.product % 10}` : undefined}>
            {() => renderDigitToken(layout.finalDigits.units, 'final-digit-units')}
          </Zone>
        </div>
        <div class="mt-1 text-sm text-[color:var(--color-text-subtle)]">
          Current reading:{' '}
          <span class="font-semibold text-[color:var(--color-heading)]">
            {deriveState().finalValue?.toLocaleString() ?? '—'}
          </span>
          <Show when={props.scenario}>
            {(sc) => <span class="ml-2">Target: {sc().product.toLocaleString()}</span>}
          </Show>
        </div>
      </div>
    </Card>
  );
};

export const GuidedSegment = (props: GuidedSegmentProps) => {
  const steps = () => props.steps;
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [feedback, setFeedback] = createSignal<string | null>(null);
  const [workspaceState, setWorkspaceState] = createSignal<GuidedWorkspaceSnapshot>({ kind: 'none' });
  const [attempts, setAttempts] = createStore<Record<string, number>>({});
  const segmentInventory = useSegmentInventory({
    id: props.segment.id,
    materialBankId: props.segment.materialBankId,
  });
  const inventoryBank = segmentInventory.bank;
  const inventoryTokens = segmentInventory.tokenTypes;
  const workspace = createMemo<WorkspaceKind | undefined>(() => segmentInventory.workspace() ?? props.segment.workspace);
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
    const bank = inventoryBank();
    if (bank) {
      props.recordEvent?.({
        type: 'inventory.delta',
        lessonId: props.lessonId,
        segmentId: props.segment.id,
        bankId: bank.id,
        tokenTypeId,
        delta,
        reason,
      });
    }
    inventoryActions.recordDelta({
      tokenTypeId,
      delta,
      reason,
      bankId: bank?.id,
      segmentId: props.segment.id,
    });
  };

  let didResetInventory = false;
  let lastSegmentId: string | undefined;

  const recordInventoryReset = () => {
    const bank = inventoryBank();
    if (!bank) return;
    props.recordEvent?.({
      type: 'inventory.reset',
      lessonId: props.lessonId,
      segmentId: props.segment.id,
      bankId: bank.id,
    });
    inventoryActions.recordDelta({
      tokenTypeId: '*',
      delta: 0,
      reason: 'reset',
      bankId: bank.id,
      segmentId: props.segment.id,
    });
  };

  const resetInventory = () => {
    if (didResetInventory) return;
    didResetInventory = true;
    recordInventoryReset();
    inventoryActions.resetBank();
  };

  createEffect(() => {
    const segmentId = props.segment.id;
    if (segmentId !== lastSegmentId) {
      didResetInventory = false;
      lastSegmentId = segmentId;
    }
  });

  const currentStep = createMemo(() => steps()[currentIndex()]);

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
  const markCompleted = (_stepId: string) => {
    setFeedback('Great work! Move to the next step when you are ready.');

    if (currentIndex() >= steps().length - 1) {
      resetInventory();
      props.onSegmentComplete();
    } else {
      setCurrentIndex((index) => index + 1);
    }
  };

  const handleCheck = () => {
    const step = currentStep();
    if (!step) return;

    const snapshot = workspaceState();
    const success = evaluateStep(step.evaluatorId, snapshot, props.scenario);
    setAttempts(step.id, (attempts[step.id] ?? 0) + 1);

    if (success) {
      markCompleted(step.id);
      return;
    }

    setFeedback(step.nudge);
  };

  const renderWorkspace = () => {
    const step = currentStep();
    switch (workspace()) {
      case 'golden-beads':
        return (
          <GoldenBeadsWorkspace
            scenario={props.scenario as GoldenBeadScenario | undefined}
            onStateChange={(snapshot) => setWorkspaceState(snapshot)}
            currentStepEvaluator={step?.evaluatorId}
            tokensByKind={tokensByKind}
            inventoryActions={inventoryActions}
            reportInventoryFeedback={setFeedback}
            recordInventoryDelta={recordInventoryDelta}
          />
        );
      case 'stamp-game':
        return (
          <StampGameWorkspace
            scenario={props.scenario as StampGameScenario | undefined}
            onStateChange={(snapshot) => setWorkspaceState(snapshot)}
            tokensByKind={tokensByKind}
            inventoryActions={inventoryActions}
            reportInventoryFeedback={setFeedback}
            recordInventoryDelta={recordInventoryDelta}
          />
        );
      default:
        return (
          <Card variant="soft" class="p-4 text-sm text-[color:var(--color-text-subtle)]">
            Workspace coming soon.
          </Card>
        );
    }
  };

  onCleanup(() => resetInventory());

  return (
    <LessonCanvas
      data-variant="guided"
      stageClass="lesson-segment lesson-segment--guided guided-stage"
      renderOverlay={<LessonInventoryOverlay bank={inventoryBank} tokens={inventoryTokens} />}
    >

      {/* K-3 Minimal: Just show the prompt, no chips or verbose text */}
      <div class="guided-prompt">
        {currentStep()?.prompt}
      </div>

      <div class="lesson-segment__canvas guided-stage__canvas">
        <div class="guided-stage__workspace">{renderWorkspace()}</div>
      </div>

      <footer class="guided-footer-minimal">
        <Button onClick={handleCheck}>Check</Button>
        <Show when={feedback()}>
          {(message) => <div class="guided-feedback">{message()}</div>}
        </Show>
      </footer>
    </LessonCanvas>
  );
};
