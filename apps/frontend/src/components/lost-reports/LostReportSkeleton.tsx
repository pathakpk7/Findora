export function LostReportSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded w-24"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-28 bg-gray-100 rounded-xl"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );
}

export function LostReportGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LostReportSkeleton key={i} />
      ))}
    </div>
  );
}
