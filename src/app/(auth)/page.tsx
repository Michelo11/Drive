"use client";

import { columns } from "@/components/home/column";
import { DataTable } from "@/components/home/data-table";
import { axiosClient } from "@/lib/fetcher";
import { FileType } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function Page() {
  const [dragging, setDragging] = useState<number>(0);

  const handleUpload = async (file: File) => {
    if (!file) return;

    try {
      await uploadFile.mutateAsync(file);
    } catch (error) {
      console.error(error);
    }
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

  return (
    <div className="flex flex-col gap-3">
      <h2>Welcome back!</h2>
      <p className="muted">Here are your most recent files.</p>

      <DataTable columns={columns} data={files || []} />
    </div>
  );
}
