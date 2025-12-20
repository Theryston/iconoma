import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useActions() {
  return useQuery({
    queryKey: ["actions"],
    queryFn: () => axios.get("/api/actions").then((res) => res.data),
    refetchInterval: 1000,
  });
}
