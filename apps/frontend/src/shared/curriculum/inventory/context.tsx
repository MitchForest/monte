import { For, Show, createContext, createEffect, createMemo, useContext, type ParentComponent } from 'solid-js';
import { createStore } from 'solid-js/store';

import type {
  LessonMaterialInventory,
  LessonSegment,
  MaterialBankDefinition,
  TokenTypeDefinition,
  WorkspaceKind,
} from '@monte/types';
import { createEmptyInventory } from '@monte/lesson-service';
import {
  buildRuntimeState,
  detectInventoryConsistencyIssues,
  type InventoryDelta,
  type RuntimeInventoryState,
} from './consistency';

interface TokenTypeWithQuantity {
  definition: TokenTypeDefinition;
  quantity: number;
}

interface LessonInventoryContextValue {
  inventory: () => LessonMaterialInventory;
  getBank: (bankId: string | undefined) => MaterialBankDefinition | undefined;
  getTokenType: (tokenTypeId: string) => TokenTypeDefinition | undefined;
  listBanksForSegment: (segmentId: string) => MaterialBankDefinition[];
  getQuantity: (bankId: string | undefined, tokenTypeId: string) => number;
  consumeToken: (bankId: string | undefined, tokenTypeId: string, amount?: number) => boolean;
  replenishToken: (bankId: string | undefined, tokenTypeId: string, amount?: number) => void;
  resetBank: (bankId: string | undefined) => void;
  resetAll: () => void;
  snapshot: () => LessonMaterialInventory;
  deltas: () => InventoryDelta[];
  recordDelta: (delta: InventoryDelta) => void;
  verifyConsistency: () => void;
}

const EMPTY_INVENTORY: LessonMaterialInventory = createEmptyInventory();

const LessonInventoryContext = createContext<LessonInventoryContextValue>();

export const LessonInventoryProvider: ParentComponent<{
  inventory?: LessonMaterialInventory | null;
}> = (props) => {
  const resolved = createMemo<LessonMaterialInventory>(() => props.inventory ?? EMPTY_INVENTORY);

  const [runtime, setRuntime] = createStore<RuntimeInventoryState>(buildRuntimeState(resolved()));
  const [deltas, setDeltas] = createStore<InventoryDelta[]>([]);

  createEffect(() => {
    const latest = resolved();
    setRuntime(buildRuntimeState(latest));
  });

  const bankMap = createMemo(() => {
    const map = new Map<string, MaterialBankDefinition>();
    for (const bank of resolved().banks) {
      map.set(bank.id, bank);
    }
    return map;
  });

  const tokenTypeMap = createMemo(() => {
    const map = new Map<string, TokenTypeDefinition>();
    for (const tokenType of resolved().tokenTypes) {
      map.set(tokenType.id, tokenType);
    }
    return map;
  });

  const getQuantity = (bankId: string | undefined, tokenTypeId: string): number => {
    if (!bankId) return 0;
    return runtime.banks[bankId]?.available[tokenTypeId] ?? 0;
  };

  const consumeToken = (bankId: string | undefined, tokenTypeId: string, amount = 1): boolean => {
    if (!bankId) return false;
    const current = runtime.banks[bankId];
    if (!current) return false;
    const available = current.available[tokenTypeId] ?? 0;
    if (available < amount) {
      console.warn('[inventory] insufficient supply', { bankId, tokenTypeId, requested: amount, available });
      return false;
    }
    setRuntime('banks', bankId, 'available', tokenTypeId, available - amount);
    setDeltas((previous) => [
      ...previous,
      {
        tokenTypeId,
        delta: -amount,
        reason: 'consume',
        bankId,
      },
    ]);
    return true;
  };

  const replenishToken = (bankId: string | undefined, tokenTypeId: string, amount = 1) => {
    if (!bankId) return;
    const current = runtime.banks[bankId];
    if (!current) {
      console.warn('[inventory] replenish target missing bank', { bankId, tokenTypeId, amount });
      return;
    }
    const available = current.available[tokenTypeId] ?? 0;
    setRuntime('banks', bankId, 'available', tokenTypeId, available + amount);
    setDeltas((previous) => [
      ...previous,
      {
        tokenTypeId,
        delta: amount,
        reason: 'replenish',
        bankId,
      },
    ]);
  };

  const resetBank = (bankId: string | undefined) => {
    if (!bankId) return;
    const current = runtime.banks[bankId];
    if (!current) return;
    setRuntime('banks', bankId, 'available', { ...current.initial });
    setDeltas((previous) => [
      ...previous,
      {
        tokenTypeId: '*',
        delta: 0,
        reason: 'reset',
        bankId,
      },
    ]);
  };

  const resetAll = () => {
    const snapshot = buildRuntimeState(resolved());
    setRuntime(snapshot);
    setDeltas([]);
  };

  const snapshotInventory = (): LessonMaterialInventory => {
    const base = resolved();
    return {
      ...base,
      banks: base.banks.map((bank) => {
        const runtimeBank = runtime.banks[bank.id];
        if (!runtimeBank) {
          return bank;
        }
        return {
          ...bank,
          initialQuantity: { ...runtimeBank.available },
        } satisfies MaterialBankDefinition;
      }),
    } satisfies LessonMaterialInventory;
  };

  const verifyConsistency = () => {
    const issues = detectInventoryConsistencyIssues(resolved(), runtime, deltas);
    if (issues.length > 0) {
      console.warn('[inventory] consistency check failed', {
        issues,
        deltas,
      });
      throw new Error('Inventory runtime state diverged from authored material inventory.');
    }
  };

  const value: LessonInventoryContextValue = {
    inventory: resolved,
    getBank: (bankId) => {
      if (!bankId) return undefined;
      return bankMap().get(bankId);
    },
    getTokenType: (tokenTypeId) => tokenTypeMap().get(tokenTypeId),
    listBanksForSegment: (segmentId) =>
      resolved().banks.filter(
        (bank) => bank.scope === 'segment' && bank.segmentId && bank.segmentId === segmentId,
      ),
    getQuantity,
    consumeToken,
    replenishToken,
    resetBank,
    resetAll,
    snapshot: snapshotInventory,
    deltas: () => deltas,
    recordDelta: (delta) => setDeltas((previous) => [...previous, delta]),
    verifyConsistency,
  };

  return <LessonInventoryContext.Provider value={value}>{props.children}</LessonInventoryContext.Provider>;
};

