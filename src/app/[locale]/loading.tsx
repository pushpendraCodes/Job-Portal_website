import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container-x space-y-6 py-12">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-4 w-80" />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-[16px]" />
        ))}
      </div>
    </div>
  );
}
