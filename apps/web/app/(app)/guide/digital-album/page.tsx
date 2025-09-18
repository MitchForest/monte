"use client";

import { useQuery } from "@tanstack/react-query";
import { Library, NotebookTabs, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppPageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  listClassAreas,
  listCourses,
  listMaterials,
} from "@/lib/api/endpoints";

export default function DigitalAlbumPage() {
  const areasQuery = useQuery({
    queryKey: ["curriculum", "areas"],
    queryFn: () => listClassAreas(),
  });

  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedAreaId && areasQuery.data && areasQuery.data.length > 0) {
      setSelectedAreaId(areasQuery.data[0]?.id ?? null);
    }
  }, [areasQuery.data, selectedAreaId]);

  const coursesQuery = useQuery({
    queryKey: ["curriculum", "courses", selectedAreaId],
    queryFn: () =>
      selectedAreaId
        ? listCourses({ subjectId: selectedAreaId })
        : listCourses(),
    enabled: Boolean(selectedAreaId),
  });

  const materialsQuery = useQuery({
    queryKey: ["curriculum", "materials", selectedAreaId],
    queryFn: () => listMaterials(),
    enabled: Boolean(selectedAreaId),
  });

  const areas = areasQuery.data ?? [];
  const selectedArea = useMemo(() => {
    return (
      areas.find((area) => area.id === selectedAreaId) ?? areas.at(0) ?? null
    );
  }, [areas, selectedAreaId]);

  const materials = materialsQuery.data ?? [];
  const courses = coursesQuery.data ?? [];
  const lessonOptions = useMemo(
    () =>
      (courses.length > 0
        ? courses.map((course) => ({
            id: course.id,
            label: course.name,
          }))
        : materials.slice(0, 8).map((material) => ({
            id: material.id ?? material.name,
            label: material.name ?? "Material",
          }))) ?? [],
    [courses, materials],
  );

  return (
    <div className="flex flex-1 flex-col gap-8">
      <AppPageHeader
        breadcrumbs={[{ label: "Guide" }, { label: "Digital album" }]}
        description="Curate Montessori materials and assign them to students in a few clicks."
        title="Digital album"
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Library className="size-5 text-primary" /> Montessori areas
            </CardTitle>
            <CardDescription>
              Browse albums and select materials for follow-up lessons.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {areas.map((area) => (
              <button
                className={`flex flex-col gap-1 rounded-2xl border px-4 py-3 text-left transition ${
                  selectedArea?.id === area.id
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border/60 bg-background/80 text-muted-foreground"
                }`}
                key={area.id}
                type="button"
                onClick={() => setSelectedAreaId(area.id)}
              >
                <span className="text-sm font-medium text-foreground">
                  {area.name}
                </span>
                <span className="text-xs uppercase tracking-[0.2em]">
                  {area.id === selectedArea?.id
                    ? "Selected"
                    : "Explore prepared environment"}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <NotebookTabs className="size-5 text-primary" />
                {selectedArea?.name ?? "Curriculum"}
              </CardTitle>
              <CardDescription>
                Select lessons to build a custom storyline for a student or
                small group.
              </CardDescription>
            </div>
            <Button size="sm" className="rounded-full gap-2" type="button">
              <Plus className="size-4" /> Add to plan
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3">
            {lessonOptions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border/60 bg-background/70 px-4 py-6 text-sm text-muted-foreground">
                No lessons available for this area yet.
              </p>
            ) : (
              lessonOptions.map((lesson) => {
                const identifier = lesson.id ?? lesson.label;
                const isSelected = identifier
                  ? selectedLessons.includes(identifier)
                  : false;
                return (
                  <button
                    key={identifier ?? lesson.label}
                    type="button"
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border/60 bg-background/70 text-muted-foreground"
                    }`}
                    onClick={() =>
                      setSelectedLessons((current) =>
                        !identifier
                          ? current
                          : isSelected
                            ? current.filter((item) => item !== identifier)
                            : [...current, identifier],
                      )
                    }
                  >
                    <span className="text-sm font-medium text-foreground">
                      {lesson.label}
                    </span>
                    <span className="text-xs uppercase tracking-[0.2em]">
                      {isSelected ? "Selected" : "Tap to include"}
                    </span>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
