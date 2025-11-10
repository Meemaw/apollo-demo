"use client"

import { gql } from "@apollo/client"
import {
  useApolloClient,
  useSubscription,
  useSuspenseQuery,
} from "@apollo/client/react"
import { useState } from "react"
import { itemPaginator } from "@/lib/item-paginator"
import { ITEM_CARD_FRAGMENT, ItemCard } from "./ItemCard"
import type {
  CollectionItemsSubscriptionSubscription,
  CollectionItemsSubscriptionSubscriptionVariables,
  PaginatedItemsQueryQuery,
  PaginatedItemsQueryQueryVariables,
} from "./PaginatedCollectionItems.generated"
import type { SortOption } from "./SortSelect"
import { SortSelect, sortOptions } from "./SortSelect"

// Compose query using colocated fragment
// Following Apollo docs: https://www.apollographql.com/docs/react/data/fragments#colocating-fragments
const PAGINATED_ITEMS_QUERY = gql`
  query PaginatedItemsQuery(
    $collectionSlug: String!
    $cursor: String
    $limit: Int!
    $sortBy: CollectionItemsSortBy!
    $sortDirection: SortDirection!
  ) {
    collectionBySlug(slug: $collectionSlug) {
      __typename
      ... on Collection {
        id
        name
        slug
      }
    }
    collectionItems(
      collectionSlug: $collectionSlug
      cursor: $cursor
      limit: $limit
      sort: { by: $sortBy, direction: $sortDirection }
    ) {
      items {
        id
        ...ItemCard
      }
      nextPageCursor
    }
  }
  ${ITEM_CARD_FRAGMENT}
`

// Subscription for real-time item updates
// Composes the same fragment for consistency
const COLLECTION_ITEMS_SUBSCRIPTION = gql`
  subscription CollectionItemsSubscription(
    $collectionSlug: String!
    $filter: CollectionItemsFilter
  ) {
    itemByCollectionSlug(collectionSlug: $collectionSlug, filter: $filter) {
      id
      name
      enforcement {
        isDelisted
      }
      ...ItemCard
    }
  }
  ${ITEM_CARD_FRAGMENT}
`

