import { Suspense } from "react"
import { GlobalActivityFeed } from "@/components/GlobalActivityFeed"

function ActivityFeedSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 shadow-sm"
          key={i}
        >
          <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-md bg-gray-200" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-3 w-16 flex-shrink-0 animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

export default function SubscriptionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <main className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Subscriptions Example
          </h2>
          <p className="mt-2 text-gray-600">
            Real-time global activity feed using Apollo's useSubscription hook
          </p>
        </div>

        <Suspense fallback={<ActivityFeedSkeleton />}>
          <GlobalActivityFeed />
        </Suspense>
      </main>
    </div>
  )
}
