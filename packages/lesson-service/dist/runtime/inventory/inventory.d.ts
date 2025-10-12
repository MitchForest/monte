import type { LessonDocument, LessonMaterialInventory, MaterialBankDefinition, TokenTypeDefinition, WorkspaceKind } from '@monte/types';
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
export declare const deriveAcceptedTokenIds: (bank: MaterialBankDefinition, inventory: LessonMaterialInventory) => string[];
export declare const buildRuntimeState: (inventory: LessonMaterialInventory) => RuntimeInventoryState;
export type ConsistencyIssue = {
    bankId: string;
    tokenTypeId: string;
    expected: number;
    actual: number;
};
export declare const detectInventoryConsistencyIssues: (inventory: LessonMaterialInventory, runtime: RuntimeInventoryState, deltas: InventoryDelta[]) => ConsistencyIssue[];
export declare const assertInventoryConsistency: (draft: LessonDocument) => void;
export declare const createEmptyInventory: () => LessonMaterialInventory;
export declare const createTokenType: (partial: Partial<TokenTypeDefinition> & Pick<TokenTypeDefinition, "id" | "materialId" | "workspace" | "label" | "visual">) => TokenTypeDefinition;
export declare const createDefaultTokenType: (materialId: string, workspace: WorkspaceKind, label?: string) => TokenTypeDefinition;
export declare const createMaterialBank: (partial: Partial<MaterialBankDefinition> & Pick<MaterialBankDefinition, "id" | "label" | "scope" | "materialId" | "accepts">) => MaterialBankDefinition;
export declare const createDefaultMaterialBank: (params: {
    materialId: string;
    scope?: MaterialBankDefinition["scope"];
    segmentId?: string;
    accepts?: string[];
    label?: string;
    initialQuantity?: number;
}) => MaterialBankDefinition;
export declare const resolveBankQuantity: (bank: MaterialBankDefinition, tokenTypeId: string) => number;
export declare const removeTokenFromBank: (bank: MaterialBankDefinition, tokenTypeId: string) => MaterialBankDefinition;
export {};
//# sourceMappingURL=inventory.d.ts.map