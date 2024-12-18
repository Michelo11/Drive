"use client";

import { axiosClient } from "@/lib/fetcher";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { flexRender, Row as RowType } from "@tanstack/react-table";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { TableCell, TableRow } from "../ui/table";
import { toast } from "sonner";

function formatBytes(bytes: number, decimals: number = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Row({ row }: { row: RowType<any> }) {
  const router = useRouter();
  const [hover, setHover] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const moveFile = useMutation({
    mutationFn: (file: string) => {
      return axiosClient.post(`/api/files/${file}/move`, {
        newPath:
          (row.original.path.endsWith("/")
            ? row.original.path
            : row.original.path + "/") + row.original.name,
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["files"],
      });
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: "FILE",
      item: { id: row.original.id },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
    }),
    []
  );

  const [, drop] = useDrop(() => ({
    accept: "FILE",
    drop: async (dropped: { id: string }) => {
      setHover(false);
      await moveFile.mutateAsync(dropped.id);
    },
    hover: (_, observer) => {
      setHover(observer.isOver({ shallow: true }));
    },
  }));

  return (
    <TableRow
      key={row.id}
      ref={(ref) => {
        if (row.original.type !== "folder") dragRef(ref);
        if (row.original.type === "folder") drop(ref);
      }}
      style={{ opacity }}
      data-state={(row.getIsSelected() || hover) && "selected"}
      className={row.original.type === "folder" ? " cursor-pointer" : ""}
      onClick={(e) => {
        if ((e.target as HTMLElement).tagName !== "TD") return;

        if (row.original.type === "folder") {
          router.push(
            "/?path=" +
              (row.original.path.endsWith("/")
                ? row.original.path
                : row.original.path + "/") +
              row.original.name
          );
        } else {
          router.push("/editor?id=" + row.original.id);
        }
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {cell.column.id === "lastUpdate"
            ? `${moment(cell.getValue() as string).format(
                "MMM D, YYYY"
              )} ${moment(cell.getValue() as string).format("h:mm A")}`
            : cell.column.id === "size"
            ? "type" in (cell.row.original as { type: string }) &&
              cell.row.original.type === "folder"
              ? ""
              : formatBytes(cell.getValue() as number)
            : flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
