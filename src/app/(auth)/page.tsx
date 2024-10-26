"use client";

import { columns } from "@/components/home/column";
import DataSheet from "@/components/home/data-sheet";
import DataTable from "@/components/home/data-table";
import Dragging from "@/components/modal/dragging";
import Loading from "@/components/modal/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosClient } from "@/lib/fetcher";
import { FileType } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUp } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dragging, setDragging] = useState<number>(0);
  const [currentPath, setCurrentPath] = useState<string>(
    searchParams.get("path") ?? "/"
  );
  const [search, setSearch] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState<string | null>("");

  const handleUpload = async (file: File) => {
    if (!file) return;

    await uploadFile.mutateAsync(file);
  };

  const uploadFile = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();

      form.append("file", file);
      form.append("url", file.name);
      form.append("type", file.type);
      form.append("size", file.size.toString());

      return axiosClient.postForm("/api/files", form);
    },

    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["files"],
      }),
  });

  const createFolder = useMutation({
    mutationFn: (name: string) => {
      return axiosClient.put("/api/files/", { name, path: currentPath });
    },

    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["files"],
      }),
  });

  const { data: files, isLoading } = useQuery<FileType[]>({
    queryKey: ["files"],
    queryFn: async () => {
      const res = await axiosClient.get("/api/files/");
      return res.data;
    },
  });

  useEffect(() => {
    const dragEnter = (e: DragEvent) => {
      e.preventDefault();
      setDragging((d) => d + 1);
    };

    const dragLeave = (e: DragEvent) => {
      e.preventDefault();
      setDragging((d) => d - 1);
    };

    const drop = (e: DragEvent) => {
      e.preventDefault();
      setDragging(0);

      const files = e.dataTransfer?.files;

      if (files && files.length > 0) {
        handleUpload(files[0]);
      }
    };

    window.addEventListener("dragenter", dragEnter);
    window.addEventListener("dragleave", dragLeave);
    window.addEventListener("dragover", (e) => e.preventDefault());
    window.addEventListener("drop", drop);

    return () => {
      window.removeEventListener("dragenter", dragEnter);
      window.removeEventListener("dragleave", dragLeave);
      window.removeEventListener("dragover", (e) => e.preventDefault());
      window.removeEventListener("drop", drop);
    };
  }, []);

  useEffect(() => {
    if (searchParams.get("path") !== currentPath) {
      setCurrentPath(searchParams.get("path") ?? "/");
    }
  }, [searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentPath !== searchParams.get("path"))
        router.replace(`/?path=${currentPath}`);
    }, 500);

    return () => clearTimeout(timeout);
  }, [currentPath]);

  return (
    <div className="flex flex-col gap-3">
      <DndProvider backend={HTML5Backend}>
        <Loading isLoading={isLoading} />
        <Dragging dragging={dragging} />

        <h2>Welcome back!</h2>
        <p className="muted">Here are your most recent files.</p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              const newPath =
                currentPath.split("/").slice(0, -1).join("/") || "/";
              setCurrentPath(newPath);
              router.replace(`/?path=${newPath}`);
            }}
          >
            <ArrowUp />
          </Button>
          <Input
            className="w-2/3"
            value={currentPath}
            onChange={(e) => setCurrentPath(e.target.value)}
          />
          <Input
            placeholder="Search for files"
            className="w-1/3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={() => inputRef.current?.click()}>Upload file</Button>
          <Button variant="outline" onClick={() => setOpen("file")}>
            Create file
          </Button>
          <Button variant="outline" onClick={() => setOpen("folder")}>
            Create folder
          </Button>
        </div>

        <input
          type="file"
          hidden
          ref={inputRef}
          onChange={(e) =>
            e.target.files?.[0] && handleUpload(e.target.files?.[0])
          }
        />

        <DataTable
          columns={columns}
          data={
            files
              ?.filter((file) => file.path === currentPath)
              .filter((file) => file.name.includes(search)) ?? []
          }
        />
      </DndProvider>

      <DataSheet
        title={open === "folder" ? "Create folder" : "Create file"}
        description={
          open === "folder"
            ? "Enter the name of the folder you want to create."
            : "Enter the name of the file you want to create."
        }
        onFinish={async (name) => {
          if (open === "folder") await createFolder.mutateAsync(name);
          if (open === "file")
            await uploadFile.mutateAsync(
              new File([], name, { type: "text/plain" })
            );
        }}
        open={!!open}
        setOpen={() => setOpen(null)}
      />
    </div>
  );
}
