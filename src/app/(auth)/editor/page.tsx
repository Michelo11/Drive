"use client";

import FileComponent from "@/components/editor/file";
import ImageComponent from "@/components/editor/image";
import Loading from "@/components/modal/loading";
import { axiosClient } from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";
import { notFound, useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { data: content, isLoading } = useQuery<{
    content: string;
    type: string;
  }>({
    queryKey: ["file", id],
    queryFn: async () => {
      const res = await axiosClient.get(`/api/files/${id}/download`);
      return {
        content: res.data,
        type: res.headers["content-type"],
      };
    },
  });

  if (!searchParams.has("id")) return notFound();
  if (isLoading) return <Loading isLoading={isLoading} />;
  if (content?.type.startsWith("image/")) return <ImageComponent id={id!} />;

  return <FileComponent id={id!} value={content!.content} />;
}
