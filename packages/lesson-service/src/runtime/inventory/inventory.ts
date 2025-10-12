import type {
  LessonDocument,
  LessonMaterialInventory,
  MaterialBankDefinition,
  TokenTypeDefinition,
  WorkspaceKind,
} from '@monte/types';

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

const randomId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

const generateInventoryId = (prefix: string) => `${prefix}-${randomId()}`;

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

export const assertInventoryConsistency = (draft: LessonDocument) => {
  const inventory = draft.lesson.materialInventory;
  if (!inventory) return;
  const tokenTypeIds = new Set(inventory.tokenTypes.map((token) => token.id));
  const segmentIds = new Set(draft.lesson.segments.map((segment) => segment.id));

  for (const bank of inventory.banks) {
    const acceptedIds = bank.accepts.length > 0 ? bank.accepts : Array.from(tokenTypeIds);
    for (const tokenId of acceptedIds) {
      if (!tokenTypeIds.has(tokenId)) {
        throw new Error(`Bank ${bank.id} references unknown token type ${tokenId}`);
      }
    }
    if (bank.scope === 'segment') {
      if (!bank.segmentId || !segmentIds.has(bank.segmentId)) {
        throw new Error(`Bank ${bank.id} references unknown segment ${bank.segmentId ?? '(missing)'}`);
      }
    }
  }

  const bankIds = new Set(inventory.banks.map((bank) => bank.id));
  for (const segment of draft.lesson.segments) {
    if (segment.materialBankId && !bankIds.has(segment.materialBankId)) {
      throw new Error(`Segment ${segment.id} references missing bank ${segment.materialBankId}`);
    }
  }
};

export const createEmptyInventory = (): LessonMaterialInventory => ({
  version: 1,
  tokenTypes: [],
  banks: [],
});

export const createTokenType = (
  partial: Partial<TokenTypeDefinition> &
    Pick<TokenTypeDefinition, 'id' | 'materialId' | 'workspace' | 'label' | 'visual'>,
): TokenTypeDefinition => ({
  quantityPerToken: 1,
  authoring: undefined,
  ...partial,
});

const defaultVisual = (workspace: WorkspaceKind): TokenTypeDefinition['visual'] => {
  if (workspace === 'stamp-game') {
    return { kind: 'stamp', value: 1 };
  }
  return { kind: 'bead', place: 'unit' };
};

export const createDefaultTokenType = (
  materialId: string,
  workspace: WorkspaceKind,
  label = 'New token type',
): TokenTypeDefinition =>
  createTokenType({
    id: generateInventoryId('token'),
    materialId,
    workspace,
    label,
    visual: defaultVisual(workspace),
  });

export const createMaterialBank = (
  partial: Partial<MaterialBankDefinition> &
    Pick<MaterialBankDefinition, 'id' | 'label' | 'scope' | 'materialId' | 'accepts'>,
): MaterialBankDefinition => ({
  segmentId: partial.scope === 'segment' ? partial.segmentId ?? undefined : undefined,
  initialQuantity: 0,
  depletion: 'consume',
  layout: undefined,
  metadata: undefined,
  ...partial,
});

export const createDefaultMaterialBank = (params: {
  materialId: string;
  scope?: MaterialBankDefinition['scope'];
  segmentId?: string;
  accepts?: string[];
  label?: string;
  initialQuantity?: number;
}): MaterialBankDefinition =>
  createMaterialBank({
    id: generateInventoryId('bank'),
    label: params.label ?? 'New material bank',
    scope: params.scope ?? 'lesson',
    segmentId: params.scope === 'segment' ? params.segmentId : undefined,
    materialId: params.materialId,
    accepts: params.accepts ?? [],
    initialQuantity: params.initialQuantity ?? 0,
  });

export const resolveBankQuantity = (bank: MaterialBankDefinition, tokenTypeId: string): number => {
  if (typeof bank.initialQuantity === 'number') {
    return bank.initialQuantity;
  }
  return bank.initialQuantity[tokenTypeId] ?? 0;
};

export const removeTokenFromBank = (
  bank: MaterialBankDefinition,
  tokenTypeId: string,
): MaterialBankDefinition => {
  const accepts = bank.accepts.filter((id) => id !== tokenTypeId);
  if (typeof bank.initialQuantity === 'number') {
    return { ...bank, accepts };
  }
  const restQuantities = { ...bank.initialQuantity };
  delete restQuantities[tokenTypeId];
  return {
    ...bank,
    accepts,
    initialQuantity: restQuantities,
  };
};
