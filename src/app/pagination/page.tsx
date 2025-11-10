import { Suspense } from "react"
import { PaginatedCollectionItems } from "@/components/PaginatedCollectionItems"

function CollectionItemsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-2 h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            key={i}
          >
            <div className="aspect-square w-full animate-pulse bg-gray-200" />
            <div className="p-4">
              <div className="mb-2 h-5 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PaginationPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <main className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Pagination Example
          </h2>
          <p className="mt-2 text-gray-600">
            Demonstrates cursor-based pagination with Apollo Client's fetchMore
            functionality
          </p>
        </div>
        <Suspense fallback={<CollectionItemsSkeleton />}>
          <PaginatedCollectionItems />
        </Suspense>
      </main>
    </div>
  )
}
