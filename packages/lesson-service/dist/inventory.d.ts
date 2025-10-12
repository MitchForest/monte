import type { LessonDocument, LessonMaterialInventory, MaterialBankDefinition } from '@monte/types';
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
export {};
//# sourceMappingURL=inventory.d.ts.map