import { axiosClient } from "@/lib/fetcher";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import { Row } from "@tanstack/react-table";
import DataSheet from "./data-sheet";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Dropdown({ row }: { row: Row<any> }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const deleteFile = useMutation({
    mutationFn: async () => {
      return axiosClient.delete(`/api/files/${row.original.id}`);
    },

    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["files"],
      }),

    onError: (error) => {
      toast.error(error.message);
    },
  });

  const renameFile = useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) => {
      return axiosClient.patch(`/api/files/${id}/rename`, { newName });
    },

    onError: (error) => {
      toast.error(error.message);
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
        {row.original.type !== "folder" && (
          <DropdownMenuItem
            onClick={() => {
              router.push(`/api/files/${row.original.id}/download`);
            }}
          >
            Download
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => setOpen(true)}>
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={async () => await deleteFile.mutateAsync()}>
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
}
