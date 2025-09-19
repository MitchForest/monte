import { format } from "date-fns";
import { CircleDot, Loader2 } from "lucide-react";

export type GuideScheduleItem = {
  id: string;
  title: string;
  type: "lesson" | "task";
  studentId?: string | null;
  dueTime: string | null;
};

export function ScheduleTimeline({
  items,
  isLoading,
  resolveStudentName,
}: {
  items: GuideScheduleItem[];
  isLoading: boolean;
  resolveStudentName: (id: string | null | undefined) => string | null;
}) {
  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2
          aria-hidden="true"
          className="size-6 animate-spin text-muted-foreground"
        />
        <span className="sr-only">Loading schedule</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-background/70 p-6 text-sm text-muted-foreground">
        Nothing scheduled yet. Add a lesson or task to get started.
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => {
    if (!a.dueTime && !b.dueTime) {
      return 0;
    }
    if (!a.dueTime) {
      return 1;
    }
    if (!b.dueTime) {
      return -1;
    }
    return new Date(a.dueTime).getTime() - new Date(b.dueTime).getTime();
  });

  return (
    <ol className="flex flex-col gap-4">
      {sorted.map((item, index) => {
        const studentName = resolveStudentName(item.studentId);
        const isLast = index === sorted.length - 1;
        const timeLabel = item.dueTime
          ? format(new Date(item.dueTime), "p")
          : "Anytime";

        return (
          <li className="grid grid-cols-[auto_1fr] gap-4" key={item.id}>
            <div className="relative flex h-full flex-col items-center">
              <time className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {timeLabel}
              </time>
              <span className="mt-3 flex size-2 items-center justify-center rounded-full border border-primary/60 bg-primary/50" />
              {!isLast ? (
                <span
                  className="mt-3 w-px flex-1 bg-border"
                  aria-hidden="true"
                />
              ) : null}
            </div>
            <div className="flex flex-col justify-center gap-2 rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CircleDot
                    aria-hidden="true"
                    className="size-4 text-primary"
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {item.title}
                  </span>
                </div>
                <span className="rounded-full border border-border/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                  {item.type === "lesson" ? "Lesson" : "Task"}
                </span>
              </div>
              {studentName ? (
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {studentName}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
