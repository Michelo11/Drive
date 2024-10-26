export default function Loading({ isLoading }: { isLoading: boolean }) {
  if (isLoading)
    return (
      <div className="absolute left-0 top-0 w-full h-full flex justify-center items-center z-50 bg-black">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
}
