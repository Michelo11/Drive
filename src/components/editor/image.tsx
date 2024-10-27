import Image from "next/image";

export default function ImageComponent({ id }: { id: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h2>Preview</h2>
      <p className="muted">Preview of the image.</p>

      <Image
        src={`/api/files/${id}/download`}
        alt="Preview"
        className="w-full h-full"
        width={500}
        height={500}
        draggable={false}
      />
    </div>
  );
}
