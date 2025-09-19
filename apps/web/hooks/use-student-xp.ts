import { useQuery } from "@tanstack/react-query";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useMemo } from "react";

import { getStudentXpSummary } from "@/lib/api/endpoints";

export type XpRange = "daily" | "weekly" | "monthly";

type DateRange = {
  start: Date;
  end: Date;
};

function resolveRange(range: XpRange, reference: Date = new Date()): DateRange {
  switch (range) {
    case "weekly": {
      const start = startOfWeek(reference, { weekStartsOn: 0 });
      const end = endOfWeek(reference, { weekStartsOn: 0 });
      return { start, end };
    }
    case "monthly": {
      const start = startOfMonth(reference);
      const end = endOfMonth(reference);
      return { start, end };
    }
    case "daily":
    default: {
      const start = startOfDay(reference);
      const end = endOfDay(reference);
      return { start, end };
    }
  }
}

function toIsoStringWithOffset(date: Date): string {
  return date.toISOString();
}

export function useStudentXp(studentId: string | null, range: XpRange) {
  const { start, end } = useMemo(() => resolveRange(range), [range]);

  const startTime = useMemo(() => toIsoStringWithOffset(start), [start]);
  const endTime = useMemo(() => toIsoStringWithOffset(end), [end]);

  const query = useQuery({
    queryKey: ["student-xp", { studentId, range, startTime, endTime }],
    enabled: Boolean(studentId),
    queryFn: async () => {
      if (!studentId) {
        return null;
      }

      return getStudentXpSummary(
        {
          studentId,
          startTime,
          endTime,
        },
        {},
      );
    },
  });

  return {
    ...query,
    rangeStart: start,
    rangeEnd: end,
  };
}
