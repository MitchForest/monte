"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { IMPERSONATION_STORAGE_KEY } from "@/lib/impersonation/constants";
import {
  getImpersonationSelection,
  type ImpersonationSelection,
  setImpersonationSelection,
} from "@/lib/impersonation/store";

export type ImpersonationContextValue = {
  selection: ImpersonationSelection;
  isImpersonating: boolean;
  updateSelection: (selection: ImpersonationSelection) => void;
  reset: () => void;
};

const ImpersonationContext = createContext<ImpersonationContextValue | null>(
  null,
);

type ProviderProps = {
  children: React.ReactNode;
};

function readStoredSelection(): ImpersonationSelection {
  if (typeof window === "undefined") {
    return { kind: "self" };
  }
  const raw = window.localStorage.getItem(IMPERSONATION_STORAGE_KEY);
  if (!raw) {
    return { kind: "self" };
  }
  try {
    const parsed = JSON.parse(raw) as ImpersonationSelection;
    if (!parsed || typeof parsed !== "object" || parsed.kind === undefined) {
      return { kind: "self" };
    }
    return parsed;
  } catch {
    return { kind: "self" };
  }
}

export function ImpersonationProvider({ children }: ProviderProps) {
  const [selection, setSelectionState] = useState<ImpersonationSelection>(() =>
    getImpersonationSelection(),
  );

  useEffect(() => {
    const initial = readStoredSelection();
    setSelectionState(initial);
    setImpersonationSelection(initial);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(
      IMPERSONATION_STORAGE_KEY,
      JSON.stringify(selection),
    );
    setImpersonationSelection(selection);
  }, [selection]);

  const value = useMemo<ImpersonationContextValue>(
    () => ({
      selection,
      isImpersonating: selection.kind !== "self",
      updateSelection: (next) => {
        setSelectionState(next);
      },
      reset: () => {
        setSelectionState({ kind: "self" });
      },
    }),
    [selection],
  );

  return (
    <ImpersonationContext.Provider value={value}>
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonationContext(): ImpersonationContextValue {
  const context = useContext(ImpersonationContext);
  if (!context) {
    throw new Error(
      "useImpersonationContext must be used within ImpersonationProvider",
    );
  }
  return context;
}
