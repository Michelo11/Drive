"use client";

import { columns } from "@/components/home/column";
import { DataSheet } from "@/components/home/data-sheet";
import { DataTable } from "@/components/home/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosClient } from "@/lib/fetcher";
import { FileType } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Page() {
  const queryClient = useQueryClient();
  const [dragging, setDragging] = useState<number>(0);
  const [folders, setFolders] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("/");
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

  const { data: files } = useQuery<FileType[]>({
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
    if (!files) return;

    const uniqueFolders = files
      .filter((file) => file.path !== "/")
      .map((file) => file.path.split("/")[0])
      .filter((value, index, self) => self.indexOf(value) === index);

    setFolders(uniqueFolders);
  }, [files]);

  return (
    <div className="flex flex-col gap-3">
      <h2>Welcome back!</h2>
      <p className="muted">Here are your most recent files.</p>

      {typeof window !== "undefined" &&
        createPortal(
          dragging > 0 ? (
            <div className="absolute left-0 top-0 w-full h-full flex flex-col gap-3 justify-center items-center z-50 bg-black/50">
              <Upload size={48} />
              <h3>Drop your file here</h3>
              <p className="muted">
                Release the file you want to upload here to store it on your
                drive.
              </p>
            </div>
          ) : null,
          document.body!
        )}

      <div className="flex gap-3">
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
            ? [
                ...folders
                  .filter((folder) => folder.includes(search))
                  .map((folder, index) => ({
                    id: `folder-${index}`,
                    name: folder,
                    url: "#",
                    type: "folder",
                    size: 0,
                    path: folder,
                  })),
                ...files.filter((file) => file.name.includes(search)),
              ]
            : []
        }
      />

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
