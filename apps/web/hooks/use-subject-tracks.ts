import { useQuery } from "@tanstack/react-query";

import { listSubjectTracks } from "@/lib/api/endpoints";

export const subjectTracksQueryKey = () => ["edubridge", "subject-tracks"];

export function useSubjectTracks(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: subjectTracksQueryKey(),
    enabled: options?.enabled ?? true,
    queryFn: ({ signal }) => listSubjectTracks({ signal }),
  });
}
