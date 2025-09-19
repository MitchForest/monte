"use client";

import { useMemo } from "react";
import { useImpersonationContext } from "@/components/providers/impersonation-provider";
import type { ImpersonationSelection } from "@/lib/impersonation/store";

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
