import { z } from 'zod';

import { AuthoringMetaSchema } from './primitives.js';

export const MaterialSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    primaryUse: z.literal('multiplication'),
    interaction: z.enum(['manipulate', 'static']),
    media: z
      .object({
        thumbnail: z.string().optional(),
        icon: z.string().optional(),
      })
      .optional(),
  })
  .strict();
export type Material = z.infer<typeof MaterialSchema>;

export const MaterialUsageSchema = z
  .object({
    materialId: z.string(),
    purpose: z.string(),
    optional: z.boolean().optional(),
  })
  .strict();
export type MaterialUsage = z.infer<typeof MaterialUsageSchema>;

export const WorkspaceKindSchema = z.enum(['golden-beads', 'stamp-game']);
export type WorkspaceKind = z.infer<typeof WorkspaceKindSchema>;

export const BankQuantityMapSchema = z.record(z.number());
export type BankQuantityMap = z.infer<typeof BankQuantityMapSchema>;

export const CanvasAnchorSchema = z
  .object({
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
    width: z.number().optional(),
    height: z.number().optional(),
    align: z.enum(['start', 'center', 'end']).optional(),
  })
  .strict();
export type CanvasAnchor = z.infer<typeof CanvasAnchorSchema>;

export const ExchangeRuleSchema = z
  .object({
    triggerTokenType: z.string(),
    produces: z.array(
      z.object({
        tokenType: z.string(),
        quantity: z.number(),
      }),
    ),
    consumes: z.array(
      z.object({
        tokenType: z.string(),
        quantity: z.number(),
      }),
    ),
  })
  .strict();
export type ExchangeRule = z.infer<typeof ExchangeRuleSchema>;

export const ReplenishRuleSchema = z
  .object({
    whenBankId: z.string(),
    method: z.enum(['reset-on-exit', 'reset-on-undo', 'custom']),
    customHandlerId: z.string().optional(),
  })
  .strict();
export type ReplenishRule = z.infer<typeof ReplenishRuleSchema>;

export const ConsumptionRuleSchema = z
  .object({
    bankId: z.string(),
    allowNegative: z.boolean().optional(),
    blockWhenEmpty: z.boolean().optional(),
  })
  .strict();
export type ConsumptionRule = z.infer<typeof ConsumptionRuleSchema>;

export const InventoryRuleSetSchema = z
  .object({
    onExchange: z.array(ExchangeRuleSchema).optional(),
    onReplenish: z.array(ReplenishRuleSchema).optional(),
    onConsumption: z.array(ConsumptionRuleSchema).optional(),
  })
  .strict();
export type InventoryRuleSet = z.infer<typeof InventoryRuleSetSchema>;

export const TokenVisualDefinitionSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('bead'),
    place: z.enum(['unit', 'ten', 'hundred', 'thousand']),
  }),
  z.object({
    kind: z.literal('card'),
    value: z.number(),
    size: z.enum(['sm', 'md', 'lg']),
  }),
  z.object({
    kind: z.literal('stamp'),
    value: z.union([z.literal(1), z.literal(10), z.literal(100)]),
  }),
  z.object({
    kind: z.literal('custom'),
    componentId: z.string(),
    props: z.record(z.unknown()).optional(),
  }),
]);
export type TokenVisualDefinition = z.infer<typeof TokenVisualDefinitionSchema>;

export const TokenTypeDefinitionSchema = z
  .object({
    id: z.string(),
    materialId: z.string(),
    workspace: WorkspaceKindSchema,
    label: z.string(),
    visual: TokenVisualDefinitionSchema,
    quantityPerToken: z.number().optional(),
    authoring: AuthoringMetaSchema.optional(),
  })
  .strict();
export type TokenTypeDefinition = z.infer<typeof TokenTypeDefinitionSchema>;

export const MaterialBankDefinitionSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    scope: z.enum(['lesson', 'segment']),
    segmentId: z.string().optional(),
    materialId: z.string(),
    accepts: z.array(z.string()),
    initialQuantity: z.union([z.number(), BankQuantityMapSchema]),
    depletion: z.enum(['static', 'consume', 'replenish']).optional(),
    layout: CanvasAnchorSchema.optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();
export type MaterialBankDefinition = z.infer<typeof MaterialBankDefinitionSchema>;

export const LessonMaterialInventorySchema = z
  .object({
    version: z.literal(1),
    tokenTypes: z.array(TokenTypeDefinitionSchema),
    banks: z.array(MaterialBankDefinitionSchema),
    defaultRules: InventoryRuleSetSchema.optional(),
    sceneNodes: z
      .array(
        z
          .object({
            id: z.string(),
            materialId: z.string(),
            label: z.string().optional(),
            transform: z
              .object({
                position: z.object({ x: z.number(), y: z.number() }),
                rotation: z.number().optional(),
                scale: z
                  .object({
                    x: z.number(),
                    y: z.number(),
                  })
                  .optional(),
                opacity: z.number().optional(),
              })
              .optional(),
            metadata: z.record(z.unknown()).optional(),
          })
          .strict(),
      )
      .optional(),
  })
  .strict();
export type LessonMaterialInventory = z.infer<typeof LessonMaterialInventorySchema>;
