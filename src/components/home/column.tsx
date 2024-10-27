"use client";

import { FileType } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { File, Folder } from "lucide-react";
import DataTableColumnHeader from "./data-table-column-header";
import Dropdown from "./dropdown";

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
    cell: ({ row }) => <Dropdown row={row} />,
  },
];
