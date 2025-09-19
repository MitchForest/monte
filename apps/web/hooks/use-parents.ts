"use client";

import { useQuery } from "@tanstack/react-query";

import { listParents } from "@/lib/api/endpoints";

export function useParents() {
  return useQuery({
    queryKey: ["parents", { scope: "guide" }],
    queryFn: ({ signal }) => listParents({ signal }),
  });
}
