import { Button } from "@iconoma/ui/components/button";
import { Badge } from "@iconoma/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@iconoma/ui/components/card";
import { cn } from "@iconoma/ui/lib/utils";
import {
  FilePlus,
  Plus,
  Minus,
  Edit,
  RefreshCw,
  ArrowLeft,
  ChevronDown,
  FileText,
} from "lucide-react";
import type { Change } from "../../../../api/types";
import type { Config } from "../schema";
import { useSetConfig } from "../../../hooks/config";
import { toast } from "@iconoma/ui/components/sonner";
import { AVAILABLE_TARGETS } from "../../../constants";
import { ScrollArea } from "@iconoma/ui/components/scroll-area";
import { useState } from "react";

type ChangeType = Change["type"];

interface ChangeGroup {
  type: ChangeType;
  changes: Change[];
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "destructive" | "default" | "secondary" | "outline";
  colorClass: string;
}

const changeTypeConfig: Record<ChangeType, Omit<ChangeGroup, "changes">> = {
  MIGRATE_SVG_TO_LOCK: {
    type: "MIGRATE_SVG_TO_LOCK",
    label: "SVG to Lock",
    description: "These SVG files will be migrated to the lock file",
    icon: FileText,
    variant: "default",
    colorClass: "text-green-600 dark:text-green-400",
  },
  MIGRATE_SVG_TO_FILE: {
    type: "MIGRATE_SVG_TO_FILE",
    label: "SVG to File",
    description: "These SVG files will be migrated to the file system",
    icon: FilePlus,
    variant: "default",
    colorClass: "text-green-600 dark:text-green-400",
  },
  ADD_EXTRA_TARGET: {
    type: "ADD_EXTRA_TARGET",
    label: "Targets to Add",
    description: "New target files will be generated",
    icon: Plus,
    variant: "default",
    colorClass: "text-primary",
  },
  REMOVE_EXTRA_TARGET: {
    type: "REMOVE_EXTRA_TARGET",
    label: "Targets to Remove",
    description: "These target files will be deleted",
    icon: Minus,
    variant: "secondary",
    colorClass: "text-orange-600 dark:text-orange-400",
  },

  REGENERATE_ALL: {
    type: "REGENERATE_ALL",
    label: "Regenerate all",
    description: "All SVG and target files will be regenerated",
    icon: RefreshCw,
    variant: "outline",
    colorClass: "text-cyan-600 dark:text-cyan-400",
  },
};

function groupChangesByType(changes: Change[]): ChangeGroup[] {
  const groups = new Map<ChangeType, Change[]>();

  for (const change of changes) {
    if (!groups.has(change.type)) {
      groups.set(change.type, []);
    }
    groups.get(change.type)!.push(change);
  }

  return Array.from(groups.entries())
    .map(([type, changes]) => ({
      ...changeTypeConfig[type],
      changes,
    }))
    .sort((a, b) => a.changes.length - b.changes.length);
}

function getTargetName(targetId: string): string {
  const target = AVAILABLE_TARGETS.find((t) => t.id === targetId);
  return target?.name || targetId;
}

