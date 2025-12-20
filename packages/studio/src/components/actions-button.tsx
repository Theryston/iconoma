import { useActions } from "../hooks/actions";
import { Button } from "@iconoma/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@iconoma/ui/components/popover";
import { Badge } from "@iconoma/ui/components/badge";
import { ScrollArea } from "@iconoma/ui/components/scroll-area";
import { cn } from "@iconoma/ui/lib/utils";
import type { ActionModel } from "../../api/types";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";

type ActionWithId = ActionModel & { id: number };

function getActionMessage(action: ActionWithId): string {
  switch (action.type) {
    case "MIGRATE_SVG_TO_LOCK":
      return `Migrate SVG to lock for ${action.metadata && "iconKey" in action.metadata ? (action.metadata as { iconKey: string }).iconKey : "icon"}`;
    case "MIGRATE_SVG_TO_FILE":
      return `Create SVG file for ${action.iconKey || "icon"}`;
    case "ADD_EXTRA_TARGET":
      return `Add target ${action.targetId || ""} for ${action.iconKey || "icon"}`;
    case "REMOVE_EXTRA_TARGET":
      return `Remove target ${action.targetId || ""} for ${action.iconKey || "icon"}`;
    case "CREATE_ICON":
      return `Create icon ${action.iconKey || "icon"}`;
    case "REMOVE_ICON":
      return `Remove icon ${action.iconKey || "icon"}`;
    case "REGENERATE_ICON":
      return `Regenerate icon ${action.iconKey || "icon"}`;
    case "REGENERATE_ALL":
      return "Regenerate all icons";
    default:
      return "Unknown action";
  }
}

function getStatusIcon(status: ActionModel["status"]) {
  switch (status) {
    case "pending":
      return Clock;
    case "processing":
      return Loader2;
    case "completed":
      return CheckCircle2;
    case "failed":
      return XCircle;
  }
}

function getStatusVariant(
  status: ActionModel["status"]
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "pending":
      return "outline";
    case "processing":
      return "default";
    case "completed":
      return "secondary";
    case "failed":
      return "destructive";
  }
}

function getStatusLabel(status: ActionModel["status"]): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
  }
}

function ActionItem({ action }: { action: ActionWithId }) {
  const StatusIcon = getStatusIcon(action.status);
  const message = getActionMessage(action);
  const variant = getStatusVariant(action.status);
  const label = getStatusLabel(action.status);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-3 rounded-lg border transition-colors w-full min-w-0",
        "hover:bg-accent/50",
        action.status === "failed" && "border-destructive/50 bg-destructive/5"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium flex-1">{message}</p>
        <Badge variant={variant} className="shrink-0">
          <StatusIcon
            className={cn(
              "size-3",
              action.status === "processing" && "animate-spin"
            )}
          />
          {label}
        </Badge>
      </div>

      {action.percentage > 0 && action.status === "processing" && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{action.percentage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${action.percentage}%` }}
            />
          </div>
        </div>
      )}

      {action.status === "failed" && action.error && (
        <div className="mt-1 min-w-0 w-full">
          <p
            className="text-xs text-destructive break-words whitespace-pre-wrap"
            style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
          >
            {action.error}
          </p>
        </div>
      )}
    </div>
  );
}

export function ActionsButton() {
  const { data, isLoading } = useActions();
  const [visibleCount, setVisibleCount] = useState(10);

  const actions = useMemo(() => {
    if (!data?.actions || !Array.isArray(data.actions)) {
      return [];
    }

    const allActions = data.actions as ActionWithId[];

    const completedOrFailed = allActions.filter(
      (a) => a.status === "completed" || a.status === "failed"
    );
    const pendingOrProcessing = allActions.filter(
      (a) => a.status === "pending" || a.status === "processing"
    );

    const sortedCompletedOrFailed = completedOrFailed.sort(
      (a, b) => b.id - a.id
    );
    const sortedPendingOrProcessing = pendingOrProcessing.sort(
      (a, b) => b.id - a.id
    );

    return [...sortedPendingOrProcessing, ...sortedCompletedOrFailed];
  }, [data]);

  const activeActionsCount = useMemo(() => {
    if (!data?.actions || !Array.isArray(data.actions)) {
      return 0;
    }
    return (data.actions as ActionWithId[]).filter(
      (a) => a.status === "pending" || a.status === "processing"
    ).length;
  }, [data]);

  useEffect(() => {
    setVisibleCount(10);
  }, [actions.length]);

  const visibleActions = actions.slice(0, visibleCount);
  const hasMore = visibleCount < actions.length;
  const remainingCount = actions.length - visibleCount;

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + 10, actions.length));
  };

  if (isLoading || !actions || actions.length === 0) {
    return null;
  }

  const hasActiveActions = activeActionsCount > 0;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="secondary"
            className={cn("rounded-full", hasActiveActions && "animate-pulse")}
          >
            <img src="/icon.png" alt="Iconoma Logo" className="size-5" />
            <span className="text-xs">
              {hasActiveActions
                ? "Something happening (don't stop the studio)"
                : "Actions history"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="top"
          className="w-[400px] p-0"
          sideOffset={12}
        >
          <div className="p-4 border-b">
            <h3 className="font-semibold text-sm">Actions</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {activeActionsCount > 0
                ? `${activeActionsCount} active action${activeActionsCount !== 1 ? "s" : ""}`
                : "No active actions"}
            </p>
          </div>
          <ScrollArea className="h-[60vh] w-full">
            <div className="p-4 space-y-2 w-full min-w-0">
              {visibleActions.map((action) => (
                <ActionItem key={action.id} action={action} />
              ))}
              {actions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No actions to display
                </p>
              )}
              {hasMore && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShowMore}
                  className="w-full mt-1"
                >
                  <ChevronDown className="size-4 mr-2" />
                  Show more ({remainingCount} remaining)
                </Button>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
