"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function DataSheet({
  title,
  description,
  name,
  onFinish,
  open,
  setOpen,
}: {
  title: string;
  description: string;
  name?: string;
  onFinish: (result: string) => Promise<void>;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState<string>(name || "");

  useEffect(() => {
    if (name) setNewName(name);
  }, [name]);

  return (
    <Sheet open={open} onOpenChange={(o) => setOpen(o)}>
      <SheetContent className="space-y-3">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div>
          <Input
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              onClick={async () => {
                await onFinish(newName);

                queryClient.invalidateQueries({
                  queryKey: ["files"],
                });
              }}
            >
              Save
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
