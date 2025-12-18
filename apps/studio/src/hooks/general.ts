import { useQuery } from "@tanstack/react-query";

export function usePwd() {
  return useQuery({
    queryKey: ["pwd"],
    queryFn: () => fetch("/api/pwd").then((res) => res.json()),
  });
}
