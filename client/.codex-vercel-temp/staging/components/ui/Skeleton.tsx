const cn = (...c: (string | undefined)[]) => c.filter(Boolean).join(" ");

interface SkeletonProps {
    className?: string;
}

/** A single shimmering skeleton block. Compose these to build loading UIs. */
export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-xl bg-slate-100",
                className
            )}
        />
    );
}

/** Pre-built skeleton for a booking/appointment card */
export function BookingCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-primary/5 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="space-y-2.5">
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex gap-3 pt-2 border-t border-slate-100">
                <Skeleton className="h-9 w-28 rounded-xl" />
                <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
        </div>
    );
}

/** Pre-built skeleton for a history table row */
export function HistoryRowSkeleton() {
    return (
        <tr>
            <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
            <td className="px-6 py-4">
                <Skeleton className="h-4 w-36 mb-1.5" />
                <Skeleton className="h-3 w-24" />
            </td>
            <td className="px-6 py-4 text-center">
                <Skeleton className="h-5 w-20 rounded-full mx-auto" />
            </td>
            <td className="px-6 py-4 text-center">
                <Skeleton className="h-4 w-16 mx-auto" />
            </td>
            <td className="px-6 py-4 text-right">
                <Skeleton className="h-5 w-5 ml-auto rounded" />
            </td>
        </tr>
    );
}
