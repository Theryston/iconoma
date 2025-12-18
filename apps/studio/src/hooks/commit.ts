import { useQuery } from "@tanstack/react-query";

export function useUncommittedChanges() {
  return useQuery({
    queryKey: ["uncommitted-changes"],
    queryFn: () => fetch("/api/commit/changes").then((res) => res.json()),
  });
}
