"use client";

import { useMemo } from "react";

import type { ImpersonationSelection } from "@/lib/impersonation/store";
import { useImpersonationContext } from "@/components/providers/impersonation-provider";

export function useImpersonation() {
  const context = useImpersonationContext();

  const selectionWithMeta = useMemo(() => {
    return context.selection;
  }, [context.selection]);

  const setSelection = (selection: ImpersonationSelection) => {
    context.updateSelection(selection);
  };

  return {
    selection: selectionWithMeta,
    isImpersonating: context.isImpersonating,
    setSelection,
    reset: context.reset,
  };
}
