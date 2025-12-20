import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function usePwd() {
  return useQuery({
    queryKey: ["pwd"],
    queryFn: () => axios.get("/api/pwd").then((res) => res.data),
  });
}
