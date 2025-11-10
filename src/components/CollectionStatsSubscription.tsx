"use client"

import { gql } from "@apollo/client"
import {
  useApolloClient,
  useSubscription,
  useSuspenseQuery,
} from "@apollo/client/react"
import { useState } from "react"
import type {
  CollectionStatsQueryQuery,
  CollectionStatsQueryQueryVariables,
  CollectionStatsSubscriptionSubscription,
  CollectionStatsSubscriptionSubscriptionVariables,
} from "./CollectionStatsSubscription.generated"

// Query to fetch collection stats
const COLLECTION_STATS_QUERY = gql`
  query CollectionStatsQuery($slug: String!) {
    collectionBySlug(slug: $slug) {
      __typename
      ... on Collection {
        id
        slug
        name
        imageUrl
        floorPrice {
          pricePerItem {
            usd
            token {
              unit
              symbol
            }
          }
        }
        topOffer {
          pricePerItem {
            usd
            token {
              unit
              symbol
            }
          }
        }
        stats {
          ownerCount
          totalSupply
          listedItemCount
          volume {
            usd
          }
          sales
          oneDay {
            floorPriceChange
            sales
            volume {
              usd
            }
          }
          sevenDays {
            floorPriceChange
            sales
            volume {
              usd
            }
          }
          thirtyDays {
            floorPriceChange
            sales
            volume {
              usd
            }
          }
        }
      }
    }
  }
`

// Subscription for real-time stats updates
// Must match the exact structure from web app's useCollectionStatsSubscription
const COLLECTION_STATS_SUBSCRIPTION = gql`
  subscription CollectionStatsSubscription($slugs: [String!]!) {
    collectionsBySlugs(slugs: $slugs) {
      __typename
      ... on DelistedCollection {
        id
      }
      ... on BlacklistedCollection {
        id
      }
      ... on Collection {
        id
        slug
        floorPrice {
          pricePerItem {
            usd
            token {
              unit
              symbol
            }
          }
        }
        topOffer {
          pricePerItem {
            usd
            token {
              unit
              symbol
            }
          }
        }
        stats {
          ownerCount
          totalSupply
          listedItemCount
          volume {
            usd
          }
          sales
          oneDay {
            floorPriceChange
            sales
            volume {
              usd
            }
          }
          sevenDays {
            floorPriceChange
            sales
            volume {
              usd
            }
          }
          thirtyDays {
            floorPriceChange
            sales
            volume {
              usd
            }
          }
        }
      }
    }
  }
`

