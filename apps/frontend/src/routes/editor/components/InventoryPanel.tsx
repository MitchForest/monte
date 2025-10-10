import { For, Show, createMemo } from 'solid-js';

import { useEditorActions, useEditorComputed } from '../hooks/useEditorViewModel';
import { beadPlaceOptions, workspaceOptions } from '../constants';
import { curriculumMaterials } from '../../../domains/curriculum/materials';
import { Button, Card } from '../../../design-system';
import type { TokenTypeDefinition } from '@monte/types';
import { resolveBankQuantity } from '../../../domains/curriculum/utils/inventory';

const visualKindOptions = [
  { value: 'bead', label: 'Bead' },
  { value: 'card', label: 'Card' },
  { value: 'stamp', label: 'Stamp' },
] as const;

const cardSizeOptions = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
] as const;

const stampValues = [
  { value: 1, label: '1' },
  { value: 10, label: '10' },
  { value: 100, label: '100' },
] as const;

export const InventoryPanel = () => {
  const { materialInventory: inventory, lessonDocument } = useEditorComputed();
  const actions = useEditorActions();
  const segments = createMemo(() => lessonDocument()?.lesson.segments ?? []);

  const segmentOptions = createMemo(() =>
    segments().map((segment) => ({ id: segment.id, title: segment.title, type: segment.type })),
  );

  const handleLabelChange = (token: TokenTypeDefinition, value: string) => {
    actions.handleUpdateTokenType(token.id, (draft) => ({
      ...draft,
      label: value,
    }));
  };

  const handleMaterialChange = (token: TokenTypeDefinition, value: string) => {
    actions.handleUpdateTokenType(token.id, (draft) => ({
      ...draft,
      materialId: value,
    }));
  };

  const handleWorkspaceChange = (token: TokenTypeDefinition, workspace: string) => {
    actions.handleUpdateTokenType(token.id, (draft) => ({
      ...draft,
      workspace: workspace as TokenTypeDefinition['workspace'],
    }));
  };

  const handleVisualKindChange = (token: TokenTypeDefinition, kind: typeof visualKindOptions[number]['value']) => {
    actions.handleUpdateTokenType(token.id, (draft) => {
      switch (kind) {
        case 'bead':
          return { ...draft, visual: { kind: 'bead', place: 'unit' } };
        case 'card':
          return { ...draft, visual: { kind: 'card', value: 0, size: 'md' } };
        case 'stamp':
          return { ...draft, visual: { kind: 'stamp', value: 1 } };
        default:
          return draft;
      }
    });
  };

  const handleQuantityPerTokenChange = (token: TokenTypeDefinition, value: number) => {
    actions.handleUpdateTokenType(token.id, (draft) => ({
      ...draft,
      quantityPerToken: Number.isNaN(value) ? draft.quantityPerToken : value,
    }));
  };

  const handleDeleteTokenType = (tokenId: string) => {
    actions.handleRemoveTokenType(tokenId);
  };

  const handleBankLabelChange = (bankId: string, value: string) => {
    actions.handleUpdateMaterialBank(bankId, (bank) => ({
      ...bank,
      label: value,
    }));
  };

  const handleBankMaterialChange = (bankId: string, value: string) => {
    actions.handleUpdateMaterialBank(bankId, (bank) => ({
      ...bank,
      materialId: value,
    }));
  };

  const handleBankScopeChange = (bankId: string, value: 'lesson' | 'segment') => {
    actions.handleUpdateMaterialBank(bankId, (bank) => ({
      ...bank,
      scope: value,
      segmentId: value === 'segment' ? bank.segmentId ?? segmentOptions()[0]?.id : undefined,
    }));
  };

  const handleBankSegmentChange = (bankId: string, value: string) => {
    actions.handleUpdateMaterialBank(bankId, (bank) => ({
      ...bank,
      segmentId: value,
    }));
  };

  const handleBankAcceptsChange = (bankId: string, values: string[]) => {
    actions.handleUpdateMaterialBank(bankId, (bank) => ({
      ...bank,
      accepts: values,
    }));
  };

const handleBankQuantityChange = (bankId: string, value: number) => {
  actions.handleUpdateMaterialBank(bankId, (bank) => ({
    ...bank,
    initialQuantity: Number.isNaN(value) ? bank.initialQuantity : value,
  }));
};

const handleBankTokenQuantityChange = (bankId: string, tokenId: string, value: number) => {
  actions.handleUpdateMaterialBank(bankId, (bank) => {
    const nextValue = Number.isNaN(value) ? 0 : value;
    let baseQuantities: Record<string, number>;
    if (typeof bank.initialQuantity === 'number') {
      const acceptedIds =
        bank.accepts.length > 0
          ? bank.accepts
          : inventory().tokenTypes.map((token) => token.id);
      baseQuantities = Object.fromEntries(
        acceptedIds.map((id) => [id, resolveBankQuantity(bank, id)]),
      );
    } else {
      baseQuantities = { ...bank.initialQuantity };
    }
    baseQuantities[tokenId] = nextValue;
    return {
      ...bank,
      initialQuantity: baseQuantities,
    };
  });
};

  const handleRemoveBank = (bankId: string) => {
    actions.handleRemoveMaterialBank(bankId);
  };

  const lessonHasSegments = createMemo(() => segmentOptions().length > 0);

  return (
    <Card variant="soft" class="space-y-4 p-5">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-muted">Inventory</h3>
        <div class="flex items-center gap-2">
          <Button size="compact" variant="secondary" onClick={() => actions.handleAddTokenType()}>
            Add token type
          </Button>
          <Button size="compact" variant="secondary" onClick={() => actions.handleAddMaterialBank('lesson')}>
            Add lesson bank
          </Button>
          <Button
            size="compact"
            variant="secondary"
            disabled={!lessonHasSegments()}
            onClick={() =>
              actions.handleAddMaterialBank(
                'segment',
                lessonHasSegments() ? segmentOptions()[0]?.id : undefined,
              )
            }
          >
            Add segment bank
          </Button>
        </div>
      </div>

      <section class="space-y-3">
        <header>
          <h4 class="text-xs font-semibold uppercase tracking-wide text-muted">Token types</h4>
        </header>
        <Show when={inventory().tokenTypes.length} fallback={<p class="text-xs text-muted">No token types defined yet.</p>}>
          <div class="space-y-3">
            <For each={inventory().tokenTypes}>
              {(token) => (
                <div class="space-y-2 rounded-md border border-[rgba(64,157,233,0.2)] bg-white/80 p-3 shadow-sm">
                  <div class="flex items-center justify-between gap-2">
                    <div class="text-xs text-muted">{token.id}</div>
                    <Button size="compact" variant="ghost" onClick={() => handleDeleteTokenType(token.id)}>
                      Remove
                    </Button>
                  </div>
                  <div class="grid gap-2 sm:grid-cols-2">
                    <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                      <span>Label</span>
                      <input
                        class="rounded-md border border-[rgba(64,157,233,0.4)] px-3 py-2 text-sm shadow-sm"
                        value={token.label}
                        onInput={(event) => handleLabelChange(token, event.currentTarget.value)}
                      />
                    </label>
                    <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                      <span>Material</span>
                      <select
                        class="rounded-md border border-[rgba(64,157,233,0.4)] px-3 py-2 text-sm shadow-sm"
                        value={token.materialId}
                        onChange={(event) => handleMaterialChange(token, event.currentTarget.value)}
                      >
                        <For each={curriculumMaterials}>
                          {(material) => <option value={material.id}>{material.name}</option>}
                        </For>
                      </select>
                    </label>
                  </div>
                  <div class="grid gap-2 sm:grid-cols-3">
                    <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                      <span>Workspace</span>
                      <select
                        class="rounded-md border border-[rgba(64,157,233,0.4)] px-3 py-2 text-sm shadow-sm"
                        value={token.workspace}
                        onChange={(event) => handleWorkspaceChange(token, event.currentTarget.value)}
                      >
                        <For each={workspaceOptions}>
                          {(option) => <option value={option.value}>{option.label}</option>}
                        </For>
                      </select>
                    </label>
                    <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                      <span>Visual kind</span>
                      <select
                        class="rounded-md border border-[rgba(64,157,233,0.4)] px-3 py-2 text-sm shadow-sm"
                        value={token.visual.kind}
                        onChange={(event) =>
                          handleVisualKindChange(
                            token,
                            event.currentTarget.value as (typeof visualKindOptions)[number]['value'],
                          )
                        }
                      >
                        <For each={visualKindOptions}>
                          {(option) => <option value={option.value}>{option.label}</option>}
                        </For>
                      </select>
                    </label>
                    <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                      <span>Quantity / token</span>
                      <input
                        type="number"
                        min="1"
                        class="rounded-md border border-[rgba(64,157,233,0.4)] px-3 py-2 text-sm shadow-sm"
                        value={token.quantityPerToken ?? 1}
                        onInput={(event) =>
                          handleQuantityPerTokenChange(token, Number(event.currentTarget.value) || 1)
                        }
                      />
                    </label>
                  </div>

                  <Show when={token.visual.kind === 'bead'}>
                    <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                      <span>Bead place</span>
                      <select
                        class="rounded-md border border-[rgba(64,157,233,0.4)] px-3 py-2 text-sm shadow-sm"
                        value={token.visual.kind === 'bead' ? token.visual.place : 'unit'}
                        onChange={(event) =>
                          actions.handleUpdateTokenType(token.id, (draft) => ({
                            ...draft,
                            visual: { kind: 'bead', place: event.currentTarget.value as (typeof beadPlaceOptions)[number] },
                          }))
                        }
                      >
                        <For each={beadPlaceOptions}>
                          {(option) => <option value={option}>{option}</option>}
                        </For>
                      </select>
                    </label>
                  </Show>

                  <Show when={token.visual.kind === 'card'}>
                    <div class="grid gap-2 sm:grid-cols-2">
                      <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                        <span>Card value</span>
                        <input
                          type="number"
                          class="rounded-md border border-[rgba(64,157,233,0.4)] px-3 py-2 text-sm shadow-sm"
                          value={token.visual.kind === 'card' ? token.visual.value : 0}
                          onInput={(event) =>
                            actions.handleUpdateTokenType(token.id, (draft) => ({
                              ...draft,
                              visual: {
                                kind: 'card',
                                value: Number(event.currentTarget.value) || 0,
                                size: draft.visual.kind === 'card' ? draft.visual.size : 'md',
                              },
                            }))
                          }
                        />
                      </label>
                      <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                        <span>Card size</span>
                        <select
                          class="rounded-md border border-[rgba(64,157,233,0.4)] px-3 py-2 text-sm shadow-sm"
                          value={token.visual.kind === 'card' ? token.visual.size : 'md'}
                          onChange={(event) =>
                            actions.handleUpdateTokenType(token.id, (draft) => ({
                              ...draft,
                              visual: {
                                kind: 'card',
                                value: draft.visual.kind === 'card' ? draft.visual.value : 0,
                                size: event.currentTarget.value as (typeof cardSizeOptions)[number]['value'],
                              },
                            }))
                          }
                        >
                          <For each={cardSizeOptions}>
                            {(option) => <option value={option.value}>{option.label}</option>}
                          </For>
                        </select>
                      </label>
                    </div>
                  </Show>

                  <Show when={token.visual.kind === 'stamp'}>
                    <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                      <span>Stamp value</span>
                      <select
                        class="rounded-md border border-[rgba(64,157,233,0.4)] px-3 py-2 text-sm shadow-sm"
                        value={token.visual.kind === 'stamp' ? token.visual.value : 1}
                        onChange={(event) =>
                          actions.handleUpdateTokenType(token.id, (draft) => ({
                            ...draft,
                            visual: {
                              kind: 'stamp',
                              value: Number(event.currentTarget.value) as (typeof stampValues)[number]['value'],
                            },
                          }))
                        }
                      >
                        <For each={stampValues}>
                          {(option) => <option value={option.value}>{option.label}</option>}
                        </For>
                      </select>
                    </label>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Show>
      </section>

      <section class="space-y-3">
        <header>
          <h4 class="text-xs font-semibold uppercase tracking-wide text-muted">Banks</h4>
        </header>
        <Show when={inventory().banks.length} fallback={<p class="text-xs text-muted">No banks configured.</p>}>
          <div class="space-y-3">
            <For each={inventory().banks}>
              {(bank) => {
                const acceptedTokenIds =
                  bank.accepts.length > 0
                    ? bank.accepts
                    : inventory().tokenTypes.map((token) => token.id);
                const tokenSummaries = acceptedTokenIds
                  .map((tokenId) => {
                    const definition = inventory().tokenTypes.find((token) => token.id === tokenId);
                    if (!definition) return undefined;
                    return {
                      id: tokenId,
                      label: definition.label,
                      quantity: resolveBankQuantity(bank, tokenId),
                    };
                  })
                  .filter((value): value is { id: string; label: string; quantity: number } => value !== undefined);

                return (
                  <div class="space-y-2 rounded-md border border-[rgba(64,157,233,0.2)] bg-white/80 p-3 shadow-sm">
                    <div class="flex items-center justify-between gap-2">
                      <div class="text-xs text-muted">{bank.id}</div>
                      <Button size="compact" variant="ghost" onClick={() => handleRemoveBank(bank.id)}>
                        Remove
                      </Button>
                  </div>
                  <div class="grid gap-2 sm:grid-cols-3">
                    <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                      <span>Label</span>
                      <input
                        class="rounded-md border border-[rgba(64,157,233,0.4)] px-3 py-2 text-sm shadow-sm"
                        value={bank.label}
                        onInput={(event) => handleBankLabelChange(bank.id, event.currentTarget.value)}
                      />
                    </label>
                    <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                      <span>Scope</span>
                      <select
                        class="rounded-md border border-[rgba(64,157,233,0.4)] px-3 py-2 text-sm shadow-sm"
                        value={bank.scope}
                        onChange={(event) =>
                          handleBankScopeChange(bank.id, event.currentTarget.value as 'lesson' | 'segment')
                        }
                      >
                        <option value="lesson">Lesson</option>
                        <option value="segment" disabled={!lessonHasSegments()}>
                          Segment
                        </option>
                      </select>
                    </label>
                    <Show when={bank.scope === 'segment'}>
                      <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                        <span>Segment</span>
                        <select
                          class="rounded-md border border-[rgba(64,157,233,0.4)] px-3 py-2 text-sm shadow-sm"
                          value={bank.segmentId ?? ''}
                          onChange={(event) => handleBankSegmentChange(bank.id, event.currentTarget.value)}
                        >
                          <For each={segmentOptions()}>
                            {(segment) => (
                              <option value={segment.id}>
                                {segment.title} ({segment.type})
                              </option>
                            )}
                          </For>
                        </select>
                      </label>
                    </Show>
                  </div>
                  <div class="grid gap-2 sm:grid-cols-2">
                    <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                      <span>Material</span>
                      <select
                        class="rounded-md border border-[rgba(64,157,233,0.4)] px-3 py-2 text-sm shadow-sm"
                        value={bank.materialId}
                        onChange={(event) => handleBankMaterialChange(bank.id, event.currentTarget.value)}
                      >
                        <For each={curriculumMaterials}>
                          {(material) => <option value={material.id}>{material.name}</option>}
                        </For>
                      </select>
                    </label>
                    <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                      <span>Accepts token types</span>
                      <select
                        multiple
                        class="rounded-md border border-[rgba(64,157,233,0.4)] px-3 py-2 text-sm shadow-sm"
                        value={bank.accepts}
                        onChange={(event) => {
                          const selected = Array.from(event.currentTarget.selectedOptions).map(
                            (option) => option.value,
                          );
                          handleBankAcceptsChange(bank.id, selected);
                        }}
                      >
                        <For each={inventory().tokenTypes}>
                          {(token) => <option value={token.id}>{token.label}</option>}
                        </For>
                      </select>
                    </label>
                  </div>
                    <div class="space-y-2">
                      <label class="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
                        <span>Uniform quantity</span>
                        <input
                          type="number"
                          class="rounded-md border border-[rgba(64,157,233,0.4)] px-3 py-2 text-sm shadow-sm"
                          value={typeof bank.initialQuantity === 'number' ? bank.initialQuantity : 0}
                          disabled={typeof bank.initialQuantity !== 'number'}
                          onInput={(event) => handleBankQuantityChange(bank.id, Number(event.currentTarget.value) || 0)}
                        />
                        <Show when={typeof bank.initialQuantity !== 'number'}>
                          <span class="text-[0.65rem] text-muted">
                            Editing per-token quantities overrides the uniform value.
                          </span>
                        </Show>
                      </label>
                      <Show when={tokenSummaries.length > 0}>
                        <div class="rounded-md border border-[rgba(64,157,233,0.2)] bg-[rgba(15,23,42,0.02)] p-3">
                          <div class="mb-2 text-[0.7rem] font-semibold uppercase tracking-wide text-muted">
                            Token counts
                          </div>
                          <div class="space-y-2">
                            <For each={tokenSummaries}>
                              {(summary) => (
                                <div class="flex items-center justify-between gap-2 text-xs">
                                  <span class="truncate" title={summary.label}>
                                    {summary.label}
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    class="w-20 rounded-md border border-[rgba(64,157,233,0.4)] px-2 py-1 text-right text-xs shadow-sm"
                                    value={summary.quantity}
                                    onInput={(event) =>
                                      handleBankTokenQuantityChange(
                                        bank.id,
                                        summary.id,
                                        Number(event.currentTarget.value) || 0,
                                      )
                                    }
                                  />
                                </div>
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      </section>
    </Card>
  );
};
