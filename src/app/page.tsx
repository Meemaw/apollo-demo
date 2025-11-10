import { Suspense } from "react"
import { TrendingCollections } from "@/components/TrendingCollections"

function TrendingCollectionsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          key={i}
        >
          <div className="aspect-square w-full animate-pulse bg-gray-200" />
          <div className="p-4">
            <div className="mb-2 h-6 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <main className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Simple Query Example
          </h2>
          <p className="mt-2 text-gray-600">
            Demonstrates basic GraphQL query usage with Apollo Client's
            useSuspenseQuery hook
          </p>
        </div>
        <Suspense fallback={<TrendingCollectionsSkeleton />}>
          <TrendingCollections />
        </Suspense>
      </main>
    </div>
  )
}
