import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import type { LockFileIcon } from "../../api/types";

export function useCreateIcon() {
  return useMutation<
    { icon: LockFileIcon; pascalName: string },
    Error,
    { name: string; tags: string[]; content: string }
  >({
    mutationFn: (data: { name: string; tags: string[]; content: string }) =>
      axios.post("/api/icons/create", data).then((res) => res.data),
  });
}