function ChangeGroupList({ group }: { group: ChangeGroup }) {
  const [visibleCount, setVisibleCount] = useState(10);
  const totalCount = group.changes.length;
  const visibleChanges = group.changes.slice(0, visibleCount);
  const hasMore = visibleCount < totalCount;

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + 10, totalCount));
  };

  return (
    <div className="flex flex-col gap-2">
      {group.type === "MIGRATE_SVG_TO_LOCK" &&
        visibleChanges.map((change, index) => (
          <div
            key={index}
            className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm font-mono"
          >
            <FileText className="size-3.5 text-green-600 dark:text-green-400 shrink-0" />
            <span className="truncate">{change.filePath}</span>
          </div>
        ))}

      {group.type === "MIGRATE_SVG_TO_FILE" &&
        visibleChanges.map((change, index) => (
          <div
            key={index}
            className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm font-mono"
          >
            <FilePlus className="size-3.5 text-green-600 dark:text-green-400 shrink-0" />
            <span className="truncate">{change.filePath}</span>
            {change.iconKey && (
              <Badge variant="outline" className="ml-auto shrink-0">
                {change.iconKey}
              </Badge>
            )}
          </div>
        ))}

      {(group.type === "ADD_EXTRA_TARGET" ||
        group.type === "REMOVE_EXTRA_TARGET") &&
        visibleChanges.map((change, index) => (
          <div
            key={index}
            className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2"
          >
            {group.type === "ADD_EXTRA_TARGET" && (
              <Plus className="size-3.5 text-primary shrink-0" />
            )}
            {group.type === "REMOVE_EXTRA_TARGET" && (
              <Minus className="size-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
            )}
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-sm font-medium">
                {change.targetId && getTargetName(change.targetId)}
              </span>
              <span className="text-xs font-mono text-muted-foreground truncate">
                {change.filePath}
              </span>
            </div>
            {change.iconKey && (
              <Badge variant="outline" className="shrink-0">
                {change.iconKey}
              </Badge>
            )}
          </div>
        ))}

      {group.type === "REGENERATE_ALL" && (
        <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
          <group.icon className={cn("size-4 shrink-0", group.colorClass)} />
          <span>{group.description}</span>
        </div>
      )}

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShowMore}
          className="w-full mt-1"
        >
          <ChevronDown className="size-4 mr-2" />
          Show more ({totalCount - visibleCount} remaining)
        </Button>
      )}
    </div>
  );
}

export function ConfigChangesStep({
  changes,
  config,
  onConfirm,
  onBack,
}: {
  changes: Change[];
  config: Config;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const setConfig = useSetConfig();
  const groupedChanges = groupChangesByType(changes);

  const handleConfirm = async () => {
    try {
      await setConfig.mutateAsync({
        config,
        changes,
      });
      toast.success("Configuration saved successfully");
      onConfirm();
    } catch (error) {
      toast.error("Failed to save configuration. Please try again.");
      console.error("Error saving config:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ScrollArea className="max-h-[60vh]">
        <div className="flex flex-col gap-3 ">
          {groupedChanges.map((group) => {
            const Icon = group.icon;
            const count = group.changes.length;

            return (
              <Card
                key={group.type}
                className={cn(
                  "border-l-4",
                  group.type === "MIGRATE_SVG_TO_LOCK" &&
                    "border-l-green-600 dark:border-l-green-400",
                  group.type === "MIGRATE_SVG_TO_FILE" &&
                    "border-l-green-600 dark:border-l-green-400",
                  group.type === "ADD_EXTRA_TARGET" && "border-l-primary",
                  group.type === "REMOVE_EXTRA_TARGET" &&
                    "border-l-orange-600 dark:border-l-orange-400",
                  group.type === "REGENERATE_ALL" &&
                    "border-l-cyan-600 dark:border-l-cyan-400"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex items-center justify-center rounded-lg p-2",
                          group.colorClass,
                          group.variant === "destructive"
                            ? "bg-destructive/10"
                            : group.variant === "default"
                              ? "bg-primary/10"
                              : "bg-muted"
                        )}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <CardTitle className="text-base">
                          {group.label}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {group.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={group.variant}
                      className={
                        group.type === "MIGRATE_SVG_TO_FILE"
                          ? "bg-green-600 text-white border-green-600"
                          : group.type === "REMOVE_EXTRA_TARGET"
                            ? "bg-orange-600 text-white border-orange-600"
                            : group.type === "REGENERATE_ALL"
                              ? "bg-cyan-600 text-white border-cyan-600"
                              : undefined
                      }
                    >
                      {count}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ChangeGroupList group={group} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      <div className="flex justify-between gap-2 pt-2 border-t">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={setConfig.isPending}
        >
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleConfirm} disabled={setConfig.isPending}>
          {setConfig.isPending ? "Applying changes..." : "Confirm Changes"}
        </Button>
      </div>
    </div>
  );
}