export function CollectionStatsSubscription() {
  const _client = useApolloClient()
  const collectionSlug = "axie-consumable-item"
  const [updateCount, setUpdateCount] = useState(0)
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    "connecting" | "connected" | "error"
  >("connecting")

  // Step 1: Fetch initial collection data
  const { data } = useSuspenseQuery<
    CollectionStatsQueryQuery,
    CollectionStatsQueryQueryVariables
  >(COLLECTION_STATS_QUERY, {
    variables: { slug: collectionSlug },
  })

  // Step 2: Subscribe to real-time stats updates
  const { data: subData, error: subscriptionError } = useSubscription<
    CollectionStatsSubscriptionSubscription,
    CollectionStatsSubscriptionSubscriptionVariables
  >(COLLECTION_STATS_SUBSCRIPTION, {
    variables: { slugs: [collectionSlug] },
    shouldResubscribe: true,
    onComplete: () => {
      console.log("✅ Collection stats subscription connected for:", [
        collectionSlug,
      ])
      setSubscriptionStatus("connected")
    },
    onError: error => {
      console.error("❌ Collection stats subscription error:", error)
      setSubscriptionStatus("error")
    },
    onData: () => {
      setUpdateCount(prev => prev + 1)
    },
  })

  // Log subscription status for debugging
  console.log("Subscription status:", {
    subscriptionStatus,
    hasSubscriptionData: !!subData,
    subscriptionError: subscriptionError?.message,
  })

  if (data.collectionBySlug?.__typename !== "Collection") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8">
        <p className="font-bold text-red-900">Error loading collection:</p>
        <pre className="mt-2 overflow-auto rounded border border-red-300 bg-white p-4 text-sm text-red-800">
          Collection not found
        </pre>
      </div>
    )
  }

  const collection = data.collectionBySlug

  // Update connection status based on subscription data
  const isConnected = subscriptionStatus === "connected" || !!subData
  const hasError = !!subscriptionError

  return (
    <div className="space-y-6">
      {/* Collection Header */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-4 p-6">
          {collection.imageUrl && (
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
              <img
                alt={collection.name}
                className="h-full w-full object-cover"
                src={collection.imageUrl}
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900">
              {collection.name}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Live stats powered by Apollo subscriptions
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      <div
        className={`rounded-lg border p-4 ${
          hasError
            ? "border-red-200 bg-red-50"
            : isConnected
              ? "border-green-200 bg-green-50"
              : "border-yellow-200 bg-yellow-50"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
              hasError
                ? "bg-red-600"
                : isConnected
                  ? "bg-green-600"
                  : "bg-yellow-600"
            } text-white`}
          >
            {hasError ? (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ) : isConnected ? (
              <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
            ) : (
              <div className="h-2 w-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
          </div>
          <div className="flex-1">
            <h4
              className={`font-semibold ${
                hasError
                  ? "text-red-900"
                  : isConnected
                    ? "text-green-900"
                    : "text-yellow-900"
              }`}
            >
              {hasError
                ? "Subscription Error"
                : isConnected
                  ? "Live Stats Connected"
                  : "Connecting..."}
            </h4>
            <p
              className={`mt-1 text-sm ${
                hasError
                  ? "text-red-800"
                  : isConnected
                    ? "text-green-800"
                    : "text-yellow-800"
              }`}
            >
              {hasError ? (
                <div className="space-y-2">
                  <p>Error: {subscriptionError?.message || "Unknown error"}</p>
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium hover:underline">
                      Debug Info
                    </summary>
                    <div className="mt-2 space-y-1 rounded bg-red-100 p-2">
                      <p>Collection Slug: {collectionSlug}</p>
                      <p>
                        WebSocket URL:
                        wss://os2-wss.prod.privatesea.io/subscriptions
                      </p>
                      <p>Has SubData: {subData ? "Yes" : "No"}</p>
                    </div>
                  </details>
                </div>
              ) : isConnected ? (
                <>
                  <code className="rounded bg-green-100 px-1 py-0.5">
                    cache.modify()
                  </code>{" "}
                  updates specific fields in the cached Collection object.
                  Updates received:{" "}
                  <span className="font-semibold">{updateCount}</span>
                </>
              ) : (
                <div className="space-y-1">
                  <p>
                    Establishing WebSocket connection for {collectionSlug}...
                  </p>
                  <p className="text-xs">
                    Check console for connection details. WebSocket should
                    connect once query completes.
                  </p>
                </div>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Floor Price"
          value={
            collection.floorPrice?.pricePerItem?.token?.unit
              ? `${Number(collection.floorPrice.pricePerItem.token.unit).toFixed(4)} ${collection.floorPrice.pricePerItem.token.symbol}`
              : "—"
          }
        />
        <StatCard
          label="Top Offer"
          value={
            collection.topOffer?.pricePerItem?.token?.unit
              ? `${Number(collection.topOffer.pricePerItem.token.unit).toFixed(4)} ${collection.topOffer.pricePerItem.token.symbol}`
              : "—"
          }
        />
        <StatCard
          change={collection.stats?.oneDay?.floorPriceChange}
          label="24h Volume"
          value={
            collection.stats?.oneDay?.volume?.usd
              ? `$${Number(collection.stats.oneDay.volume.usd).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              : "—"
          }
        />
        <StatCard
          label="24h Sales"
          value={collection.stats?.oneDay?.sales?.toString() || "—"}
        />
        <StatCard
          label="Total Volume"
          value={
            collection.stats?.volume?.usd
              ? `$${Number(collection.stats.volume.usd).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              : "—"
          }
        />
        <StatCard
          label="Unique Owners"
          value={collection.stats?.ownerCount?.toString() || "—"}
        />
        <StatCard
          label="Total Supply"
          value={collection.stats?.totalSupply?.toString() || "—"}
        />
        <StatCard
          label="Listed"
          value={collection.stats?.listedItemCount?.toString() || "—"}
        />
      </div>

      {/* 7-day & 30-day Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="mb-4 text-lg font-semibold text-gray-900">
            7-Day Stats
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Volume:</span>
              <span className="text-sm font-medium text-gray-900">
                {collection.stats?.sevenDays?.volume?.usd
                  ? `$${Number(collection.stats.sevenDays.volume.usd).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Sales:</span>
              <span className="text-sm font-medium text-gray-900">
                {collection.stats?.sevenDays?.sales?.toString() || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Floor Change:</span>
              <span
                className={`text-sm font-medium ${
                  (collection.stats?.sevenDays?.floorPriceChange || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {collection.stats?.sevenDays?.floorPriceChange
                  ? `${collection.stats.sevenDays.floorPriceChange > 0 ? "+" : ""}${(collection.stats.sevenDays.floorPriceChange * 100).toFixed(2)}%`
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="mb-4 text-lg font-semibold text-gray-900">
            30-Day Stats
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Volume:</span>
              <span className="text-sm font-medium text-gray-900">
                {collection.stats?.thirtyDays?.volume?.usd
                  ? `$${Number(collection.stats.thirtyDays.volume.usd).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Sales:</span>
              <span className="text-sm font-medium text-gray-900">
                {collection.stats?.thirtyDays?.sales?.toString() || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Floor Change:</span>
              <span
                className={`text-sm font-medium ${
                  (collection.stats?.thirtyDays?.floorPriceChange || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {collection.stats?.thirtyDays?.floorPriceChange
                  ? `${collection.stats.thirtyDays.floorPriceChange > 0 ? "+" : ""}${(collection.stats.thirtyDays.floorPriceChange * 100).toFixed(2)}%`
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type StatCardProps = {
  label: string
  value: string
  change?: number | null
}

function StatCard({ label, value, change }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <p className="text-lg font-bold text-gray-900">{value}</p>
        {change !== undefined && change !== null && (
          <span
            className={`text-xs font-semibold ${
              change >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {change > 0 ? "+" : ""}
            {(change * 100).toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  )
}
