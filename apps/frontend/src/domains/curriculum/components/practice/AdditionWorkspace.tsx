import { createEffect, createMemo, createSignal } from 'solid-js';
import { NumberRod } from '../../components/materials/NumberRod';
import { ColoredBeadStair } from '../../components/materials/ColoredBeadStair';
import type { PracticeQuestion } from '@monte/types';
import { Card, Chip } from '../../../../design-system';

export interface AdditionWorkspaceState {
  kind: 'addition';
  first: number;
  second: number;
  sum: number;
}

interface AdditionWorkspaceProps {
  question: PracticeQuestion;
  materialId: string;
  onStateChange?: (state: AdditionWorkspaceState) => void;
}

const beadColors = ['#ffffff', '#ff0000', '#00a651', '#ffdd00', '#0066cc', '#ff69b4', '#964B00', '#800080', '#ff7f00'];
const clampAddend = (value: number) => Math.max(0, Math.min(value, 10));

const parseAddends = (prompt: string): [number, number] | undefined => {
  const matches = prompt.match(/\d+/g);
  if (!matches || matches.length < 2) return undefined;
  const [a, b] = matches.slice(0, 2).map((value) => clampAddend(Number(value)));
  if (Number.isNaN(a) || Number.isNaN(b)) return undefined;
  return [a, b];
};

export const AdditionWorkspace = (props: AdditionWorkspaceProps) => {
  const defaults = parseAddends(props.question.prompt) ?? [2, 3];
  const [first, setFirst] = createSignal(defaults[0]);
  const [second, setSecond] = createSignal(defaults[1]);
  const sum = createMemo(() => clampAddend(first() + second()));
  const beadValues = Array.from({ length: 10 }, (_, index) => index);

  const emitState = (nextFirst: number, nextSecond: number) => {
    props.onStateChange?.({
      kind: 'addition',
      first: clampAddend(nextFirst),
      second: clampAddend(nextSecond),
      sum: clampAddend(nextFirst + nextSecond),
    });
  };

  createEffect(() => {
    emitState(first(), second());
  });

  const handleSelect = (slot: 'first' | 'second', value: number) => {
    const clamped = clampAddend(value);
    if (slot === 'first') {
      setFirst(clamped);
      emitState(clamped, second());
      return;
    }
    setSecond(clamped);
    emitState(first(), clamped);
  };

  const renderBeadBar = (value: number) => {
    if (value === 0) {
      return <span class="text-xs font-medium text-subtle">0</span>;
    }

    const color = beadColors[(value - 1) % beadColors.length] ?? '#ffffff';
    return (
      <div class="flex items-center gap-1">
        <div class="flex gap-0.5">
          {Array.from({ length: value }).map((_, _index) => (
            <span
              class="h-2.5 w-2.5 rounded-full border border-[rgba(12,42,101,0.2)]"
              style={{ background: color, opacity: 0.95 }}
            />
          ))}
        </div>
        <span class="text-[10px] text-subtle">{value}</span>
      </div>
    );
  };

  const renderMaterial = () => {
    switch (props.materialId) {
      case 'colored-bead-stair':
        return <ColoredBeadStair highlight={sum()} />;
      case 'number-rods':
        return (
          <div class="flex flex-col gap-2">
            <NumberRod length={first()} />
            <NumberRod length={second()} />
            <NumberRod class="opacity-80" length={sum()} />
          </div>
        );
      case 'addition-strip-board':
        return (
          <div class="flex flex-col gap-2">
            <p class="text-xs text-subtle">Imagine placing a red strip of {first()} and a blue strip of {second()}.</p>
            <NumberRod length={sum()} />
          </div>
        );
      default:
        return <p class="text-xs text-subtle">Use this space to model the addition with your chosen material.</p>;
    }
  };

  return (
    <Card variant="soft" class="flex flex-col gap-4 p-4 sm:p-5 text-sm text-[color:var(--color-text)]">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <Chip tone="primary" size="sm">
          Interactive workspace
        </Chip>
        <Chip tone="blue" size="sm">
          {first()} + {second()} = {sum()}
        </Chip>
      </div>

      {props.materialId === 'colored-bead-stair' ? (
        <div class="flex flex-col gap-3 text-xs">
          <p class="text-subtle">Tap a bead bar for each addend.</p>
          <div class="flex flex-col gap-3">
            <div class="space-y-2">
              <p class="text-[10px] uppercase tracking-wide text-label-soft">First addend</p>
              <div class="flex flex-wrap gap-1.5">
                {beadValues.map((value) => {
                  const selected = first() === value;
                  return (
                    <button
                      type="button"
                      class={`flex items-center gap-1 rounded-[var(--radius-sm)] px-3 py-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:rgba(24,191,151,0.55)] ${
                        selected
                          ? 'surface-success text-[#0f6a53]'
                          : 'surface-neutral text-subtle hover:shadow-ambient'
                      }`}
                      onClick={() => handleSelect('first', value)}
                      aria-pressed={selected}
                      aria-label={`First addend ${value}`}
                    >
                      {renderBeadBar(value)}
                    </button>
                  );
                })}
              </div>
            </div>
            <div class="space-y-2">
              <p class="text-[10px] uppercase tracking-wide text-label-soft">Second addend</p>
              <div class="flex flex-wrap gap-1.5">
                {beadValues.map((value) => {
                  const selected = second() === value;
                  return (
                    <button
                      type="button"
                      class={`flex items-center gap-1 rounded-[var(--radius-sm)] px-3 py-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:rgba(24,191,151,0.55)] ${
                        selected
                          ? 'surface-success text-[#0f6a53]'
                          : 'surface-neutral text-subtle hover:shadow-ambient'
                      }`}
                      onClick={() => handleSelect('second', value)}
                      aria-pressed={selected}
                      aria-label={`Second addend ${value}`}
                    >
                      {renderBeadBar(value)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div class="flex flex-wrap items-center gap-4 text-xs">
          <label class="flex items-center gap-2 text-subtle">
            First addend
            <input
              type="number"
              min="0"
              max="10"
              value={first()}
              class="w-20 rounded-full border border-[rgba(64,157,233,0.3)] bg-white px-3 py-1.5 text-sm font-semibold text-[color:var(--color-text)] shadow-ambient focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:rgba(64,157,233,0.55)]"
              onInput={(event) => {
                const value = clampAddend(Number(event.currentTarget.value));
                setFirst(value);
                emitState(value, second());
              }}
            />
          </label>
          <label class="flex items-center gap-2 text-subtle">
            Second addend
            <input
              type="number"
              min="0"
              max="10"
              value={second()}
              class="w-20 rounded-full border border-[rgba(64,157,233,0.3)] bg-white px-3 py-1.5 text-sm font-semibold text-[color:var(--color-text)] shadow-ambient focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:rgba(64,157,233,0.55)]"
              onInput={(event) => {
                const value = clampAddend(Number(event.currentTarget.value));
                setSecond(value);
                emitState(first(), value);
              }}
            />
          </label>
        </div>
      )}

      <div class="rounded-full bg-[rgba(140,204,212,0.25)] px-4 py-2 text-sm font-semibold text-[color:var(--color-heading)]">
        {first()} + {second()} = {sum()}
      </div>

      <div>{renderMaterial()}</div>
    </Card>
  );
};
