import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { LockFileIcon } from "../../api/types";

export function useCreateIcon() {
  return useMutation<
    { icon: LockFileIcon; pascalName: string },
    Error,
    {
      name: string;
      tags: string[];
      content: string;
      colorMap?: Record<string, string>;
    }
  >({
    mutationFn: (data: {
      name: string;
      tags: string[];
      content: string;
      colorMap?: Record<string, string>;
    }) => axios.post("/api/icons/create", data).then((res) => res.data),
  });
}

export function useIcons() {
  return useQuery<
    {
      icons: Array<{
        iconKey: string;
        icon: LockFileIcon;
        svgContent: string;
        pascalName: string;
      }>;
    },
    Error
  >({
    queryKey: ["icons"],
    queryFn: () => axios.get("/api/icons").then((res) => res.data),
  });
}

export function useIcon(iconKey: string) {
  return useQuery<
    { icon: LockFileIcon; pascalName: string; svgContent: string },
    Error
  >({
    queryKey: ["icon", iconKey],
    queryFn: () => axios.get(`/api/icons/${iconKey}`).then((res) => res.data),
    enabled: !!iconKey,
  });
}

export function useDeleteIcon() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (iconKey: string) =>
      axios.delete(`/api/icons/${iconKey}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["icons"] });
    },
  });
}