export function PaginatedCollectionItems() {
  const client = useApolloClient()
  const [collectionSlug] = useState("boredapeyachtclub")
  const itemsPerPage = 12
  // Default to "Price: Low to High" (sortOptions[2])
  const [sortOption, setSortOption] = useState<SortOption>(sortOptions[2])
  const [liveUpdateCount, setLiveUpdateCount] = useState(0)

  const { data, fetchMore, refetch } = useSuspenseQuery<
    PaginatedItemsQueryQuery,
    PaginatedItemsQueryQueryVariables
  >(PAGINATED_ITEMS_QUERY, {
    variables: {
      collectionSlug,
      cursor: null,
      limit: itemsPerPage,
      sortBy: sortOption.sortBy,
      sortDirection: sortOption.direction,
    },
  })

  // Subscribe to real-time item updates
  // Matches web app's useCollectionItemsSubscription pattern
  useSubscription<
    CollectionItemsSubscriptionSubscription,
    CollectionItemsSubscriptionSubscriptionVariables
  >(COLLECTION_ITEMS_SUBSCRIPTION, {
    variables: {
      collectionSlug,
      filter: undefined, // For demo, no filter. In production: { isListed: true, markets: [...] }
    },
    shouldResubscribe: true,
    onData: ({ data: subscriptionData }) => {
      const item = subscriptionData?.data?.itemByCollectionSlug

      if (item) {
        console.log("🔄 Item update received:", item.id, item.name)
        setLiveUpdateCount(prev => prev + 1)

        /**
         * Apollo Cache Update with Sorted Insertion:
         *
         * Following web app's useCollectionItemsSubscription pattern:
         * 1. Read current cached data for this query
         * 2. Check filter conditions (isDelisted, isListed, markets, etc.)
         * 3. If item should be removed, use Paginator.remove()
         * 4. If valid, use Paginator.insertInOrder() to maintain sort
         * 5. Write sorted list back to Apollo cache
         *
         * No local state - all updates go directly to Apollo cache!
         */
        const cachedData = client.readQuery<
          PaginatedItemsQueryQuery,
          PaginatedItemsQueryQueryVariables
        >({
          query: PAGINATED_ITEMS_QUERY,
          variables: {
            collectionSlug,
            cursor: null,
            limit: itemsPerPage,
            sortBy: sortOption.sortBy,
            sortDirection: sortOption.direction,
          },
        })

        if (cachedData?.collectionItems?.items) {
          let updatedItems: typeof cachedData.collectionItems.items

          // Check if item should be removed (matching web app's filter logic)
          const shouldRemove = item.enforcement?.isDelisted === true

          if (shouldRemove) {
            // Remove item from the list
            updatedItems = itemPaginator.remove(
              item,
              cachedData.collectionItems.items,
            )
          } else {
            // Insert/update item in correct sorted position
            updatedItems = itemPaginator.insertInOrder(
              item,
              cachedData.collectionItems.items,
              {
                by: sortOption.sortBy,
                direction: sortOption.direction,
              },
            )
          }

          // Write sorted list back to cache
          client.writeQuery({
            query: PAGINATED_ITEMS_QUERY,
            variables: {
              collectionSlug,
              cursor: null,
              limit: itemsPerPage,
              sortBy: sortOption.sortBy,
              sortDirection: sortOption.direction,
            },
            data: {
              ...cachedData,
              collectionItems: {
                ...cachedData.collectionItems,
                items: updatedItems,
              },
            },
          })
        }
      }
    },
  })

  const handleSortChange = async (newSort: SortOption) => {
    setSortOption(newSort)
    await refetch({
      collectionSlug,
      cursor: null,
      limit: itemsPerPage,
      sortBy: newSort.sortBy,
      sortDirection: newSort.direction,
    })
  }

  const handleLoadMore = () => {
    if (data?.collectionItems?.nextPageCursor) {
      fetchMore({
        variables: {
          cursor: data.collectionItems.nextPageCursor,
          sortBy: sortOption.sortBy,
          sortDirection: sortOption.direction,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prev
          }

          return {
            ...prev,
            collectionItems: {
              ...fetchMoreResult.collectionItems,
              items: [
                ...(prev.collectionItems?.items || []),
                ...(fetchMoreResult.collectionItems?.items || []),
              ],
            },
          }
        },
      })
    }
  }

  if (data.collectionBySlug?.__typename !== "Collection") {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-8">
        <p className="text-yellow-900">Collection not found</p>
      </div>
    )
  }

  const collection = data.collectionBySlug
  const items = data.collectionItems?.items
  const hasNextPage = !!data.collectionItems?.nextPageCursor

  return (
    <div className="space-y-6">
      {/* Live Updates Info */}
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-white">
            {liveUpdateCount > 0 ? (
              <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
            ) : (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-purple-900">
              Live Updates with Sorted Insertion
            </h4>
            <p className="mt-1 text-sm text-purple-800">
              <span className="font-medium">Real-time sorted updates:</span>{" "}
              When items change (new listing, sale, etc.),{" "}
              <code className="rounded bg-purple-100 px-1 py-0.5">
                ItemPaginator
              </code>{" "}
              calculates correct position based on sort, then{" "}
              <code className="rounded bg-purple-100 px-1 py-0.5">
                client.writeQuery()
              </code>{" "}
              updates Apollo cache. Delisted items are removed. All without
              local state!
              {liveUpdateCount > 0 && (
                <span className="ml-2 font-semibold">
                  {liveUpdateCount} live updates
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Collection Header with Sort */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {collection.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Showing {items.length} item{items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <SortSelect onChange={handleSortChange} value={sortOption.value} />
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map(item => (
          <ItemCard item={item} key={item.id} />
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <button
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            onClick={handleLoadMore}
            type="button"
          >
            Load More
          </button>
        </div>
      )}

      {!hasNextPage && items.length > 0 && (
        <p className="text-center text-sm text-gray-500">
          No more items to load
        </p>
      )}
    </div>
  )
}