export const useLessonInventory = () => {
  const context = useContext(LessonInventoryContext);
  if (!context) {
    throw new Error('useLessonInventory must be used within a LessonInventoryProvider');
  }
  return context;
};

export const useSegmentInventory = (segment: Pick<LessonSegment, 'id' | 'materialBankId'>) => {
  const context = useLessonInventory();

  const bank = createMemo<MaterialBankDefinition | undefined>(() => {
    const explicit = context.getBank(segment.materialBankId);
    if (explicit) return explicit;
    const scoped = context.listBanksForSegment(segment.id);
    if (scoped.length > 0) return scoped[0];
    return context.inventory().banks.find((candidate) => candidate.scope === 'lesson');
  });

  const tokenTypes = createMemo<TokenTypeWithQuantity[]>(() => {
    const currentBank = bank();
    if (!currentBank) return [];
    const accepts = currentBank.accepts.length > 0 ? currentBank.accepts : context.inventory().tokenTypes.map((token) => token.id);
    return accepts
      .map((tokenId) => {
        const definition = context.getTokenType(tokenId);
        if (!definition) return undefined;
        const quantity = context.getQuantity(currentBank.id, tokenId);
        return {
          definition,
          quantity,
        } satisfies TokenTypeWithQuantity;
      })
      .filter((value): value is TokenTypeWithQuantity => value !== undefined);
  });

  const workspace = createMemo<WorkspaceKind | undefined>(() => tokenTypes()[0]?.definition.workspace);

  return {
    bank,
    tokenTypes,
    materialId: createMemo(() => bank()?.materialId),
    workspace,
    actions: {
      consumeToken: (tokenTypeId: string, amount = 1) => {
        const currentBank = bank();
        if (!currentBank) return false;
        const success = context.consumeToken(currentBank.id, tokenTypeId, amount);
        if (success) {
          context.recordDelta({
            tokenTypeId,
            delta: -amount,
            reason: 'consume',
            bankId: currentBank.id,
            segmentId: segment.id,
          });
        }
        return success;
      },
      replenishToken: (tokenTypeId: string, amount = 1) => {
        const currentBank = bank();
        if (!currentBank) return;
        context.replenishToken(currentBank.id, tokenTypeId, amount);
        context.recordDelta({
          tokenTypeId,
          delta: amount,
          reason: 'replenish',
          bankId: currentBank.id,
          segmentId: segment.id,
        });
      },
      resetBank: () => {
        const currentBank = bank();
        if (!currentBank) return;
        context.resetBank(currentBank.id);
        context.recordDelta({
          tokenTypeId: '*',
          delta: 0,
          reason: 'reset',
          bankId: currentBank.id,
          segmentId: segment.id,
        });
      },
      recordDelta: (delta: InventoryDelta) => {
        const currentBank = bank();
        context.recordDelta({
          bankId: currentBank?.id,
          segmentId: segment.id,
          ...delta,
        });
      },
      deltas: context.deltas,
    },
  };
};

export const LessonInventoryOverlay = (props: {
  bank: () => MaterialBankDefinition | undefined;
  tokens: () => TokenTypeWithQuantity[];
}) => (
  <Show when={props.bank()}>
    {(bank) => (
      <div class="lesson-inventory-banner">
        <div class="lesson-inventory-bank">{bank().label}</div>
        <div class="lesson-inventory-tokens">
          <For each={props.tokens()}>
            {(token) => (
              <span class="lesson-inventory-token">
                {token.definition.label}
                <span aria-hidden> · {token.quantity}</span>
                <span class="sr-only">
                  {token.quantity} available {token.definition.label}
                </span>
              </span>
            )}
          </For>
        </div>
      </div>
    )}
  </Show>
);

export type { InventoryDelta } from './consistency';
