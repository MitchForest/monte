# Frontend UI Conventions

_Last updated: 2025-03-21_

This note captures how we author UI inside `apps/frontend`. The goals are consistency, small reusable primitives, and effortless swaps between runtime and authoring views while we finish the MVP.

---

## 1. Tooling Stack
- **Tailwind v4 utilities** handle layout/spacing. Keep class lists short and lift shared groupings into helpers (`surface-card`, `tap-target`, etc.).
- **`class-variance-authority` (cva)** powers every component surface. Define a single base string and add variants for state/size/intent.
- **Kobalte primitives** back interactive behaviour. Wrap them once inside `design-system` so route/domain code never imports Kobalte directly.
- **`cn` helper** (`src/lib/cn.ts`) merges class strings. Avoid template literals and manual conditionals.

### Quick Reference
- Create variants first: `const button = cva('base classes', { variants: {...} });`
- Expose Solid components with `splitProps` so additional class names bubble through.
- For conditional states (current/active/disabled), model them as `variants` or `compoundVariants` instead of inline ternaries.
- Pair interactive elements with focus-visible outlines matching the design token palette.

## 2. File Layout & Naming
- Shared primitives live in `src/design-system/components`. Export each from the barrel (`src/design-system/index.ts`).
- Feature implementations live in `src/domains/<domain>/` alongside their state/utilities.
- Routes go in `src/routes/`. Default export the page component; co-locate ancillary hooks/components.
- New components ship as `PascalCase.tsx` with Tailwind utilities—no standalone CSS modules.

## 3. Component Pattern
```ts
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-heading shadow-floating hover:brightness-105',
        secondary: 'bg-surface border border-surface-outline hover:bg-surface-soft',
        ghost: 'bg-transparent hover:bg-surface-soft border border-transparent',
      },
      size: {
        default: 'tap-target text-lg',
        compact: 'h-12 px-6 text-base',
      },
      fullWidth: {
        true: 'w-full justify-center',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      fullWidth: false,
    },
  },
);

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button: Component<ButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'variant', 'size', 'fullWidth', 'children']);
  return (
    <button class={cn(buttonVariants({ variant: local.variant, size: local.size, fullWidth: local.fullWidth }), local.class)} {...rest}>
      {local.children}
    </button>
  );
};
```
- Declare variants before the component.
- Use `splitProps` to forward the rest of the HTML attributes.
- Consume the variant props via `VariantProps<typeof buttonVariants>`.
- Add compound variants when two states share styling.

## 4. Kobalte Usage
- Wrap primitives in design-system components so consumers call `<ToastProvider>` rather than Kobalte APIs.
- Keep global providers (Auth, Toast) in `src/providers/`.
- When adding new primitives (e.g. dialogs), export a thin wrapper that applies Tailwind/CVA variants before exposing Kobalte’s surface.

## 5. Dev-Only Tooling
- `solid-devtools` should only load during development. Gate imports via `if (import.meta.env.DEV) { await import('solid-devtools'); }`.
- Vite plugin registration must also check the mode (e.g. `mode === 'development' && devtools()`).
- Never ship dev-only styles or scripts to production bundles.

## 6. Routing & Layout
- Global shells (`App.tsx`) own layout, theming, and providers. Pages (`src/routes/*`) stay focused on data + composition.
- Use `PageSection` for consistent gutters. Pass `bleed` when we need edge-to-edge sections.
- Domain components (e.g. lesson canvas) provide their own surface but rely on shared design tokens (CSS variables in `globals.css`).

## 7. Authoring vs. Runtime
- Runtime (`/lesson`, `/unit`) components live under `src/domains/curriculum/components`.
- Editor-specific views stay in `src/routes/editor/components` and reuse the same design-system primitives.
- Shared data/state (`lessonEditor`, inventory utils) is domain-level and independent of Solid components where possible.

## 8. Lint Checklist Before Merge
- `pnpm --filter @monte/frontend lint`
- `pnpm --filter @monte/frontend typecheck`
- `pnpm --filter @monte/frontend build`
- Spot-check bundle analyzer output if a change touches the design system to prevent regressions.

Keeping to these conventions means anyone new to the repo can trace a pattern, reuse it, and stay within the playground lines we’ve set for the MVP. Update this file whenever we add a sanctioned pattern or deprecate one.
