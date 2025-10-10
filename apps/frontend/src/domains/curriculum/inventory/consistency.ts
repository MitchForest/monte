import type { LessonMaterialInventory, MaterialBankDefinition } from '@monte/types';

export interface InventoryDelta {
  tokenTypeId: string;
  delta: number;
  reason: 'consume' | 'replenish' | 'reset';
  bankId?: string;
  segmentId?: string;
}

interface BankRuntimeState {
  available: Record<string, number>;
  initial: Record<string, number>;
}

export type RuntimeInventoryState = {
  banks: Record<string, BankRuntimeState>;
};

export const deriveAcceptedTokenIds = (
  bank: MaterialBankDefinition,
  inventory: LessonMaterialInventory,
): string[] => {
  if (bank.accepts.length > 0) {
    return bank.accepts;
  }
  return inventory.tokenTypes.map((token) => token.id);
};

const toRecord = (entries: Array<[string, number]>): Record<string, number> => {
  const map: Record<string, number> = {};
  entries.forEach(([key, value]) => {
    map[key] = value;
  });
  return map;
};

const createBankState = (
  bank: MaterialBankDefinition,
  inventory: LessonMaterialInventory,
): BankRuntimeState => {
  const tokenIds = deriveAcceptedTokenIds(bank, inventory);
  const initialQuantity = bank.initialQuantity;
  let initial: Record<string, number>;
  if (typeof initialQuantity === 'number') {
    initial = toRecord(tokenIds.map((id) => [id, initialQuantity]));
  } else {
    initial = { ...initialQuantity };
  }

  tokenIds.forEach((id) => {
    if (typeof initial[id] !== 'number') {
      initial[id] = 0;
    }
  });

  return {
    available: { ...initial },
    initial,
  };
};

export const buildRuntimeState = (inventory: LessonMaterialInventory): RuntimeInventoryState => {
  const banks: Record<string, BankRuntimeState> = {};
  for (const bank of inventory.banks) {
    banks[bank.id] = createBankState(bank, inventory);
  }
  return { banks };
};

const summarizeDeltas = (deltas: InventoryDelta[]) => {
  const summary = new Map<
    string,
    Map<
      string,
      {
        net: number;
        consumed: number;
        replenished: number;
      }
    >
  >();

  for (const delta of deltas) {
    if (!delta.bankId) continue;
    if (delta.reason === 'reset') {
      summary.delete(delta.bankId);
      continue;
    }
    if (delta.tokenTypeId === '*') continue;
    let bankSummary = summary.get(delta.bankId);
    if (!bankSummary) {
      bankSummary = new Map();
      summary.set(delta.bankId, bankSummary);
    }
    const entry =
      bankSummary.get(delta.tokenTypeId) ?? {
        net: 0,
        consumed: 0,
        replenished: 0,
      };
    entry.net += delta.delta;
    if (delta.reason === 'consume') {
      entry.consumed += Math.abs(delta.delta);
    } else if (delta.reason === 'replenish') {
      entry.replenished += Math.abs(delta.delta);
    }
    bankSummary.set(delta.tokenTypeId, entry);
  }

  return summary;
};

export type ConsistencyIssue = {
  bankId: string;
  tokenTypeId: string;
  expected: number;
  actual: number;
};

export const detectInventoryConsistencyIssues = (
  inventory: LessonMaterialInventory,
  runtime: RuntimeInventoryState,
  deltas: InventoryDelta[],
): ConsistencyIssue[] => {
  const issues: ConsistencyIssue[] = [];
  const deltaSummary = summarizeDeltas(deltas);

  for (const bank of inventory.banks) {
    const runtimeBank = runtime.banks[bank.id];
    if (!runtimeBank) continue;
    const expectedTokens = new Set<string>([
      ...Object.keys(runtimeBank.initial),
      ...Object.keys(runtimeBank.available),
    ]);
    const accepted = deriveAcceptedTokenIds(bank, inventory);
    accepted.forEach((tokenId) => expectedTokens.add(tokenId));

    const bankSummary = deltaSummary.get(bank.id);

    for (const tokenId of expectedTokens) {
      const initial = runtimeBank.initial[tokenId] ?? 0;
      const available = runtimeBank.available[tokenId] ?? 0;
      const net = bankSummary?.get(tokenId)?.net ?? 0;
      const expected = initial + net;
      if (available !== expected) {
        issues.push({
          bankId: bank.id,
          tokenTypeId: tokenId,
          expected,
          actual: available,
        });
      }
    }
  }

  return issues;
};
