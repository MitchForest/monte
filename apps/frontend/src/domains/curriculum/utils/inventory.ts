import type {
  LessonMaterialInventory,
  MaterialBankDefinition,
  TokenTypeDefinition,
  WorkspaceKind,
} from '@monte/types';

const randomId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

const generateInventoryId = (prefix: string) => `${prefix}-${randomId()}`;

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
