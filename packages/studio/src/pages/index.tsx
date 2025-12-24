import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useIcons, useDeleteIcon } from "../hooks/icons";
import { SvgPreview } from "../components/svg-preview";
import { IconExamples } from "../components/icon-examples";
import { Input } from "@iconoma/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@iconoma/ui/components/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@iconoma/ui/components/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@iconoma/ui/components/dialog";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  EmptyContent,
} from "@iconoma/ui/components/empty";
import { Button } from "@iconoma/ui/components/button";
import { Badge } from "@iconoma/ui/components/badge";
import { toast } from "@iconoma/ui/components/sonner";
import { Grid3x3, List, Edit, PlusIcon, Trash2 } from "lucide-react";

type ViewType = "grid" | "list";

export default function Home() {
  const navigate = useNavigate();
  const { data: iconsData, isPending, error } = useIcons();
  const deleteIcon = useDeleteIcon();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [selectedIcon, setSelectedIcon] = useState<{
    iconKey: string;
    icon: any;
    svgContent: string;
    componentName: string;
  } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const icons = iconsData?.icons || [];

  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) return icons;

    const query = searchQuery.toLowerCase();
    return icons.filter((item) => {
      const iconKeyMatch = item.iconKey.toLowerCase().includes(query);
      const nameMatch = item.icon.name.toLowerCase().includes(query);
      const tagsMatch = item.icon.tags.some((tag: string) =>
        tag.toLowerCase().includes(query)
      );

      return iconKeyMatch || nameMatch || tagsMatch;
    });
  }, [icons, searchQuery]);

  if (isPending) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-muted-foreground">Loading icons...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-destructive">Failed to load icons</div>
      </div>
    );
  }

  if (icons.length === 0) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-6">
        <Empty className="max-w-md border border-dotted">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <img src="/icon.png" alt="Iconoma Logo" className="w-8 h-8" />
            </EmptyMedia>
            <EmptyTitle>No icons yet</EmptyTitle>
            <EmptyDescription className="whitespace-nowrap">
              Create your first icon to get started with Iconoma Studio
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => navigate("/icons/create")} size="lg">
              <PlusIcon />
              Create Icon
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search icons by name, key, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select
          value={viewType}
          onValueChange={(v) => setViewType(v as ViewType)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">
              <div className="flex items-center gap-2">
                <Grid3x3 className="size-4" />
                <span>Grid</span>
              </div>
            </SelectItem>
            <SelectItem value="list">
              <div className="flex items-center gap-2">
                <List className="size-4" />
                <span>List</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredIcons.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">
              No icons found matching your search
            </p>
          </div>
        </div>
      ) : viewType === "grid" ? (
        <div className="grid grid-cols-8 gap-4 overflow-y-auto">
          {filteredIcons.map((item) => (
            <button
              key={item.iconKey}
              onClick={() => setSelectedIcon(item)}
              className="group flex flex-col items-center gap-3 p-4 rounded-xl border hover:bg-accent cursor-pointer transition-all"
            >
              <div className="flex items-center justify-center w-full aspect-square p-4">
                <SvgPreview
                  content={item.svgContent}
                  className="w-full h-full max-w-[64px] flex justify-center items-center object-contain"
                />
              </div>
              <div className="flex flex-col items-center gap-2 w-full min-w-0">
                <p className="text-sm font-medium truncate w-full text-center">
                  {item.icon.name}
                </p>
                {item.icon.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center max-w-full">
                    {item.icon.tags.slice(0, 2).map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs px-1.5 py-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {item.icon.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        +{item.icon.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto">
          {filteredIcons.map((item) => (
            <button
              key={item.iconKey}
              onClick={() => setSelectedIcon(item)}
              className="group flex items-center gap-4 p-4 rounded-lg border bg-gradient-to-r from-card to-card/50 hover:from-card/90 hover:to-card/40 transition-all hover:shadow-md cursor-pointer text-left"
            >
              <div className="flex items-center justify-center w-16 h-16 shrink-0">
                <SvgPreview
                  content={item.svgContent}
                  className="w-full h-full max-w-[48px] flex justify-center items-center object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium truncate">
                    {item.icon.name}
                  </p>
                  {item.icon.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {item.icon.tags.slice(0, 3).map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs px-1.5 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {item.icon.tags.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs px-1.5 py-0"
                        >
                          +{item.icon.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <pre className="text-xs text-muted-foreground font-mono truncate max-w-full overflow-hidden">
                  <code>{item.svgContent.substring(0, 100)}...</code>
                </pre>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedIcon && (
        <Sheet
          open={!!selectedIcon}
          onOpenChange={(open) => !open && setSelectedIcon(null)}
        >
          <SheetContent
            side="right"
            className="w-full sm:max-w-2xl overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle>{selectedIcon.icon.name}</SheetTitle>
              <SheetDescription>
                {selectedIcon.icon.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedIcon.icon.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-6 mt-6 px-6">
              <div className="flex items-center justify-center p-8 rounded-xl border bg-gradient-to-br from-card to-card/50">
                <SvgPreview
                  content={selectedIcon.svgContent}
                  className="w-full h-full max-w-[200px] flex justify-center items-center object-contain"
                />
              </div>

              <IconExamples
                iconKey={selectedIcon.iconKey}
                componentName={selectedIcon.componentName}
                svgContent={selectedIcon.svgContent}
                colorVariableKeys={selectedIcon.icon.colorVariableKeys}
              />
            </div>

            <SheetFooter className="flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                <Trash2 />
                Delete
              </Button>
              <Button
                onClick={() => {
                  setSelectedIcon(null);
                  navigate(`/icons/${selectedIcon.iconKey}/edit`);
                }}
                className="w-full sm:w-auto"
              >
                <Edit />
                Edit Icon
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Icon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedIcon?.icon.name}"? This
              action cannot be undone and will remove the icon from all targets.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteIcon.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!selectedIcon) return;
                try {
                  await deleteIcon.mutateAsync(selectedIcon.iconKey);
                  toast.success("Icon deleted successfully");
                  setShowDeleteDialog(false);
                  setSelectedIcon(null);
                } catch (error) {
                  toast.error("Failed to delete icon");
                }
              }}
              disabled={deleteIcon.isPending}
            >
              {deleteIcon.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
