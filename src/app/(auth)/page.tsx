"use client";

import { axiosClient } from "@/lib/fetcher";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setName(selectedFile.name);
    } else {
      setFile(null);
      setName("");
    }
  };

  const uploadFile = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      
      form.append("file", file);
      form.append("name", name);
      form.append("url", file.name);
      form.append("type", file.type);
      form.append("size", file.size.toString());

      return axiosClient.postForm("/api/files", form);
    },
  });

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        onClick={() => {
          if (file) {
            uploadFile.mutate(file);
          }
        }}
      >
        Upload
      </button>
    </div>
  );
}
