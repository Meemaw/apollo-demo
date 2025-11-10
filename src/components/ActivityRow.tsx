"use client"

import { type FragmentType, gql, type TypedDocumentNode } from "@apollo/client"
import { useFragment } from "@apollo/client/react"
import { memo } from "react"
import type { ActivityRowFragment } from "./ActivityRow.generated"

// Fragment definition colocated with component
// Following Apollo docs: https://www.apollographql.com/docs/react/data/fragments#colocating-fragments
export const ACTIVITY_ROW_FRAGMENT: TypedDocumentNode<ActivityRowFragment> = gql`
  fragment ActivityRow on Activity {
    __typename
    id
    eventTime
    type
    collection {
      name
      imageUrl
    }
    item {
      name
      imageUrl
    }
    price {
      native {
        unit
        symbol
      }
    }
    from {
      address
    }
    to {
      address
    }
  }
`

type Props = {
  activity: FragmentType<ActivityRowFragment>
}

// Helper to format address (Address scalar is typed as unknown)
function formatAddress(address: unknown): string {
  const addr = address as string
  if (addr && addr.length > 10) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }
  return "Unknown"
}

export const ActivityRow = memo(({ activity: activityRef }: Props) => {
  const activity = useFragment({
    from: activityRef,
    fragment: ACTIVITY_ROW_FRAGMENT,
  }).data

  const getActivityIcon = () => {
    switch (activity.type) {
      case "SALE":
        return "💰"
      case "LISTING":
        return "🏷️"
      case "TRANSFER":
        return "📦"
      case "MINT":
        return "✨"
      case "OFFER":
        return "📝"
      default:
        return "📌"
    }
  }

  const getActivityDescription = () => {
    const itemName = activity.item?.name || "Unknown Item"
    const hasPrice = activity.price?.native?.unit

    switch (activity.type) {
      case "SALE":
        return (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="truncate text-sm font-medium text-gray-900">
              {itemName}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="flex-shrink-0 text-xs text-gray-600">
              {formatAddress(activity.from?.address)} →{" "}
              {formatAddress(activity.to?.address)}
            </span>
            {hasPrice && activity.price && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <span className="flex-shrink-0 text-xs font-semibold text-green-600">
                  {Number(activity.price.native?.unit).toFixed(4)}{" "}
                  {activity.price.native?.symbol}
                </span>
              </>
            )}
          </div>
        )

      case "LISTING":
        return (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="truncate text-sm font-medium text-gray-900">
              {itemName}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="flex-shrink-0 text-xs text-gray-600">
              by {formatAddress(activity.from?.address)}
            </span>
            {hasPrice && activity.price && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <span className="flex-shrink-0 text-xs font-semibold text-blue-600">
                  {Number(activity.price.native?.unit).toFixed(4)}{" "}
                  {activity.price.native?.symbol}
                </span>
              </>
            )}
          </div>
        )

      case "TRANSFER":
        return (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="truncate text-sm font-medium text-gray-900">
              {itemName}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="flex-shrink-0 text-xs text-gray-600">
              {formatAddress(activity.from?.address)} →{" "}
              {formatAddress(activity.to?.address)}
            </span>
          </div>
        )

      case "MINT":
        return (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="truncate text-sm font-medium text-gray-900">
              {itemName}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="flex-shrink-0 text-xs text-gray-600">
              by {formatAddress(activity.to?.address)}
            </span>
          </div>
        )

      case "OFFER":
      case "COLLECTION_OFFER":
      case "TRAIT_OFFER":
        return (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="truncate text-sm font-medium text-gray-900">
              {itemName}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="flex-shrink-0 text-xs text-gray-600">
              by {formatAddress(activity.from?.address)}
            </span>
            {hasPrice && activity.price && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <span className="flex-shrink-0 text-xs font-semibold text-purple-600">
                  {Number(activity.price.native?.unit).toFixed(4)}{" "}
                  {activity.price.native?.symbol}
                </span>
              </>
            )}
          </div>
        )

      default:
        return (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="truncate text-sm font-medium text-gray-900">
              {itemName}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="flex-shrink-0 text-xs text-gray-600">
              {activity.type}
            </span>
          </div>
        )
    }
  }

  const imageUrl = activity.item?.imageUrl || activity.collection?.imageUrl

  // Handle eventTime (typed as unknown but is a DateTime string)
  const timeAgo = (() => {
    try {
      const time = activity.eventTime as string
      return new Date(time).toLocaleTimeString()
    } catch {
      return "Unknown time"
    }
  })()

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-all hover:border-gray-300 hover:shadow">
      {/* Icon/Image */}
      <div className="flex-shrink-0">
        {imageUrl ? (
          <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100">
            <img
              alt="Activity"
              className="h-full w-full object-cover"
              src={imageUrl}
            />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-blue-50 to-purple-50 text-lg">
            {getActivityIcon()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">{getActivityDescription()}</div>

      {/* Time */}
      <div className="flex-shrink-0 text-xs text-gray-500">{timeAgo}</div>
    </div>
  )
})
