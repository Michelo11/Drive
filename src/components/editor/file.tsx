import { axiosClient } from "@/lib/fetcher";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function FileComponent({
  id,
  value,
}: {
  id: string;
  value: string | undefined;
}) {
  const monaco = useMonaco();
  const [newContent, setNewContent] = useState<string | undefined>(value);

  const editFile = useMutation({
    mutationFn: (data: { content: string }) => {
      return axiosClient.patch(`/api/files/${id}`, data);
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    monaco?.editor.defineTheme("vs-dark-plus", {
      base: "vs-dark",
      inherit: true,
      rules: [{ token: "new-background", background: "09090a" }],
      colors: {
        "editor.background": "#09090a",
      },
    });

    monaco?.editor.setTheme("vs-dark-plus");
  }, [monaco]);

  useEffect(() => {
    if (newContent) {
      const timeout = setTimeout(() => {
        editFile.mutateAsync({ content: newContent });
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [newContent, editFile]);

  return (
    <div className="flex flex-col gap-3">
      <h2>Editor</h2>
      <p className="muted">Edit your files here.</p>

      <Editor
        height="90vh"
        defaultValue={value}
        theme="vs-dark-plus"
        options={{
          contextmenu: false,
          tabCompletion: "off",
          quickSuggestions: false,
        }}
        onChange={(value) => setNewContent(value)}
      />
    </div>
  );
}
