import { Button } from "@iconoma/ui/components/button";
import { SettingsIcon } from "lucide-react";
import { ConfigModal } from "../config-modal/index";
import { useState } from "react";

export function ConfigButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="icon" onClick={() => setOpen(true)}>
        <SettingsIcon />
      </Button>

      <ConfigModal open={open} onOpenChange={setOpen} />
    </>
  );
}
