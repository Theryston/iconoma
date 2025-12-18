import { useUncommittedChanges } from "../../hooks/commit";
import { Button } from "@iconoma/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@iconoma/ui/components/tooltip";
import { GitBranch } from "lucide-react";

export function CommitButton() {
  const { data: uncommittedChanges } = useUncommittedChanges();

  return (
    <Tooltip>
      <TooltipTrigger>
        <Button size="sm" disabled={uncommittedChanges?.changes.length === 0}>
          <GitBranch />
          <span className="text-sm font-medium">Commit changes</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {uncommittedChanges?.changes.length === 0
          ? "No changes to commit"
          : "Commit all icons changes"}
      </TooltipContent>
    </Tooltip>
  );
}
