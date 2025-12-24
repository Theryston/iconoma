import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { LockFileIcon } from "../../api/types";

export function useCreateIcon() {
  const queryClient = useQueryClient();

  return useMutation<
    { icon: LockFileIcon; componentName: string },
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["icons"] });
      const iconKey = data.icon.name.toLowerCase().replace(/ /g, "-");
      queryClient.invalidateQueries({ queryKey: ["icon", iconKey] });
    },
  });
}

export function useIcons() {
  return useQuery<
    {
      icons: Array<{
        iconKey: string;
        icon: LockFileIcon;
        svgContent: string;
        componentName: string;
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
    { icon: LockFileIcon; componentName: string; svgContent: string },
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
