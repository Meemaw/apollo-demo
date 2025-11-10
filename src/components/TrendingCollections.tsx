"use client"

import { gql } from "@apollo/client"
import { useSuspenseQuery } from "@apollo/client/react"
import {
  COLLECTION_CARD_LIST_FRAGMENT,
  CollectionCardList,
} from "./CollectionCardList"
import type {
  TrendingCollectionsQueryQuery,
  TrendingCollectionsQueryQueryVariables,
} from "./TrendingCollections.generated"

const TRENDING_COLLECTIONS_QUERY = gql`
  query TrendingCollectionsQuery($timeframe: Timeframe!, $limit: Int!) {
    trendingCollections(timeframe: $timeframe, limit: $limit) {
      items {
        ...CollectionCardList
      }
    }
  }
  ${COLLECTION_CARD_LIST_FRAGMENT}
`

export function TrendingCollections() {
  const { data } = useSuspenseQuery<
    TrendingCollectionsQueryQuery,
    TrendingCollectionsQueryQueryVariables
  >(TRENDING_COLLECTIONS_QUERY, {
    variables: {
      timeframe: "ALL_TIME",
      limit: 10,
    },
  })

  const collections = data.trendingCollections?.items || []

  return (
    <div className="space-y-6">
      {/* Apollo Query Info */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h4 className="font-semibold text-green-900">
              useSuspenseQuery Hook
            </h4>
            <p className="mt-1 text-sm text-green-800">
              Apollo's useSuspenseQuery integrates with React Suspense for
              automatic loading states. Results are stored in Apollo's
              InMemoryCache and automatically updated on refetch. Loading states
              are handled by Suspense boundaries.
            </p>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      <CollectionCardList collections={collections} />

      {collections.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <p className="text-gray-600">No trending collections found</p>
        </div>
      )}
    </div>
  )
}
