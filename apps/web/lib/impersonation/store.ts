export type ImpersonationSelection =
  | { kind: "self" }
  | { kind: "student"; studentId: string }
  | { kind: "guide"; guideId: string }
  | { kind: "parent"; parentId: string; studentId: string };

let currentSelection: ImpersonationSelection = { kind: "self" };

export function setImpersonationSelection(selection: ImpersonationSelection) {
  currentSelection = selection;
}

export function getImpersonationSelection(): ImpersonationSelection {
  return currentSelection;
}
