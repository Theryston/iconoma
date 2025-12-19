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
  Trash2,
  FilePlus,
  Plus,
  Minus,
  Edit,
  Code,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import type { Change } from "../../../../api/types";
import type { Config } from "../schema";
import { useSetConfig } from "../../../hooks/config";
import { toast } from "@iconoma/ui/components/sonner";
import { AVAILABLE_TARGETS } from "../../../constants";

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
  DELETE_FILE: {
    type: "DELETE_FILE",
    label: "Files to Delete",
    description: "These files will be removed",
    icon: Trash2,
    variant: "destructive",
    colorClass: "text-destructive",
  },
  CREATE_SVG_FILE: {
    type: "CREATE_SVG_FILE",
    label: "Files to Create",
    description: "New SVG files will be created",
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
  CHANGE_EXTRA_TARGET: {
    type: "CHANGE_EXTRA_TARGET",
    label: "Targets to Update",
    description: "These target files will be regenerated",
    icon: Edit,
    variant: "outline",
    colorClass: "text-yellow-600 dark:text-yellow-400",
  },
  FORMAT_FILES: {
    type: "FORMAT_FILES",
    label: "Format Files",
    description: "All icons files will be reformatted",
    icon: Code,
    variant: "secondary",
    colorClass: "text-purple-600 dark:text-purple-400",
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
      <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
        {groupedChanges.map((group) => {
          const Icon = group.icon;
          const count = group.changes.length;

          return (
            <Card
              key={group.type}
              className={cn(
                "border-l-4",
                group.type === "DELETE_FILE" && "border-l-destructive",
                group.type === "CREATE_SVG_FILE" &&
                  "border-l-green-600 dark:border-l-green-400",
                group.type === "ADD_EXTRA_TARGET" && "border-l-primary",
                group.type === "REMOVE_EXTRA_TARGET" &&
                  "border-l-orange-600 dark:border-l-orange-400",
                group.type === "CHANGE_EXTRA_TARGET" &&
                  "border-l-yellow-600 dark:border-l-yellow-400",
                group.type === "FORMAT_FILES" &&
                  "border-l-purple-600 dark:border-l-purple-400",
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
                      <CardTitle className="text-base">{group.label}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={group.variant}
                    className={
                      group.type === "CREATE_SVG_FILE"
                        ? "bg-green-600 text-white border-green-600"
                        : group.type === "REMOVE_EXTRA_TARGET"
                          ? "bg-orange-600 text-white border-orange-600"
                          : group.type === "CHANGE_EXTRA_TARGET"
                            ? "bg-yellow-600 text-white border-yellow-600"
                            : group.type === "FORMAT_FILES"
                              ? "bg-purple-600 text-white border-purple-600"
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
                <div className="flex flex-col gap-2">
                  {group.type === "DELETE_FILE" &&
                    group.changes.map((change, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm font-mono"
                      >
                        <Trash2 className="size-3.5 text-destructive shrink-0" />
                        <span className="truncate">{change.filePath}</span>
                      </div>
                    ))}

                  {group.type === "CREATE_SVG_FILE" &&
                    group.changes.map((change, index) => (
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
                    group.type === "REMOVE_EXTRA_TARGET" ||
                    group.type === "CHANGE_EXTRA_TARGET") &&
                    group.changes.map((change, index) => (
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
                        {group.type === "CHANGE_EXTRA_TARGET" && (
                          <Edit className="size-3.5 text-yellow-600 dark:text-yellow-400 shrink-0" />
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

                  {(group.type === "FORMAT_FILES" ||
                    group.type === "REGENERATE_ALL") && (
                    <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
                      <Icon
                        className={cn("size-4 shrink-0", group.colorClass)}
                      />
                      <span>{group.description}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
