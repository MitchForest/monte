import type { Role } from "@monte/shared";

import type { ImpersonationSelection } from "@/lib/impersonation/store";

export type Persona = "student" | "parent" | "guide" | "admin";

export function resolvePersona(
  role: Role | undefined,
  selection: ImpersonationSelection,
): Persona {
  switch (selection.kind) {
    case "student":
      return "student";
    case "parent":
      return "parent";
    case "guide":
      return "guide";
    default:
      break;
  }

  if (role === "student") {
    return "student";
  }
  if (role === "parent") {
    return "parent";
  }
  if (role === "administrator") {
    return "admin";
  }

  return "guide";
}

export function isGuidePersona(persona: Persona): boolean {
  return persona === "guide" || persona === "admin";
}
