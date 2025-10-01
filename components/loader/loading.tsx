import { cn } from "@/lib/utils";

export default function Loading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        `fixed inset-0 z-[30] flex items-center justify-center backdrop-blur-sm`,
        className,
      )}
    >
      <div className="spinner-loader">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  );
}
