"use client";

import { axiosClient } from "@/lib/fetcher";
import { FileType } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { File, Folder, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataSheet } from "./data-sheet";

export const columns: ColumnDef<FileType>[] = [
  {
    id: "icon",
    cell: ({ row }) => {
      return (
        <>
          {row.original.type === "folder" ? (
            <Folder size={16} />
          ) : (
            <File size={16} />
          )}
        </>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Name" />;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "size",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Size" />;
    },
  },
  {
    accessorKey: "lastUpdate",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Last Update" />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const queryClient = useQueryClient();
      const router = useRouter();
      const [open, setOpen] = useState(false);

      const deleteFile = useMutation({
        mutationFn: async () => {
          await axiosClient.delete(`/api/files/${row.original.id}`);
        },

        onSettled: () =>
          queryClient.invalidateQueries({
            queryKey: ["files"],
          }),
      });

      const renameFile = useMutation({
        mutationFn: ({ id, newName }: { id: string; newName: string }) => {
          return axiosClient.patch(`/api/files/${id}/rename`, { newName });
        },
      });

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                router.push(`/api/files/${row.original.id}/download`);
              }}
            >
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpen(true)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => await deleteFile.mutateAsync()}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>

          <DataSheet
            title="Rename File"
            description="Enter the new name for the file."
            onFinish={async (newName) => {
              await renameFile.mutateAsync({ id: row.original.id, newName });
            }}
            name={row.original.name}
            open={open}
            setOpen={setOpen}
          />
        </DropdownMenu>
      );
    },
  },
];
