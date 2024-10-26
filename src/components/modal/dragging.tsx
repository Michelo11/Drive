import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useDragDropManager } from "react-dnd";
import { createPortal } from "react-dom";

export default function Dragging({ dragging }: { dragging: number }) {
  const dragDropManager = useDragDropManager();

  return (
    <>
      {typeof window !== "undefined" &&
        createPortal(
          dragging > 0 &&
            !(
              dragDropManager.getMonitor().isDragging() &&
              dragDropManager.getMonitor().getItemType() === "FILE"
            ) ? (
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
    </>
  );
}
