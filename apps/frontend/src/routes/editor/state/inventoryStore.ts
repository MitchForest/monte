import type { Accessor } from 'solid-js';

import type {
  LessonDocument,
  LessonMaterialInventory,
  MaterialBankDefinition,
  TokenTypeDefinition,
  WorkspaceKind,
} from '@monte/types';

import type { LessonEditor } from '../../../domains/curriculum/state/lessonEditor';
import {
  createDefaultMaterialBank,
  createDefaultTokenType,
  removeTokenFromBank,
} from '../../../domains/curriculum/utils/inventory';
import { clone } from '../utils';
import type { LessonSegment } from '../types';

export interface InventorySnapshotRegistration {
  snapshot?: () => LessonMaterialInventory;
  verify?: () => void;
}

export interface InventoryStore {
  registerInventorySnapshot: (options?: InventorySnapshotRegistration) => void;
  applyInventorySnapshot: () => void;
  handleAddTokenType: () => void;
  handleUpdateTokenType: (
    tokenId: string,
    mutate: (token: TokenTypeDefinition) => TokenTypeDefinition,
  ) => void;
  handleRemoveTokenType: (tokenId: string) => void;
  handleAddMaterialBank: (scope?: 'lesson' | 'segment', segmentId?: string) => void;
  handleUpdateMaterialBank: (
    bankId: string,
    mutate: (bank: MaterialBankDefinition) => MaterialBankDefinition,
  ) => void;
  handleRemoveMaterialBank: (bankId: string) => void;
}

interface InventoryStoreOptions {
  editor: LessonEditor;
  lessonDocument: Accessor<LessonDocument | undefined>;
  defaultMaterialId: string;
}

export const createInventoryStore = ({
  editor,
  lessonDocument,
  defaultMaterialId,
}: InventoryStoreOptions): InventoryStore => {
  let resolveInventorySnapshot: (() => LessonMaterialInventory) | undefined;
  let resolveInventoryVerifier: (() => void) | undefined;

  const registerInventorySnapshot = (options?: InventorySnapshotRegistration) => {
    resolveInventorySnapshot = options?.snapshot;
    resolveInventoryVerifier = options?.verify;
  };

  const applyInventorySnapshot = () => {
    if (resolveInventoryVerifier) {
      resolveInventoryVerifier();
    }
    if (!resolveInventorySnapshot) return;
    const snapshot = resolveInventorySnapshot();
    if (!snapshot) return;
    editor.applyUpdate((draft) => {
      draft.lesson.materialInventory = clone(snapshot);
    });
  };

  const handleInventoryUpdate = (
    mutator: (inventory: LessonMaterialInventory) => LessonMaterialInventory,
  ) => {
    editor.applyInventoryUpdate((currentInventory) => mutator(clone(currentInventory)));
  };

  const handleAddTokenType = () => {
    handleInventoryUpdate((inventory) => {
      const fallbackMaterial = inventory.tokenTypes[0]?.materialId ?? defaultMaterialId;
      const segments = lessonDocument()?.lesson.segments ?? [];
      const firstWorkspaceSegment = segments.find(
        (segment): segment is LessonSegment & { workspace: WorkspaceKind } =>
          'workspace' in segment,
      );
      const fallbackWorkspace: WorkspaceKind =
        inventory.tokenTypes[0]?.workspace ?? firstWorkspaceSegment?.workspace ?? 'golden-beads';
      const token = createDefaultTokenType(fallbackMaterial, fallbackWorkspace);
      return {
        ...inventory,
        tokenTypes: [...inventory.tokenTypes, token],
      } satisfies LessonMaterialInventory;
    });
  };

  const handleUpdateTokenType = (
    tokenId: string,
    mutate: (token: TokenTypeDefinition) => TokenTypeDefinition,
  ) => {
    handleInventoryUpdate((inventory) => ({
      ...inventory,
      tokenTypes: inventory.tokenTypes.map((token) =>
        token.id === tokenId ? mutate(clone(token)) : token,
      ),
    }));
  };

  const handleRemoveTokenType = (tokenId: string) => {
    handleInventoryUpdate((inventory) => ({
      ...inventory,
      tokenTypes: inventory.tokenTypes.filter((token) => token.id !== tokenId),
      banks: inventory.banks.map((bank) => removeTokenFromBank(bank, tokenId)),
    }));
  };

  const handleAddMaterialBank = (scope: 'lesson' | 'segment' = 'lesson', segmentId?: string) => {
    handleInventoryUpdate((inventory) => {
      const segments = lessonDocument()?.lesson.segments ?? [];
      const resolvedSegmentId = scope === 'segment' ? segmentId ?? segments[0]?.id : undefined;
      const accepts = inventory.tokenTypes.length > 0 ? [inventory.tokenTypes[0].id] : [];
      const bank = createDefaultMaterialBank({
        materialId: defaultMaterialId,
        scope,
        segmentId: resolvedSegmentId,
        accepts,
        initialQuantity: 0,
      });
      return {
        ...inventory,
        banks: [...inventory.banks, bank],
      } satisfies LessonMaterialInventory;
    });
  };

  const handleUpdateMaterialBank = (
    bankId: string,
    mutate: (bank: MaterialBankDefinition) => MaterialBankDefinition,
  ) => {
    handleInventoryUpdate((inventory) => ({
      ...inventory,
      banks: inventory.banks.map((bank) => (bank.id === bankId ? mutate(clone(bank)) : bank)),
    }));
  };

  const handleRemoveMaterialBank = (bankId: string) => {
    handleInventoryUpdate((inventory) => ({
      ...inventory,
      banks: inventory.banks.filter((bank) => bank.id !== bankId),
    }));
  };

  return {
    registerInventorySnapshot,
    applyInventorySnapshot,
    handleAddTokenType,
    handleUpdateTokenType,
    handleRemoveTokenType,
    handleAddMaterialBank,
    handleUpdateMaterialBank,
    handleRemoveMaterialBank,
  };
};
