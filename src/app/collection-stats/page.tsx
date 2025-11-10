import { Suspense } from "react"
import { CollectionStatsSubscription } from "@/components/CollectionStatsSubscription"

function CollectionStatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-4 p-6">
          <div className="h-20 w-20 flex-shrink-0 animate-pulse rounded-lg bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            className="rounded-lg border border-gray-200 bg-white p-4"
            key={i}
          >
            <div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-full animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CollectionStatsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <main className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Collection Stats Subscription
          </h2>
          <p className="mt-2 text-gray-600">
            Real-time collection statistics using Apollo cache.modify() to
            update existing cached data
          </p>
        </div>

        <Suspense fallback={<CollectionStatsSkeleton />}>
          <CollectionStatsSubscription />
        </Suspense>
      </main>
    </div>
  )
}
