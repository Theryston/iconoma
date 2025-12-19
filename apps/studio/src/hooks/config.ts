import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Config } from "../components/config-modal/schema";
import type { Change } from "../../api/types";
import axios from "axios";

export function useConfig() {
  return useQuery({
    queryKey: ["config"],
    queryFn: () => axios.get("/api/config").then((res) => res.data),
  });
}

export function useConfigChanges() {
  return useMutation<{ changes: Change[] }, Error, Config>({
    mutationFn: (config: Config) =>
      axios.post("/api/config/changes", config).then((res) => res.data),
  });
}

export function useSetConfig() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean },
    Error,
    { config: Config; changes: Change[] }
  >({
    mutationFn: (data: { config: Config; changes: Change[] }) =>
      axios.post("/api/config", data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });
}
