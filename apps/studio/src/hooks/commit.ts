import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useUncommittedChanges() {
  return useQuery({
    queryKey: ["uncommitted-changes"],
    queryFn: () => axios.get("/api/commit/changes").then((res) => res.data),
  });
}
